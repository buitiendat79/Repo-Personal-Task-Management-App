import { useState } from "react";
import { notifyError } from "../utils/notify";

export interface TaskData {
  title: string;
  description: string;
  dueDate: string;
  content: string;
}

interface TaskFormProps {
  onSave: (data: TaskData) => void;
  onCancel: () => void;
  initialData?: Partial<Omit<TaskData, "content">>;
  content: string;
}

export default function TaskForm({
  onSave,
  onCancel,
  initialData = {},
  content,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialData.title || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [dueDate, setDueDate] = useState(initialData.dueDate || "");
  const [loading, setLoading] = useState(false);

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!title.trim()) {
      notifyError("Tên task là bắt buộc.");
      setLoading(false);
      return;
    }

    await onSave({ title, description, dueDate, content });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4">Tạo task mới</h2>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Tên task:</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Mô tả</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Deadline</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Tạo task mới"}
          </button>
        </div>
      </form>
    </div>
  );
}
