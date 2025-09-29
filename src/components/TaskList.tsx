import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { useTasks, useUpdateTaskStatus } from "../features/tasks/useTask";
import { Task } from "../types/task";

const PriorityBadge = ({ priority }: { priority: string }) => {
  const mapPriorityLabel: Record<string, string> = {
    High: "Cao",
    Medium: "Trung bình",
    Low: "Thấp",
  };

  const colorMap: Record<string, string> = {
    Cao: "text-red-500",
    "Trung bình": "text-yellow-500",
    Thấp: "text-green-600",
  };

  const label = mapPriorityLabel[priority] || priority;
  return <span className={`font-semibold ${colorMap[label]}`}>{label}</span>;
};

const LIMIT = 5;
const TOTAL_ROWS = 8;

const TaskList = () => {
  const navigate = useNavigate();
  const user = useUser();

  const { mutate: updateTaskStatus } = useUpdateTaskStatus();
  const [updatingTaskIds, setUpdatingTaskIds] = useState<string[]>([]);

  const {
    data: tasksData,
    isLoading,
    refetch,
  } = useTasks(
    user?.id || "",
    undefined,
    undefined,
    undefined,
    undefined,
    1,
    LIMIT
  );

  const tasks: Task[] = Array.isArray(tasksData?.data) ? tasksData.data : [];
  const emptyRows = TOTAL_ROWS - tasks.length;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold mb-6">Danh sách Task</h1>
        <button
          onClick={() => navigate("/createtask")}
          className="px-4 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-600"
        >
          + Thêm Task
        </button>
      </div>

      {/* Desktop: bảng */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-max w-full text-left">
          <thead>
            <tr className="bg-white border-b">
              <th className="py-3 px-4 text-gray-600">Tên</th>
              <th className="py-3 px-4 text-gray-600">Ưu tiên</th>
              <th className="py-3 px-4 text-gray-600">Deadline</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const completed = task.status === "Done";
              const isUpdating = updatingTaskIds.includes(task.id);

              return (
                <tr key={task.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold text-gray-800">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={completed}
                        disabled={isUpdating}
                        onChange={() => handleToggleStatus(task)}
                        className="w-4 h-4 rounded"
                      />
                      <span className={completed ? "line-through" : ""}>
                        {task.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-medium">
                    {formatDate(task.deadline)}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      className="flex items-center gap-1 text-gray-600 font-semibold hover:underline"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      <span>Xem</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: card view */}
      <div className="space-y-3 md:hidden">
        {tasks.map((task) => {
          const completed = task.status === "Done";
          const isUpdating = updatingTaskIds.includes(task.id);

          return (
            <div
              key={task.id}
              className="p-4 border rounded-lg shadow-sm bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-semibold ${
                    completed ? "line-through text-gray-500" : "text-gray-800"
                  }`}
                >
                  {task.title}
                </span>
                <input
                  type="checkbox"
                  checked={completed}
                  disabled={isUpdating}
                  onChange={() => handleToggleStatus(task)}
                  className="w-4 h-4"
                />
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Ưu tiên: <PriorityBadge priority={task.priority} />
              </div>
              <div className="text-sm text-gray-600">
                Deadline: {formatDate(task.deadline)}
              </div>
              <button
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="mt-2 text-blue-600 font-semibold hover:underline"
              >
                Xem
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskList;
