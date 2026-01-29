import React from "react";
import { PerformanceStats } from "../../home/types";
import { useTranslation } from "@/lib/i18n";

interface Props {
  stats: PerformanceStats;
  winRate: number;
}

function PerfRow({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div className="group">
      <div className="flex items-center justify-between text-sm mb-2">
        <div className="font-semibold text-slate-300">{label}</div>
        <div className="text-white font-bold text-base tabular-nums">{value}</div>
      </div>
      <div className="h-2.5 bg-zinc-900/80 rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full ${colorClass} rounded-full transition-all duration-500 group-hover:brightness-110`}
          style={{ width: `${Math.min(100, value * 10)}%` }}
        />
      </div>
    </div>
  );
}

export default function PerformanceWidget({ stats, winRate }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <div className="relative bg-linear-to-b
                    from-gray-900 via-gray-800 to-gray-900
                    rounded-2xl p-6 border-2 border-white/10">
        
        <div className="relative flex items-center gap-2 mb-5">
          <h4 className="text-xl font-black tracking-tight text-white">{t("Dashboard.Performance")}</h4>
        </div>
        <div className="relative space-y-5">
          <PerfRow
            label={t("Dashboard.Wins")}
            value={stats.wins}
            colorClass="bg-linear-to-r from-emerald-500 to-emerald-400"
          />
          <PerfRow
            label={t("Dashboard.Losses")}
            value={stats.losses}
            colorClass="bg-linear-to-r from-red-500 to-red-400"
          />
          <PerfRow
            label={t("Dashboard.Draws")}
            value={stats.draws}
            colorClass="bg-linear-to-r from-slate-600 to-slate-500"
          />
          
          <div className="pt-3 mt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-slate-300">{t("Dashboard.TotalGames")}</span>
              <span className="text-white text-lg font-bold tabular-nums">{stats.totalGames}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="relative bg-linear-to-br
                    from-gray-900 via-gray-800 to-gray-900
                      backdrop-blur-sm rounded-2xl p-6 border-2 border-white/10 ">
        
        <div className="relative flex items-center gap-2 mb-5">
          <h4 className="text-xl font-black tracking-tight text-white">{t("Dashboard.StatsOverview")}</h4>
        </div>
        
        <div className="relative space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-white/5 ">
            <div className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">{t("Dashboard.TotalGames")}</div>
            <div className="text-white font-black text-lg tabular-nums">{stats.totalGames}</div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-white/5 ">
            <div className="text-sm font-semibold text-slate-300 group-hover:text-emerald-300 transition-colors">{t("Dashboard.Wins")}</div>
            <div className="text-white font-black text-lg tabular-nums">{stats.wins}</div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-white/5 ">
            <div className="text-sm font-semibold text-slate-300 group-hover:text-red-300 transition-colors">{t("Dashboard.Losses")}</div>
            <div className="text-white font-black text-lg tabular-nums">{stats.losses}</div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-white/5 ">
            <div className="text-sm font-bold text-emerald-300">{t("Dashboard.WinRate")}</div>
            <div className="text-white font-black text-xl tabular-nums drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">{winRate}%</div>
          </div>
        </div>
      </div>
    </>
  );
}
