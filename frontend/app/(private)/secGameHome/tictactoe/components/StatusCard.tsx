import { Trophy, Users, WifiOff } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { PlayerSymbol } from "../types";

interface StatusCardProps {
  winner: PlayerSymbol | "DRAW" | null;
  isMyTurn: boolean;
  mySymbol: PlayerSymbol | null;
  currentUsername: string;
  opponentName: string;
  disconnectReason: string | null;
  gameStatus: "PLAYING" | "GAME_OVER";
}

export function StatusCard({
  winner,
  isMyTurn,
  mySymbol,
  currentUsername,
  opponentName,
  disconnectReason,
  gameStatus,
}: StatusCardProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center min-h-[100px] flex items-center justify-center">
      {gameStatus === "GAME_OVER" ? (
        <div
          className={`text-xl font-medium ${winner === mySymbol
              ? "text-emerald-400"
              : winner === "DRAW"
                ? "text-slate-200"
                : "text-red-400"
            }`}
        >
          <div className="flex items-center gap-2 justify-center">
            {disconnectReason ? (
              <WifiOff size={24} />
            ) : (
              <Trophy size={24} />
            )}
            {winner === "DRAW"
              ? t("TicTacToe.draw")
              : winner === mySymbol
                ? t("TicTacToe.victory")
                : `${opponentName} ${t("TicTacToe.won")}`}
          </div>
          {disconnectReason && (
            <span className="text-sm text-red-400">({disconnectReason})</span>
          )}
        </div>
      ) : (
        <div className={`text-xl ${isMyTurn ? "text-emerald-400" : "text-blue-400"}`}>
          {isMyTurn ? t("TicTacToe.yourTurn") : `${opponentName} ${t("TicTacToe.turn")}`}
        </div>
      )}
    </div>
  );
}
