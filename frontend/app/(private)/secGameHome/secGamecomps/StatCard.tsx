export function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="p-6 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900
                    rounded-3xl border border-white/10 items-center flex flex-col">
      <div className="flex justify-center mb-2 transform group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-gray-400">{label}</p>
    </div>
  );
}
