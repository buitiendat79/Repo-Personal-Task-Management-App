import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type Props = {
  data: {
    label: string;
    value: number;
  }[];
};

const COLORS = ["#34d399", "#60a5fa", "#fbbf24", "#f87171"];

const Chart = ({ data }: Props) => {
  return (
    <div className="bg-white rounded-2xl shadow p-4 h-full">
      <h2 className="text-gray-700 font-semibold text-lg mb-4">
        Thống kê tổng quan
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
