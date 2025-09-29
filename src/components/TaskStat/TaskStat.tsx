// components/TaskStat/TaskStat.tsx
import { useTaskStats } from "../../features/tasks/useTask";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export default function TaskStat({ userId }: { userId?: string }) {
  const { data, isLoading, error } = useTaskStats(userId);

  if (!userId) return null; // chưa có user → không render
  if (isLoading) return <div>Đang tải thống kê…</div>;
  if (error) return <div>Lỗi khi tải thống kê</div>;
  if (!data) return null;

  const chartData = [
    { name: "Đã hoàn thành", value: data.done, color: "#61777aff" },
    { name: "Đang làm", value: data.inProgress, color: "#698b97ff" },
    { name: "Trễ hạn", value: data.overdue, color: "#db7e44ff" },
  ];
  const tableItems = [
    { label: "Tổng số task", value: data.total },
    { label: "Đã hoàn thành", value: data.done, color: "text-green-600" },
    { label: "Đang làm", value: data.inProgress, color: "text-blue-600" },
    { label: "Trễ hạn", value: data.overdue, color: "text-red-600" },
  ];

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-semibold mb-6">Dashboard Thống kê nhanh</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-[2] flex gap-[10px]">
          <table className="min-w-[180px] border-separate border-spacing-0">
            <tbody>
              {tableItems.map((item, i) => (
                <tr key={i}>
                  <td className="border border-gray-250 py-1 px-1 font-medium">
                    {item.label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="min-w-[180px] border-separate border-spacing-0 text-center font-medium">
            <tbody>
              {tableItems.map((item, i) => (
                <tr key={i}>
                  <td className="border border-gray-250 py-1 px-1">
                    {item.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="w-full h-64 md:flex-[3] md:h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                innerRadius={55}
                paddingAngle={2}
              >
                {chartData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
