import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { TaskInput, Priority, Status } from "../../types/task";
import {
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "../../features/tasks/useTask";
import { useNavigate } from "react-router-dom";
import { notifySuccess, notifyError } from "../../utils/notify";
import { useUser } from "@supabase/auth-helpers-react";
import { useState } from "react";

type TaskFormProps = {
  mode: "create" | "edit";
  defaultValues?: TaskInput;
  taskId?: string;
  onSuccess?: () => void;
};

const today = new Date().toISOString().split("T")[0];

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
  deadline: yup
    .string()
    .required("Vui lòng chọn deadline")
    .test("valid-date", "Deadline không hợp lệ", (value) =>
      value ? value >= today : false
    ),
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
    .min(1, "Phải có ít nhất 1 checklist")
    .required("Checklist không được để trống"),
});

export default function TaskForm({
  mode,
  defaultValues,
  taskId,
  onSuccess,
}: TaskFormProps) {
  const navigate = useNavigate();
  const user = useUser();
  const { mutate: createTask, isPending: creating } = useCreateTask();
  const { mutate: updateTask, isPending: updating } = useUpdateTask();
  const { mutate: deleteTask, isPending: deleting } = useDeleteTask();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    control,
    trigger,
  } = useForm<TaskInput>({
    defaultValues: defaultValues || {
      title: "",
      description: "",
      deadline: today,
      priority: "",
      checklist: [],
      status: "To Do",
      user_id: user?.id || "",
    },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const {
    fields: checklistFields,
    append,
    remove,
  } = useFieldArray({ control, name: "checklist" });

  const handleDelete = () => {
    if (!taskId) return;
    deleteTask(taskId, {
      onSuccess: () => {
        notifySuccess("Xoá task thành công!");
        navigate("/tasks");
      },
      onError: (err) => {
        notifyError("Xoá task thất bại: " + err.message);
      },
    });
  };

  const onSubmit = (data: TaskInput) => {
    if (!user?.id) {
      notifyError("Không tìm thấy thông tin người dùng!");
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
    } else {
      if (!taskId) return;
      updateTask(
        { id: taskId, updates: data },
        {
          onSuccess: () => {
            notifySuccess("Cập nhật task thành công!");
            onSuccess?.();
            navigate("/tasks");
          },
          onError: (err) => notifyError("Cập nhật thất bại! " + err.message),
        }
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-lg mx-auto p-6 space-y-5 bg-white rounded-xl shadow"
    >
      <h2 className="text-2xl font-bold text-center">
        {mode === "create" ? "Tạo mới Task" : "Cập nhật Task"}
      </h2>

      <div>
        <label htmlFor="title" className="block mb-1 font-medium">
          Tên task
        </label>
        <input
          id="title"
          {...register("title")}
          className="w-full border rounded p-2"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block mb-1 font-medium">
          Mô tả
        </label>
        <textarea
          id="description"
          {...register("description")}
          className="w-full border rounded p-2 resize-none"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="deadline" className="block mb-1 font-medium">
          Deadline
        </label>
        <input
          id="deadline"
          type="date"
          {...register("deadline")}
          className="w-full border rounded p-2"
          min={today}
        />
        {errors.deadline && (
          <p className="text-red-500 text-sm mt-1">{errors.deadline.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="priority" className="block mb-1 font-medium">
          Ưu tiên
        </label>
        <select
          id="priority"
          {...register("priority")}
          className="w-full border rounded p-2"
        >
          <option value="">-- Chọn mức ưu tiên --</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        {errors.priority && (
          <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>
        )}
      </div>

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
                    {...register(`checklist.${index}.checked`)}
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
                    className="resize-none overflow-hidden w-full text-sm px-2 py-[6px] border border-gray-300 focus:border-gray-500 rounded outline-none transition-all duration-150 leading-[1.4]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-sm border border-gray-300 px-2 py-1 rounded hover:bg-gray-100 transition"
                >
                  Xoá
                </button>
              </div>

              {errors.checklist?.[index]?.content?.message && (
                <p className="text-red-500 text-sm ml-1">
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

      <div className="flex justify-center gap-4 pt-6 flex-wrap flex-row-reverse">
        {/* Huỷ luôn nằm ngoài cùng bên phải */}
        <button
          type="button"
          onClick={() => navigate("/tasks")}
          className={`${
            mode === "edit" ? "w-[140px]" : "w-[220px]"
          } py-2 border border-gray-400 text-gray-700 bg-white rounded-md hover:bg-gray-100`}
        >
          Huỷ
        </button>

        {/* Xoá chỉ hiển thị khi đang ở trang cập nhật */}
        {mode === "edit" && (
          <button
            type="button"
            onClick={() => setShowConfirmDelete(true)}
            disabled={deleting}
            className="w-[140px] py-2 border border-red-500 text-red-600 rounded-md hover:bg-red-50"
          >
            {deleting ? "Đang xoá..." : "Xoá task"}
          </button>
        )}

        <button
          type="submit"
          disabled={!isValid || creating || updating}
          className={`${
            mode === "edit" ? "w-[140px]" : "w-[220px]"
          } py-2 rounded-md text-white transition ${
            !isValid || creating || updating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {mode === "create"
            ? creating
              ? "Đang tạo..."
              : "Tạo task"
            : updating
            ? "Đang cập nhật..."
            : "Cập nhật"}
        </button>
      </div>

      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-md p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Bạn có chắc chắn muốn xoá task này không?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Huỷ
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
              >
                Xác nhận xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
