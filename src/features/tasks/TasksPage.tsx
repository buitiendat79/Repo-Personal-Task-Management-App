import { useState } from "react";
import TaskForm from "../../components/TaskForm";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "./../../hooks/useAuth";

interface TaskInput {
  title: string;
  description: string;
  dueDate: string;
  content: string;
}

export default function TasksPage() {
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  const handleSaveTask = async ({
    title,
    description,
    dueDate,
    content,
  }: TaskInput) => {
    if (!user) {
      alert("Bạn chưa đăng nhập.");
      return;
    }

    const { error } = await supabase.from("tasks").insert({
      title,
      description,
      due_date: dueDate,
      content,
      user_id: user.id,
    });

    if (error) {
      alert("Tạo task thất bại: " + error.message);
      return;
    }

    setShowForm(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Danh sách tasks</h1>
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        + Thêm task
      </button>

      {showForm && (
        <TaskForm
          onSave={handleSaveTask}
          onCancel={() => setShowForm(false)}
          initialData={{}}
          content="todo"
        />
      )}
    </div>
  );
}
