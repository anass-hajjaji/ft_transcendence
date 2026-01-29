import { PlayerSymbol } from "../types";
import { getSymbolColor } from "../utils/gameHelpers";

interface PlayerCardProps {
  name: string;
  symbol: PlayerSymbol | null;
  label: string;
  isActive: boolean;
  symbolSet: [PlayerSymbol, PlayerSymbol];
}

export function PlayerCard({
  name,
  symbol,
  label,
  isActive,
  symbolSet,
}: PlayerCardProps) {
  const isFirstSymbol = symbol === symbolSet[0];
  
  return (
    <div
      className={`p-6 rounded-2xl border transition-all ${
        isActive
          ? isFirstSymbol
            ? "bg-slate-900/50 border-emerald-500/50 shadow-md shadow-green-500"
            : "bg-slate-900/50 border-blue-500/50 shadow-md shadow-blue-500"
          : "bg-slate-900 border-slate-800"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-white text-xl font-bold border border-slate-700">
          <span className={getSymbolColor(symbol, symbolSet)}>{symbol}</span>
        </div>
        <div>
          <div className="font-medium text-lg">{name}</div>
          <div className="text-slate-500 text-sm">{label}</div>
        </div>
      </div>
    </div>
  );
}
