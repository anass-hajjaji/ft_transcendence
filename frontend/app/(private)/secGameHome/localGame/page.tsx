"use client";

import React from "react";
import { GameHeader } from "./components/GameHeader";
import { PlayerCard } from "./components/PlayerCard";
import { StatusCard } from "./components/StatusCard";
import { GameBoard } from "./components/GameBoard";
import { GameFooter } from "./components/GameFooter";
import { useLocalGame } from "./hooks/useLocalGame";
import {
  calculateWinner,
  getWinningLine,
  isDraw as checkIsDraw,
} from "./utils/gameLogic";
import { PlayerInfo } from "./types";
import { useTranslation } from "@/lib/i18n";

export default function Page() {
  const { board, xIsNext, handleClick, reset } = useLocalGame();

  const winner = calculateWinner(board);
  const winningLine = winner ? getWinningLine(board) : null;
  const isDraw = checkIsDraw(board, winner);

  const { t } = useTranslation();
  const playerXName = t("LocalGame.player1");
  const playerOName = t("LocalGame.player2");

  const players: PlayerInfo[] = [
    { name: playerXName, symbol: "X", label: t("LocalGame.you") },
    { name: playerOName, symbol: "O", label: t("LocalGame.opponent") },
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-white font-sans selection:bg-emerald-500/30 mr-16">
      <GameHeader />

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 items-start">
        <PlayerCard
          player={players[0]}
          isActive={xIsNext && !winner && !isDraw}
          isWinner={winner === "X"}
        />

        <div className="flex flex-col gap-6">
          <StatusCard
            winner={winner}
            isDraw={isDraw}
            xIsNext={xIsNext}
            playerXName={playerXName}
            playerOName={playerOName}
          />

          <GameBoard
            board={board}
            onSquareClick={(i) => handleClick(i, winner)}
            winner={winner}
            winningLine={winningLine}
          />

          <GameFooter onRematch={reset} />
        </div>

        <PlayerCard
          player={players[1]}
          isActive={!xIsNext && !winner && !isDraw}
          isWinner={winner === "O"}
        />
      </div>
    </main>
  );
}
