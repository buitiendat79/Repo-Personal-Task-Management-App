// pages/TaskDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { fetchTaskById, deleteTask } from "../../api/taskApi";
import { TaskInput } from "../../types/task";
import { formatDate } from "../../utils/date";
import { notifySuccess, notifyError } from "../../utils/notify";
import DashboardLayout from "../../layout/DashboardLayout";

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { style: string; label: string }> = {
    "To Do": { style: "bg-gray-300 text-black", label: "Chưa hoàn thành" },
    "In Progress": { style: "bg-yellow-300 text-black", label: "Đang làm" },
    Done: { style: "bg-green-300 text-black", label: "Hoàn thành" },
  };

  const { style, label } = map[status] || {
    style: "bg-gray-200 text-black",
    label: status,
  };

  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded font-medium text-sm ${style}`}
    >
      {label}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const map: Record<string, string> = {
    High: "bg-red-500 text-white",
    Medium: "bg-yellow-500 text-white",
    Low: "bg-green-500 text-white",
  };
  const style = map[priority] || "bg-gray-200 text-black";
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded font-medium text-sm ${style}`}
    >
      {priority}
    </span>
  );
};

export default function TaskDetailPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    setLoading(true);
    fetchTaskById(taskId)
      .then((data) => setTask(data))
      .catch((err) => {
        console.error("Lỗi khi lấy chi tiết task:", err);
        notifyError("Không tải được chi tiết task.");
      })
      .finally(() => setLoading(false));
  }, [taskId]);

  const handleDelete = () => {
    if (!taskId) return;
    if (!confirm("Bạn có chắc chắn muốn xóa task này?")) return;

    setDeleting(true);
    deleteTask(taskId)
      .then(() => {
        notifySuccess("Xóa task thành công!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      })
      .catch((err) => {
        console.error(err);
        notifyError("Xóa task thất bại!");
      })
      .finally(() => setDeleting(false));
  };

  if (loading) return <p className="text-center mt-10">Đang tải...</p>;
  if (!task)
    return (
      <p className="text-center mt-10 text-red-500">Không tìm thấy task</p>
    );

  return (
    <DashboardLayout>
      <div className="bg-gray-200 min-h-screen py-24">
        <div className="max-w-lg mx-auto p-6 space-y-6 bg-white rounded-xl shadow">
          <h1 className="text-3xl font-bold">Chi tiết Task</h1>

          <div className="grid grid-cols-[auto,1fr] gap-x-6 gap-y-2 text-gray-800">
            <span className="font-normal">Tên task:</span>
            <span className="font-semibold">{task.title}</span>

            <span className="font-normal">Mô tả:</span>
            <span className="font-semibold">{task.description || "-"}</span>

            <span className="font-normal">Trạng thái:</span>
            <div className="w-fit">
              <StatusBadge status={task.status} />
            </div>

            <span className="font-normal">Ưu tiên:</span>
            <div className="w-fit">
              <PriorityBadge priority={task.priority} />
            </div>

            <span className="font-normal">Deadline:</span>
            <span className="font-semibold">
              {task.deadline ? formatDate(task.deadline) : "-"}
            </span>

            <span className="font-normal">Ngày tạo:</span>
            <span className="font-semibold">
              {task.created_at ? formatDate(task.created_at) : "-"}
            </span>

            <span className="font-normal">Checklist:</span>
            <div className="space-y-1">
              {task.checklist?.length ? (
                task.checklist.map((item, idx) => (
                  <p key={idx} className="font-semibold">
                    {item.content}
                  </p>
                ))
              ) : (
                <p>-</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-6 pt-4 border-t">
            <button
              onClick={() => navigate(`/tasks/${taskId}/edit`)}
              className="px-8 py-2 bg-blue-600 text-white rounded-md text-hover:bg-blue-700 font-semibold"
            >
              Sửa
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-8 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 font-semibold disabled:opacity-50"
            >
              {deleting ? "Đang xóa..." : "Xóa"}
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-2 border border-black text-black rounded-md hover:bg-gray-100 font-semibold"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
