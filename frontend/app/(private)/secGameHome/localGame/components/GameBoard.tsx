import { Board, Player } from "../types";

interface GameBoardProps {
  board: Board;
  onSquareClick: (index: number) => void;
  winner: Player;
  winningLine: number[] | null;
}

export function GameBoard({
  board,
  onSquareClick,
  winner,
  winningLine,
}: GameBoardProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {board.map((val, i) => {
        const isWinningSquare = winningLine?.includes(i);
        return (
          <button
            key={i}
            onClick={() => onSquareClick(i)}
            disabled={!!winner || !!val}
            className={`
              h-28 rounded-xl text-5xl font-medium transition-all duration-200
              flex items-center justify-center 
              ${val === null ? "bg-[#151e32] hover:bg-slate-800" : "bg-[#151e32]"}
              ${
                isWinningSquare
                  ? winner === "X"
                    ? "ring-2 ring-emerald-500/50 bg-emerald-900/10 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]"
                    : "ring-2 ring-blue-500/50 bg-emerald-900/10 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]"
                  : "cursor-pointer"
              }
            `}
          >
            <span
              className={`
                transform transition-all duration-300
                ${val ? "scale-100 opacity-100" : "scale-50 opacity-0"}
                ${
                  val === "X"
                    ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                    : "text-blue-400"
                }
              `}
            >
              {val}
            </span>
          </button>
        );
      })}
    </div>
  );
}
