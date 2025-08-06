import TaskForm from "../../components/TaskForm/index";
import DashboardLayout from "../../layout/DashboardLayout";

export default function TaskPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-200">
        <div className="py-20 px-6">
          <TaskForm />
        </div>
      </div>
    </DashboardLayout>
  );
}
