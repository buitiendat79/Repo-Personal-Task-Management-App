import { useParams } from "react-router-dom";
import { useTask } from "../../features/tasks/useTask";
import TaskForm from "../../components/TaskForm/index";
import { Task } from "../../types/task";
import { notifyError } from "../../utils/notify";

export default function EditTaskPage() {
  const { taskId } = useParams();

  const { data: task, isLoading, error } = useTask(taskId || "");

  if (isLoading) {
    return <p className="text-center mt-10">Đang tải task...</p>;
  }

  if (error || !task) {
    notifyError("Có lỗi xảy ra khi cập nhật/xoá task, vui lòng thử lại sau");
    return (
      <p className="text-center text-red-500 mt-10">
        Có lỗi xảy ra khi cập nhật/xoá task, vui lòng thử lại sau
      </p>
    );
  }

  return <TaskForm mode="edit" defaultValues={task as Task} />;
}
