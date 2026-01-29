import { PlayerInfo } from "../types";

interface PlayerCardProps {
  player: PlayerInfo;
  isActive: boolean;
  isWinner: boolean;
}

export function PlayerCard({ player, isActive, isWinner }: PlayerCardProps) {
  const borderColor = player.symbol === "X" ? "emerald" : "blue";
  const shadowColor = player.symbol === "X" ? "green" : "blue";

  return (
    <div
      className={`
        p-6 rounded-2xl border transition-all duration-300
        ${
          isActive
            ? `bg-slate-900/50 border-${borderColor}-500/50 shadow-md shadow-${shadowColor}-500`
            : "bg-slate-900 border-slate-800"
        }
      `}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-white text-xl font-bold border border-slate-700">
          <span
            className={
              player.symbol === "X" ? "text-emerald-500" : "text-blue-400"
            }
          >
            {player.symbol}
          </span>
        </div>
        <div>
          <div className="font-medium text-lg">{player.name}</div>
          <div className="text-slate-500 text-sm">{player.label}</div>
        </div>
      </div>
    </div>
  );
}
