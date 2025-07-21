type Props = {
  label: string;
  value: number;
};

const StatCard = ({ label, value }: Props) => {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  );
};

export default StatCard;
