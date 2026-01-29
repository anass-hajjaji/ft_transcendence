import { PlayerSymbol, MapSize } from "../types";
import { getGridCols, getSymbolColor } from "../utils/gameHelpers";

interface GameBoardProps {
  board: (PlayerSymbol | null)[];
  mapSize: MapSize;
  onSquareClick: (index: number) => void;
  isMyTurn: boolean;
  gameStatus: "PLAYING" | "GAME_OVER" | "SEARCHING";
  symbolSet: [PlayerSymbol, PlayerSymbol];
}

export function GameBoard({
  board,
  mapSize,
  onSquareClick,
  isMyTurn,
  gameStatus,
  symbolSet,
}: GameBoardProps) {
  const gridCols = getGridCols(mapSize);
  const isSmall = mapSize === "3x3";

  return (
    <div
      className={`grid gap-3 p-3 bg-slate-900/30 rounded-2xl`}
      style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
    >
      {board.map((val, i) => (
        <button
          key={i}
          onClick={() => onSquareClick(i)}
          disabled={gameStatus !== "PLAYING" || val !== null || !isMyTurn}
          className={`${isSmall ? "h-28" : "h-20"} rounded-xl ${
            isSmall ? "text-5xl" : "text-4xl"
          } font-medium flex items-center justify-center transition-all ${
            val
              ? "bg-[#0f172a]"
              : gameStatus === "PLAYING" && isMyTurn
              ? "bg-[#1e293b] hover:bg-slate-700 cursor-pointer"
              : "bg-[#1e293b] cursor-not-allowed opacity-50"
          }`}
        >
          <span className={getSymbolColor(val, symbolSet)}>{val}</span>
        </button>
      ))}
    </div>
  );
}
