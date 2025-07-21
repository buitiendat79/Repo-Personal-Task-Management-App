import { Task } from "../../types/task";
import StatCard from "./StatCard";
import Chart from "./Chart";

type Props = {
  tasks?: Task[];
};

const TaskStat = ({ tasks = [] }: Props) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.isCompleted).length;
  const pending = tasks.filter((t) => !t.isCompleted).length;
  const highPriority = tasks.filter((t) => t.priority === "Cao").length;

  const stats = [
    { label: "Tổng task", value: total },
    { label: "Đã hoàn thành", value: completed },
    { label: "Chưa hoàn thành", value: pending },
    { label: "Ưu tiên cao", value: highPriority },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      <div className="grid grid-cols-2 gap-4 flex-1">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>
      <div className="flex-1">
        <Chart data={stats} />
      </div>
    </div>
  );
};

export default TaskStat;
