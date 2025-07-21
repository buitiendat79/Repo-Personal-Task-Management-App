import React from "react";
import { FiEdit3 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { mockTasks } from "../mocks/tasks";

const PriorityBadge = ({ priority }: { priority: string }) => {
  const colorMap = {
    Cao: "text-red-500",
    "Trung bình": "text-yellow-500",
    Thấp: "text-green-600",
  };

  return (
    <span className={`font-semibold ${colorMap[priority]}`}>{priority}</span>
  );
};

const TaskList = () => {
  const navigate = useNavigate();
  const totalRows = 8;
  const today = new Date();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  const emptyRows = totalRows - mockTasks.length;

  const getStatus = (isCompleted: boolean, deadline: string) => {
    if (isCompleted) return "Hoàn thành";
    const dl = new Date(deadline);
    return dl >= today ? "Đang làm" : "Trễ hạn";
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Danh sách Task</h2>
        <button
          onClick={() => navigate("/createtask")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          + Thêm Task
        </button>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="bg-white border-b">
            <th className="py-3 px-4 text-gray-600">Tên</th>
            <th className="py-3 px-4 text-gray-600">Ưu tiên</th>
            <th className="py-3 px-4 text-gray-600">Deadline</th>
            <th className="py-3 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {mockTasks.map((task) => (
            <tr key={task.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 font-semibold text-gray-800">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    readOnly
                    className="w-4 h-4 rounded"
                  />
                  <span>{task.title}</span>
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
                  className="flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                  onClick={() => navigate(`/tasks/${task.id}`)}
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span>Xem</span>
                </button>
              </td>
            </tr>
          ))}

          {Array.from({ length: emptyRows }).map((_, idx) => (
            <tr key={`empty-${idx}`} className="border-b h-[56px]">
              <td colSpan={4} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;
