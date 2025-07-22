import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Đã hoàn thành", value: 8, color: "#353936ff" },
  { name: "Đang làm", value: 5, color: "#747577ff" },
  { name: "Trễ hạn", value: 2, color: "#bd2f2fff" },
];

const total = data.reduce((sum, item) => sum + item.value, 0);

export default function TaskStat() {
  const tableItems = [
    { label: "Tổng số task", value: total },
    { label: "Đã hoàn thành", value: data[0].value, color: "text-green-600" },
    { label: "Đang làm", value: data[1].value, color: "text-blue-600" },
    { label: "Trễ hạn", value: data[2].value, color: "text-red-600" },
  ];

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-semibold mb-6">Dashboard Thống kê nhanh</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-[2] flex gap-[10px]">
          <table className="min-w-[180px] border-separate border-spacing-0">
            <tbody>
              {tableItems.map((item, index) => (
                <tr key={index}>
                  <td
                    className={`
                      border border-gray-250 py-1 px-1 font-medium
                      ${index === 0 ? "rounded-tl-xl" : ""}
                      ${index === tableItems.length - 1 ? "rounded-bl-xl" : ""}
                    `}
                  >
                    {item.label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <table className="min-w-[180px] border-separate border-spacing-0 text-center font-medium">
            <tbody>
              {tableItems.map((item, index) => (
                <tr key={index}>
                  <td
                    className={`
                      border border-gray-250 py-1 px-1
            
                      ${index === 0 ? "rounded-tr-xl" : ""}
                      ${index === tableItems.length - 1 ? "rounded-br-xl" : ""}
                    `}
                  >
                    {item.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex-[3] h-[200px]">
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
