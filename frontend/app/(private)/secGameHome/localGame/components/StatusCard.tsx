import { Trophy, Users } from "lucide-react";
import { Player } from "../types";
import { useTranslation } from "@/lib/i18n";

interface StatusCardProps {
  winner: Player;
  isDraw: boolean;
  xIsNext: boolean;
  playerXName: string;
  playerOName: string;
}

export function StatusCard({
  winner,
  isDraw,
  xIsNext,
  playerXName,
  playerOName,
}: StatusCardProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center h-[100px] flex flex-col items-center justify-center">
      {winner ? (
        <>
          <div
            className={`font-medium text-lg ${winner === "X" ? "text-emerald-400" : "text-blue-400"
              }`}
          >
            <Trophy className="w-50 h-8 mb-2" size={30} />
            {winner === "X" ? playerXName : playerOName} {t("LocalGame.wins")}
          </div>
        </>
      ) : isDraw ? (
        <>
          <div className="text-slate-300 font-medium text-lg">
            <Users className="w-50 h-8 mb-2" size={24} />
            {t("LocalGame.draw")}
          </div>
        </>
      ) : (
        <>
          <div className="text-slate-500 text-sm mb-1">{t("LocalGame.currentTurn")}</div>
          <div
            className={`text-xl font-medium ${xIsNext ? "text-emerald-400" : "text-blue-400"
              }`}
          >
            {xIsNext ? playerXName : playerOName}
          </div>
        </>
      )}
    </div>
  );
}
