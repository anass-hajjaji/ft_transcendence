import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { GameTypeData } from "../../home/types";
import { useTranslation } from "@/lib/i18n";

const PIE_COLORS = ["#10B981", "#3B82F6"];

interface Props {
  data: GameTypeData[];
}

export default function GameTypePieChart({ data }: Props) {
  const totalValue = data.reduce((a, b) => a + b.value, 0);
  const hasData = data.length > 0 && totalValue > 0;
  const { t } = useTranslation();
  return (
    <div className="relative bg-linear-to-br
                  from-gray-900 via-gray-800 to-gray-900
                  rounded-2xl p-6 border-2 border-white/10 overflow-hidden">
      
      <div className="relative flex items-center gap-2 mb-6">
        <h4 className="text-xl font-black tracking-tight text-white">{t("Dashboard.GameType")}</h4>
      </div>
      
      {!hasData ? (
        <div className="relative flex items-center justify-center text-slate-400 text-sm py-12 font-medium">
          {t("Dashboard.NoGamesPlayedYet")}
        </div> 
      ) : (
        <div className="relative flex items-center gap-6">
          <div className="w-40 h-40 shrink-0 min-w-40 min-h-40">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={2}
                  stroke="rgba(0,0,0,0.3)"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 space-y-3">
            {data.map((t, i) => (
              <div
                key={t.name}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-emerald-400">
                    {totalValue > 0 ? Math.round((t.value / totalValue) * 100) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
