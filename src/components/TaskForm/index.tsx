import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { TaskInput, Priority, Status } from "../../types/task";
import { useCreateTask, useDeleteTask } from "../../features/tasks/useTask";
import { useNavigate, useParams } from "react-router-dom";
import { notifySuccess, notifyError } from "../../utils/notify";
import { useUser } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import { fetchTaskById, updateTask } from "../../api/taskApi";
import { formatDate } from "../../utils/date";
import { supabase } from "../../api/supabaseClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Controller } from "react-hook-form";
import dayjs from "dayjs";
import CustomDateInput from "../CustomDateInput";

type TaskFormProps = {
  mode?: "create" | "edit"; // Chế độ form: tạo mới hoặc sửa task
  onSuccess?: () => void; // Callback khi thao tác thành công
  onDelete?: () => void; // Callback khi xoá task
  // initialData?: TaskInput; // Dữ liệu khởi tạo form (dùng khi edit)
};

// Set ngày mặc định
const today = new Date().toISOString().split("T")[0];

export default function TaskForm({
  mode = "create",
  onSuccess,
  onDelete,
}: // initialData,
TaskFormProps) {
  const navigate = useNavigate();
  const user = useUser();
  const { taskId } = useParams();

  // Validation schema Yup
  const schema = yup.object().shape({
    title: yup
      .string()
      .required("Vui lòng nhập tên task")
      .max(100, "Tên task không được quá dài")
      .test(
        "not-empty",
        "Tên task không được toàn khoảng trắng",
        (value) => value?.trim() !== ""
      ),
    description: yup.string().max(500, "Mô tả không được quá dài").optional(),
    // deadline: yup
    //   .string()
    //   .required("Vui lòng chọn deadline")
    //   .test("valid-date", "Deadline không hợp lệ", (value) =>
    //     // value ? value >= today : false
    //   ),
    deadline: yup
      .string()
      .required("Vui lòng chọn deadline")
      .test("valid-date", "Deadline không hợp lệ", (value) => {
        if (!value) return false;
        const date = dayjs(value, "DD/MM/YYYY");
        return date.isValid() && date.isAfter(dayjs().subtract(1, "day"));
      }),

    priority: yup.string().required("Vui lòng chọn mức ưu tiên"),
    checklist: yup
      .array()
      .of(
        yup.object().shape({
          content: yup
            .string()
            .required("Checklist không được để trống")
            .max(100, "Checklist không được quá dài"),
        })
      )
      .optional(),
    ...(mode === "edit" && {
      status: yup.string().required("Vui lòng chọn trạng thái"),
    }),
  });

  const { mutate: createTask, isPending: creating } = useCreateTask();
  const { mutate: deleteTask } = useDeleteTask();
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);

  // State xoá/cập nhật (Edit mode)
  const [isDeleting, setIsDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  // const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showFirstConfirm, setShowFirstConfirm] = useState(false); // Bước 1
  const [showSecondConfirm, setShowSecondConfirm] = useState(false); // Bước 2

  // Khởi tạo react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    control,
    trigger,
    reset,
  } = useForm<TaskInput>({
    defaultValues: {
      title: "",
      description: "",
      deadline: dayjs().format("DD/MM/YYYY"),
      priority: "",
      checklist: [],
      status: "To Do",
    },
    resolver: yupResolver(schema),
    mode: "onChange", // Validate realtime
    reValidateMode: "onChange", // Đảm bảo validate lại khi form cập nhật
    shouldUnregister: true, // Giúp tránh lỗi validate khi field bị ẩn
  });

  useEffect(() => {
    if (mode === "edit" && taskId) {
      (async () => {
        try {
          const task = await fetchTaskById(taskId);
          if (task) {
            console.log("Dữ liệu task:", task);
            reset({
              title: task.title || "",
              description: task.description || "",
              deadline: task.deadline
                ? dayjs(task.deadline).format("DD/MM/YYYY")
                : dayjs().format("DD/MM/YYYY"),
              priority: task.priority || "",
              checklist: Array.isArray(task.checklist)
                ? task.checklist.map((item) => ({
                    content: item.content || "",
                    checked: item.checked ?? false,
                  }))
                : [],
              status: task.status || "To Do",
            });
            setTimeout(() => trigger(), 0);
          }
        } catch (error) {
          console.error("Lỗi khi tải task:", error);
          notifyError("Không tải được dữ liệu task.");
        }
      })();
    }
  }, [mode, taskId, reset]);

  // Quản lý mảng checklist với useFieldArray
  const {
    fields: checklistFields,
    append,
    remove,
  } = useFieldArray({ control, name: "checklist" });

  // Hàm xử lý submit
  const onSubmit = (data: TaskInput) => {
    if (!user?.id) {
      notifyError("Không tìm thấy thông tin người dùng");
      return;
    }

    if (mode === "create") {
      createTask(
        { ...data, user_id: user.id },
        {
          onSuccess: () => {
            notifySuccess("Tạo task thành công!");
            onSuccess?.();
            navigate("/tasks");
          },
          onError: (err) => notifyError("Tạo task thất bại! " + err.message),
        }
      );
    } else if (mode === "edit" && taskId) {
      setUpdating(true);
      updateTask(taskId, data)
        .then(() => {
          notifySuccess("Cập nhật task thành công!");
          onSuccess?.();
          navigate("/tasks");
        })
        .catch((err) => {
          console.error("Lỗi khi cập nhật:", err);
          notifyError("Cập nhật task thất bại! " + err.message);
        })
        .finally(() => {
          setUpdating(false);
        });
    }
  };

  const handleConfirmDelete = () => {
    if (!taskId) return;

    setIsDeleting(true);

    deleteTask(taskId, {
      onSuccess: () => {
        notifySuccess("Xoá task thành công!");
        navigate("/tasks");
      },
      onError: (err) => {
        notifyError("Xoá task thất bại!");
        console.error(err);
      },
      onSettled: () => {
        setIsDeleting(false);
        setShowConfirmDelete(false);
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-lg mx-auto p-6 space-y-5 bg-white rounded-xl shadow"
    >
      <h2 className="text-2xl font-bold text-center">
        {mode === "create" ? "Tạo mới Task" : "Cập nhật Task"}
      </h2>

      {mode === "edit" && (
        <div>
          <label htmlFor="status" className="block mb-1 font-medium">
            Trạng thái
          </label>
          <select
            id="status"
            {...register("status")}
            className="w-[200px] border rounded p-2 text-sm"
          >
            <option value="To Do">Chưa hoàn thành</option>
            <option value="In Progress">Đang làm</option>
            <option value="Done">Đã hoàn thành</option>
          </select>
          {errors.status && (
            <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block mb-1 font-medium">
          Tên task
        </label>
        <input
          id="title"
          {...register("title")}
          className="w-full border rounded p-2 text-sm"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1" data-testid="error-title">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block mb-1 font-medium">
          Mô tả
        </label>
        <textarea
          id="description"
          {...register("description")}
          className="w-full border rounded p-2 resize-none text-sm"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Deadline */}
      {mode === "create" ? (
        <div className="w-full">
          <label htmlFor="deadline" className="block mb-1 font-medium">
            Deadline
          </label>
          <Controller
            name="deadline"
            control={control}
            render={({ field }) => (
              <div className="w-full">
                <DatePicker
                  id="deadline"
                  selected={
                    field.value
                      ? dayjs(field.value, "DD/MM/YYYY").toDate()
                      : null
                  }
                  onChange={(date) => {
                    const formatted = date
                      ? dayjs(date).format("DD/MM/YYYY")
                      : "";
                    field.onChange(formatted);
                  }}
                  dateFormat="dd/MM/yyyy"
                  calendarClassName="z-50"
                  showPopperArrow={false}
                  wrapperClassName="w-full"
                  popperPlacement="bottom-end"
                  customInput={<CustomDateInput />}
                />
              </div>
            )}
          />
          {errors.deadline && (
            <p
              className="text-red-500 text-sm mt-1"
              data-testid="error-deadline"
            >
              {errors.deadline.message}
            </p>
          )}
        </div>
      ) : (
        <div className="mb-4">
          <label htmlFor="deadline" className="block mb-1 font-medium">
            Deadline
          </label>
          <div className="w-full flex justify-end">
            <Controller
              name="deadline"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="deadline"
                  selected={
                    field.value
                      ? dayjs(field.value, "DD/MM/YYYY").toDate()
                      : null
                  }
                  onChange={(date) => {
                    const formatted = date
                      ? dayjs(date).format("DD/MM/YYYY")
                      : "";
                    field.onChange(formatted);
                  }}
                  dateFormat="dd/MM/yyyy"
                  calendarClassName="z-50"
                  showPopperArrow={false}
                  popperPlacement="bottom-end"
                  customInput={
                    <div className="w-[200px] relative">
                      <input
                        className="w-full border rounded p-2 text-sm pr-10 cursor-pointer"
                        value={field.value}
                        readOnly
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                        📅
                      </div>
                    </div>
                  }
                />
              )}
            />
          </div>

          {errors.deadline && (
            <p
              className="text-red-500 text-sm mt-1 text-right"
              data-testid="error-deadline"
            >
              {errors.deadline.message}
            </p>
          )}
        </div>
      )}

      {/* Ưu tiên */}
      {mode === "create" ? (
        <div>
          <label htmlFor="priority" className="block mb-1 font-medium">
            Ưu tiên
          </label>
          <select
            id="priority"
            {...register("priority")}
            className="w-full border rounded p-2 text-sm"
          >
            <option value="">-- Chọn mức ưu tiên --</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          {errors.priority && (
            <p
              className="text-red-500 text-sm mt-1"
              data-testid="priority-select"
            >
              {errors.priority.message}
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between mb-4">
          <label htmlFor="priority" className="font-medium">
            Ưu tiên
          </label>
          <select
            id="priority"
            {...register("priority")}
            className="w-[200px] border rounded p-2 text-sm"
          >
            <option value="">-- Chọn mức ưu tiên --</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          {errors.priority && (
            <p
              className="text-red-500 text-sm mt-1 text-right"
              data-testid="priority-select"
            >
              {errors.priority.message}
            </p>
          )}
        </div>
      )}

      <div>
        <label className="block mb-1 font-medium">Checklist</label>
        <div className="space-y-3 mt-2">
          {checklistFields.map((field, index) => (
            <div key={field.id} className="w-full max-w-md flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded shrink-0"
                    {...register(`checklist.${index}.checked`)} //  Placeholder luu state checkbox
                  />
                  <textarea
                    {...register(`checklist.${index}.content`)}
                    placeholder={`Item ${index + 1}`}
                    rows={1}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height = target.scrollHeight + "px";
                    }}
                    onBlur={() => {
                      trigger(`checklist.${index}.content`);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        (e.target as HTMLTextAreaElement).blur();
                      }
                    }}
                    className="resize-none overflow-hidden w-full text-sm px-2 py-[6px] border border-transparent focus:border-gray-400 rounded outline-none transition-all duration-150 leading-[1.4]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-sm text-800 hover:underline whitespace-nowrap"
                >
                  Xoá
                </button>
              </div>

              {errors.checklist?.[index]?.content?.message && (
                <p
                  className="text-red-500 text-sm ml-1"
                  data-testid={`error-checklist-${index}`}
                >
                  Checklist {index + 1}:{" "}
                  {errors.checklist[index].content.message}
                </p>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => append({ content: "" })}
          className="text-blue-600 text-sm mt-3 hover:underline"
        >
          + Thêm checklist
        </button>
      </div>

      {/* Create mode */}
      <div className="flex justify-center gap-6 pt-6">
        {mode === "create" ? (
          <>
            <button
              type="submit"
              disabled={!isValid || creating}
              className={`w-[220px] py-3 rounded-md text-white font-semibold transition ${
                !isValid || creating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {creating ? "Đang tạo..." : "Tạo mới"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/tasks")}
              className="w-[220px] py-3 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-100 font-semibold"
            >
              Huỷ
            </button>
          </>
        ) : (
          <>
            {/* Edit mode */}

            {/* Nút cập nhật */}
            <button
              type="submit"
              disabled={!isValid || updating}
              className={`w-[140px] py-2 rounded-md text-white font-semibold transition ${
                !isValid || updating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {updating ? "Đang cập nhật..." : "Cập nhật"}
            </button>

            {/* Nút Xóa */}
            <button
              type="button"
              onClick={() => setShowFirstConfirm(true)}
              className="w-[140px] border border-red-500 text-red-500 px-4 py-2 rounded-md hover:bg-red-100"
            >
              Xoá task
            </button>

            {/* Nút Hủy */}
            <button
              type="button"
              onClick={() => navigate("/tasks")}
              className="w-[140px] py-2 border border-gray-400 text-gray-700 bg-white rounded-md hover:bg-gray-100 font-semibold"
            >
              Huỷ
            </button>
          </>
        )}
      </div>
      {showFirstConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-6">
              Bạn có chắc chắn muốn xoá task này không?
            </h2>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
                onClick={() => setShowFirstConfirm(false)}
              >
                Không
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={() => {
                  setShowFirstConfirm(false);
                  setShowSecondConfirm(true);
                }}
              >
                Có
              </button>
            </div>
          </div>
        </div>
      )}

      {showSecondConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-6">
              Hành động này không thể hoàn tác
            </h2>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
                onClick={() => setShowSecondConfirm(false)}
              >
                Huỷ
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
              >
                {isDeleting ? "Đang xoá..." : "Xoá"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
