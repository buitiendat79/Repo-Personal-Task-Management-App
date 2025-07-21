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

const LIMIT = 8;

const TasksPage = () => {
  const user = useUser();
  const userId = user?.id || "";
  const navigate = useNavigate();

  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [startDate, endDate] = dateRange;
  const [page, setPage] = useState(1);
  const [filterError, setFilterError] = useState("");
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  const {
    data: tasksResponse,
    isLoading,
    isError,
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

  useEffect(() => {
    setPage(1);
    if (startDate && endDate && startDate > endDate) {
      setFilterError("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
    } else {
      setFilterError("");
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (search === "") {
      setFilterError("");
    }
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

  const toggleCompleted = (taskId: string) => {
    setCompletedMap((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const showErrorMessage = () => {
    if (filterError) return filterError;
    if (startDate && endDate && endDate < startDate) {
      return "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc";
    }
    if (isError) return "Có lỗi xảy ra, vui lòng thử lại sau";
    if (tasksResponse && tasksResponse.data.length === 0)
      return "Không tìm thấy task nào phù hợp với điều kiện lọc/tìm kiếm";
    return "";
  };

  const errorMessage = showErrorMessage();

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Danh sách Task</h1>

        <div className="bg-white p-6 rounded shadow">
          <form className="flex flex-wrap gap-4 items-end mb-6 relative z-10">
            <div className="relative w-[520px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm task..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border w-full pl-10 pr-3 py-2 rounded text-sm text-gray-700"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border px-4 py-2 rounded text-sm text-gray-500"
            >
              <option value="all">Trạng thái</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="border px-3 py-2 rounded text-sm text-gray-500"
            >
              <option value="all">Ưu tiên</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <div className="relative basis-[180px] z-50">
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update: [Date | null, Date | null]) =>
                  setDateRange(update)
                }
                placeholderText="Đến ngày"
                className="border px-3 py-2 rounded text-sm text-gray-500 w-full"
                dateFormat="dd/MM/yyyy"
                isClearable
                popperPlacement="bottom-start"
                popperClassName="z-[9999]"
                wrapperClassName="w-full"
                popperModifiers={[
                  {
                    name: "offset",
                    options: {
                      offset: [0, 10],
                    },
                  },
                ]}
              />
            </div>
          </form>

          {errorMessage ? (
            <div className="text-center text-red-600 font-medium py-10">
              {errorMessage}
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-600" size={24} />
            </div>
          ) : (
            <div className="border rounded overflow-hidden bg-white">
              <table className="w-full text-sm">
                <thead className="bg-white text-left border-b">
                  <tr className="text-sm text-gray-800">
                    <th className="p-3"></th>
                    <th className="p-3 font-semibold text-base">Tên task</th>
                    <th className="p-3 font-semibold text-base">Ưu tiên</th>
                    <th className="p-3 font-semibold text-base">Đến ngày</th>
                    <th className="p-3 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {tasksResponse?.data.map((task: Task) => {
                    const isCompleted = completedMap[task.id] || false;
                    return (
                      <tr key={task.id} className="border-t">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => toggleCompleted(task.id)}
                          />
                        </td>
                        <td
                          className={`p-3 font-medium ${
                            isCompleted ? "line-through text-gray-400" : ""
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
                    className="px-3 py-1 text-base font-medium text-gray-600 rounded"
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
