// src/pages/tasks/TasksPage.tsx
import React, { useState, useEffect } from "react";
import { useTasks, useUpdateTaskStatus } from "./useTask";
import { useUser } from "@supabase/auth-helpers-react";
import { Task } from "../../types/task";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import { FiSearch } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";

const LIMIT = 9;

const TasksPage = () => {
  const user = useUser();
  const userId = user?.id || "";
  const navigate = useNavigate();

  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [search, setSearch] = useState("");
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [page, setPage] = useState(1);
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
    endDate ? dayjs(endDate).format("YYYY-MM-DD") : "",
    search,
    page,
    LIMIT
  );

  const totalPages = Math.ceil((tasksResponse?.total || 0) / LIMIT);

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
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

  const showErrorMessage = () => {
    if (isError) return "Có lỗi xảy ra, vui lòng thử lại sau";
    if (tasksResponse && tasksResponse.data.length === 0)
      return "Không tìm thấy task nào phù hợp với điều kiện lọc/tìm kiếm";
    return "";
  };

  const errorMessage = showErrorMessage();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-200 py-4 px-2">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mt-6 px-1 mb-6">
            <h1 className="text-4xl font-bold">Danh sách Task</h1>
            <button
              onClick={() => navigate("/createtask")}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-2 px-4 rounded-md shadow transition"
            >
              + Tạo mới task
            </button>
          </div>

          {/* Bộ lọc */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <form className="flex flex-wrap items-end gap-4 mb-6 w-full">
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

              <div className="relative w-[200px] z-[9999]">
                <DatePicker
                  selected={endDate}
                  onChange={handleEndDateChange}
                  placeholderText="Đến ngày"
                  dateFormat="dd/MM/yyyy"
                  className="h-[39px] w-full border px-3 rounded text-sm text-gray-500"
                />
              </div>
            </form>

            {/* Nội dung */}
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
              <div className="border rounded bg-white min-h-[600px] flex flex-col justify-between">
                {/* Desktop table */}
                <div className="hidden md:block">
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
                                onClick={() =>
                                  navigate(`/tasks/${task.id}/edit`)
                                }
                              >
                                Sửa
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Placeholder rows để fill đủ 9 slot */}
                      {Array.from({
                        length: Math.max(
                          0,
                          LIMIT - (tasksResponse?.data.length || 0)
                        ),
                      }).map((_, idx) => (
                        <tr key={`placeholder-${idx}`} className="border-t">
                          <td className="p-3">&nbsp;</td>
                          <td className="p-3">&nbsp;</td>
                          <td className="p-3">&nbsp;</td>
                          <td className="p-3">&nbsp;</td>
                          <td className="p-3">&nbsp;</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="block md:hidden">
                  <div className="grid gap-4 p-4">
                    {tasksResponse?.data.map((task: Task) => {
                      const isUpdating = updatingTaskIds.includes(task.id);
                      const isCompleted = task.status === "Done";

                      return (
                        <div
                          key={task.id}
                          className="border rounded-lg p-4 shadow-sm bg-white flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isCompleted}
                                disabled={isUpdating}
                                onChange={() => handleToggleStatus(task)}
                              />
                              <h2
                                className={`font-bold text-base ${
                                  isCompleted
                                    ? "line-through text-gray-600"
                                    : ""
                                }`}
                              >
                                {task.title}
                              </h2>
                            </div>
                            <button
                              className="px-3 py-1 border border-blue-600 text-blue-600 rounded-md text-xs font-medium transition hover:bg-blue-50"
                              onClick={() => navigate(`/tasks/${task.id}/edit`)}
                            >
                              Sửa
                            </button>
                          </div>
                          <div className="flex justify-between items-center text-sm text-gray-600">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${getPriorityClass(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>
                            <span>
                              {task.deadline
                                ? dayjs(task.deadline).format("DD/MM/YYYY")
                                : "--"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pagination */}
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
                      className={`px-3 py-1 text-base font-medium rounded ${
                        page === idx + 1
                          ? "text-lg font-bold text-gray-800"
                          : "text-gray-400"
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
    </DashboardLayout>
  );
};

export default TasksPage;
