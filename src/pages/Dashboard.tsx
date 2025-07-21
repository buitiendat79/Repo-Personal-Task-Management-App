import DashboardLayout from "../layout/DashboardLayout";
import Header from "../components/Header";
import TaskList from "../components/TaskList";
import TaskStat from "../components/TaskStat";
import { mockTasks } from "../mocks/tasks";

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <Header />
      <div className="px-6 py-4 flex-1 overflow-y-auto">
        <TaskList tasks={mockTasks} />
        <TaskStat tasks={mockTasks} />
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
