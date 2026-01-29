import React from "react";
import { Eye } from "lucide-react";
import { Game } from "../../home/types";
import { useTranslation } from "@/lib/i18n";

interface RecentGamesListProps {
  games: Game[];
  onMatchClick: (match: Game) => void;
}

export default function RecentGamesList({ games, onMatchClick }: RecentGamesListProps) {
  const { t } = useTranslation();
  return (
    <div className="lg:col-span-2   rounded-2xl border-2
                  border-white/10
                    overflow-hidden flex flex-col min-h-0
                    bg-linear-to-b
                    from-gray-900 via-gray-800 to-gray-900">
      <div className="relative p-8 pb-6">
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-3xl font-black text-white">
              {t("Dashboard.RecentGames")}
            </h3>
          </div>
          <p className="text-base text-slate-400 font-medium">
            {t("Dashboard.LatestMatchHistory")}
          </p>
        </div>
      </div>

      <div className="px-6 pb-8 relative flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto pr-2 
                      [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-zinc-900/30
                      [&::-webkit-scrollbar-track]:rounded-full
                      [&::-webkit-scrollbar-thumb]:rounded-full
                      [&::-webkit-scrollbar-thumb]:bg-emerald-500
                      [&::-webkit-scrollbar-thumb]:hover:bg-emerald-400">
          <div className="space-y-3 py-4">
            {games.map((g, idx) => (
              <div
                key={idx}
                className="
                  relative group 
                  bg-linear-to-br from-zinc-900/60 to-zinc-800/40
                  p-6 rounded-xl
                  border border-white/5
                  transition-all duration-300
                  hover:-translate-y-0.5
                  backdrop-blur-sm
                "
              >
                <div className="pl-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <span className="text-xl font-bold text-white tracking-tight">
                        {t(`GameNames.${g.game.replace(/\s+/g, '')}`) || g.game}
                      </span>
                      <span
                        className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase ${g.result === 'win' || (g.result === undefined && g.win)
                          ? " text-emerald-400"
                          : g.result === 'draw'
                            ? " text-gray-400"
                            : " text-red-400 "
                          }`}
                      >
                        {g.result === 'win' || (g.result === undefined && g.win) ? t("GameResult.win") : g.result === 'draw' ? t("GameResult.draw") : t("GameResult.loss")}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-white/5">
                        {g.time}
                      </span>
                    </div>
                    <p className="text-base text-slate-400 font-medium">
                      {t("Dashboard.vs")}{" "}
                      <span className="text-white font-semibold">
                        {g.opponent}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div
                        className={`text-2xl font-black tabular-nums leading-none transition-colors ${g.result === 'win' || (g.result === undefined && g.win)
                          ? "text-emerald-400"
                          : g.result === 'draw'
                            ? "text-gray-400"
                            : "text-slate-300"
                          }`}
                      >
                        {g.score}
                      </div>
                    </div>
                    <button
                      onClick={() => onMatchClick(g)}
                      className="
                        p-4
                        bg-zinc-800/50 backdrop-blur-md 
                        rounded-xl 
                        border border-white/10 
                        transition-all duration-300 
                        hover:scale-110
                      "
                    >
                      <Eye className="w-5 h-5 text-zinc-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
