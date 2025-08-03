import { useParams } from "react-router-dom";
import { useTask } from "../../features/tasks/useTask";
import TaskForm from "../../components/TaskForm/index";
import { Task } from "../../types/task";
import { notifyError } from "../../utils/notify";
import { useEffect } from "react";

export default function EditTaskPage() {
  const { taskId } = useParams();
  const { data: task, isLoading, error, isError } = useTask(taskId || "");

  useEffect(() => {
    if (!isLoading && (isError || !task)) {
      notifyError("Có lỗi xảy ra khi tải task. Vui lòng thử lại sau.");
    }
  }, [isError, task, isLoading]);

  if (isLoading) {
    return <p className="text-center mt-10">Đang tải task...</p>;
  }

  if (isError || !task) {
    return (
      <p className="text-center text-red-500 mt-10">
        Không thể tải task. Vui lòng kiểm tra lại.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-20 px-4">
      <TaskForm mode="edit" defaultValues={task as Task} />
    </div>
  );
}
