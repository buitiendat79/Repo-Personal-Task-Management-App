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
  // const [filterError, setFilterError] = useState(""); // ❌ Không còn dùng nữa
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
    // if (startDate && endDate && startDate > endDate) {
    //   setFilterError("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
    // } else {
    //   setFilterError("");
    // }
  }, [startDate, endDate]);

  useEffect(() => {
    setPage(1);
    // if (search === "") setFilterError(""); //
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
    // if (filterError) return filterError; //
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
            className="bg-yellow-400 border-red-50 hover:bg-yellow-300 text-black font-semibold py-2 px-4 rounded-md shadow transition"
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
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
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
                onChange={(date: Date | null) =>
                  setDateRange([new Date(), date])
                }
                placeholderText="Đến ngày"
                className="border px-3 py-2 rounded text-sm text-gray-500 w-full"
                dateFormat="dd/MM/yyyy"
                isClearable
                popperPlacement="bottom-start"
                popperClassName="z-[9999]"
                wrapperClassName="w-full"
                usePortal
                minDate={new Date()}
                popperModifiers={[
                  {
                    name: "offset",
                    options: {
                      offset: [0, 12],
                    },
                  },
                  {
                    name: "preventOverflow",
                    options: {
                      boundary: "viewport",
                    },
                  },
                  {
                    name: "flip",
                    options: {
                      enabled: true,
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
                    className={`px-3 py-1 text-base font-medium rounded ${
                      page === idx + 1
                        ? "text-lg font-semibold"
                        : "text-gray-800"
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
