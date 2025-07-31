import React, { useState, useEffect } from "react";
import { useTasks } from "./useTask";
import { useUser } from "@supabase/auth-helpers-react";
import { Task } from "../../types/task";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import { FiSearch } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { useUpdateTaskStatus } from "./useTask";

const LIMIT = 8;

const TasksPage = () => {
  const user = useUser();
  const userId = user?.id || "";
  const navigate = useNavigate();

  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [search, setSearch] = useState("");
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [endDateError, setEndDateError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  // const [filterError, setFilterError] = useState(""); //
  // const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  // const { mutate: toggleTaskCompleted } = useToggleTaskCompleted();
  const { mutate: updateTaskStatus } = useUpdateTaskStatus();
  const [updatingTaskIds, setUpdatingTaskIds] = useState<string[]>([]);

  const {
    data: tasksResponse,
    isLoading,
    isError,
    refetch,
  } = useTasks(
    userId,
    status,
    priority,
    endDate ? endDate.toISOString().split("T")[0] : "",
    search,
    page,
    LIMIT
  );

  const totalPages = Math.ceil((tasksResponse?.total || 0) / LIMIT);

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    if (date && dayjs(date).isBefore(dayjs(), "day")) {
      setEndDateError("Ngày không hợp lệ");
    } else {
      setEndDateError(null);
    }
  };

  const handleToggleStatus = (task: Task) => {
    const newStatus = task.status === "Done" ? "To Do" : "Done";

    setUpdatingTaskIds((prev) => [...prev, task.id]);

    updateTaskStatus(
      { taskId: task.id, status: newStatus },
      {
        onSuccess: () => {
          refetch();
        },
        onSettled: () => {
          // Xóa task khỏi danh sách đang cập nhật
          setUpdatingTaskIds((prev) => prev.filter((id) => id !== task.id));
        },
      }
    );
  };
  useEffect(() => {
    setPage(1);
  }, [search, status, priority]);

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Low":
        return "bg-green-100 text-green-700";
      default:
        return "";
    }
  };

  // const toggleCompleted = (task: Task) => {
  //   const newCompleted = !task.completed;
  //   const newStatus = newCompleted ? "Done" : "To Do";

  //   toggleTaskCompleted({
  //     taskId: task.id,
  //     completed: newCompleted,
  //   });

  //   updateTaskStatus({
  //     taskId: task.id,
  //     status: newStatus,
  //   });
  // };

  // const toggleCompleted = (task: Task) => {
  //   const isCurrentlyDone = task.status === "Done";
  //   const newStatus = isCurrentlyDone ? "To Do" : "Done";

  //   updateTaskStatus({
  //     taskId: task.id,
  //     status: newStatus,
  //   });
  // };

  const showErrorMessage = () => {
    if (endDateError) return endDateError;
    if (isError) return "Có lỗi xảy ra, vui lòng thử lại sau";
    if (tasksResponse && tasksResponse.data.length === 0)
      return "Không tìm thấy task nào phù hợp với điều kiện lọc/tìm kiếm";
    return "";
  };

  const errorMessage = showErrorMessage();

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center max-w-5xl mx-auto mt-6 px-1 mb-6">
          <h1 className="text-4xl font-bold">Danh sách Task</h1>

          <button
            onClick={() => navigate("/createtask")}
            className="bg-yellow-400 border-red-100 hover:bg-yellow-300 text-black font-semibold py-2 px-4 rounded-md shadow transition"
          >
            + Tạo mới task
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <form className="flex flex-wrap items-end gap-4 mb-6 w-full overflow-visible">
            <div className="relative flex-1 min-w-[250px] max-w-[520px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm task..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border w-full pl-10 pr-3 py-2 rounded text-sm text-gray-700"
              />
            </div>

            <div className="min-w-[120px]">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border px-4 py-2 rounded text-sm text-gray-500 w-full"
              >
                <option value="all">Trạng thái</option>
                <option value="To Do">Chưa hoàn thành</option>
                <option value="In Progress">Đang làm</option>
                <option value="Done">Đã hoàn thành</option>
              </select>
            </div>

            <div className="min-w-[120px]">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="border px-3 py-2 rounded text-sm text-gray-500 w-full"
              >
                <option value="all">Ưu tiên</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="relative w-[200px] z-[9999] overflow-visible">
              <DatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                placeholderText="Đến ngày"
                dateFormat="dd/MM/yyyy"
                className="h-[39px] w-full border border-gray-300 px-3 rounded-md text-sm text-gray-700"
              />
            </div>
          </form>

          {errorMessage ? (
            <div className="text-center text-red-600 font-medium py-10">
              {errorMessage}
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2
                data-testid="loading-spinner"
                className="animate-spin text-blue-600"
                size={24}
              />
            </div>
          ) : (
            <div className="border rounded overflow-hidden bg-white">
              <table className="w-full table-fixed text-sm">
                <thead className="bg-white text-left border-b">
                  <tr className="text-sm text-gray-800">
                    <th className="w-[40px] px-3"></th>
                    <th className="px-4 py-3 font-medium text-lg w-[50%]">
                      Tên task
                    </th>
                    <th className="px-4 py-3 font-medium text-lg w-[20%]">
                      Ưu tiên
                    </th>
                    <th className="px-4 py-3 font-medium text-lg w-[20%]">
                      Đến ngày
                    </th>
                    <th className="px-4 py-3 text-center w-[10%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {tasksResponse?.data.map((task: Task) => {
                    const isUpdating = updatingTaskIds.includes(task.id);
                    // const isCompleted = isUpdating
                    //   ? task.status !== "Done"
                    //   : task.status === "Done";
                    const isCompleted = task.status === "Done";

                    return (
                      <tr key={task.id} className="border-t">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            disabled={isUpdating}
                            onChange={() => handleToggleStatus(task)}
                          />
                        </td>
                        <td
                          className={`p-3 font-bold ${
                            isCompleted ? "line-through text-gray-600" : ""
                          }`}
                        >
                          {task.title}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 text-sm font-semibold rounded ${getPriorityClass(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="p-3 text-sm">
                          {task.deadline
                            ? dayjs(task.deadline).format("DD/MM/YYYY")
                            : "--"}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            className="px-3 py-1 border border-blue-600 text-blue-600 rounded-md text-sm font-medium transition-all duration-150 hover:bg-blue-50 active:scale-95"
                            onClick={() => navigate(`/tasks/${task.id}/edit`)}
                          >
                            Sửa
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {tasksResponse &&
                    tasksResponse.data.length < LIMIT &&
                    Array.from({
                      length: LIMIT - tasksResponse.data.length,
                    }).map((_, idx) => (
                      <tr key={`empty-${idx}`} className="border-t h-[52px]">
                        <td colSpan={5}></td>
                      </tr>
                    ))}
                </tbody>
              </table>

              <div className="flex justify-center items-center gap-2 py-4 border-t bg-white">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-2 py-1 text-gray-600 text-base font-medium rounded disabled:opacity-30"
                >
                  &lt;
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPage(idx + 1)}
                    className={`px-3 py-1 text-base font-medium text-gray-800 rounded ${
                      page === idx + 1 ? "text-lg font-bold" : "text-gray-400"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-2 py-1 text-base font-medium text-gray-600 rounded disabled:opacity-30"
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
