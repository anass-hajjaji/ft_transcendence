
import { useTranslation } from "@/lib/i18n";

export default function StatsCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
}) {
  return (
    <div
      className="
        group relative rounded-2xl
        border border-white/10
        bg-linear-to-b
        from-gray-900 via-gray-800 to-gray-900
        p-6 h-full
        hover:transition-all hover:duration-300 hover:scale-102 ">
      <div className="relative flex items-start justify-between h-full">
        <div className="flex flex-col justify-between h-full">
          <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold mb-3">
            {title}
          </p>
          <p className="text-4xl font-black text-white tabular-nums tracking-tight">{value}</p>
        </div>
        <div
          className="flex h-16 w-16 items-center justify-center rounded-xl
            bg-emerald-500/10 
            border-2 border-emerald-400/30 ">
          <Icon
            className="
              h-7 w-7 transition-all duration-300
              text-emerald-400 "/>
        </div>
      </div>
    </div>
  );
}

export function StatsCardGame({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
}) {
  const { t } = useTranslation();
  return (
    <div
      className="
        group relative overflow-hidden rounded-2xl
        border-2 border-emerald-500/30 p-8
        h-full min-h-[140px]
        bg-linear-to-b
        from-gray-900 via-gray-800 to-gray-900
        hover:transition-all hover:duration-300 hover:scale-102 ">

      <div className="relative flex items-center justify-between h-full">
        <div className="flex flex-col justify-center">
          <p className="text-5xl font-black text-emerald-300">
            {title}
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white/80">{value}</span>
            <span className="text-xs uppercase tracking-wider text-emerald-400/60 font-bold">{t("Dashboard.games")}</span>
          </div>
        </div>
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl
            bg-emerald-500/15 
            border-2 border-emerald-400/40 ">
          <Icon
            className="
              h-10 w-10 transition-all duration-300
              text-emerald-300 "/>
        </div>
      </div>
    </div>
  );
}
