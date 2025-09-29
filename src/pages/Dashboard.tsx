import DashboardLayout from "../layout/DashboardLayout";
import Header from "../components/Header";
import TaskList from "../components/TaskList";
import TaskStat from "../components/TaskStat";
import { useSelector } from "react-redux";
import { RootState } from "../app/store"; // nhớ chỉnh đúng path

const DashboardPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-full gap-4">
        <Header />
        <TaskList />
        {/* Truyền userId nếu có user */}
        <TaskStat userId={user?.id} />
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
