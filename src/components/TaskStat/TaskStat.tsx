import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Đã hoàn thành", value: 8, color: "#22C55E" },
  { name: "Đang làm", value: 5, color: "#3B82F6" },
  { name: "Trễ hạn", value: 2, color: "#EF4444" },
];

const total = data.reduce((sum, item) => sum + item.value, 0);

export default function TaskStat() {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h1 className="text-xl font-bold mb-6">Dashboard Thống kê nhanh</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 flex gap-5">
          <table className="border border-gray-200 rounded-xl overflow-hidden w-1/4 text-base">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4">Tổng số task</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4">Đã hoàn thành</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4">Đang làm</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Trễ hạn</td>
              </tr>
            </tbody>
          </table>

          {/* Table 2: Số lượng */}
          <table className="border border-gray-200 rounded-xl overflow-hidden w-1/4 text-base font-bold text-right">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4">{total}</td>
              </tr>
              <tr className="border-b border-gray-200 text-green-600">
                <td className="py-3 px-4">{data[0].value}</td>
              </tr>
              <tr className="border-b border-gray-200 text-blue-600">
                <td className="py-3 px-4">{data[1].value}</td>
              </tr>
              <tr className="text-red-600">
                <td className="py-3 px-4">{data[2].value}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Biểu đồ */}
        <div className="flex-1 max-w-[350px] h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                innerRadius={55}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
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
