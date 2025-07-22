import DashboardLayout from "../layout/DashboardLayout";
import Header from "../components/Header";
import TaskList from "../components/TaskList";
import TaskStat from "../components/TaskStat";
import { mockTasks } from "../mocks/tasks";

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-full gap-4">
        <Header />
        <TaskList />
        <TaskStat />
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
