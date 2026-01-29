"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "./hooks/useAuth";
import { useGameState } from "./hooks/useGameState";
import { useSocket } from "./hooks/useSocket";
import { SettingsScreen } from "./components/SettingsScreen";
import {
  AuthErrorScreen,
  ConnectionErrorScreen,
  QueueErrorScreen,
} from "./components/ErrorStates";
import { SearchingScreen } from "./components/SearchingScreen";
import { GameHeader } from "./components/GameHeader";
import { PlayerCard } from "./components/PlayerCard";
import { StatusCard } from "./components/StatusCard";
import { GameBoard } from "./components/GameBoard";
import { GameFooter } from "./components/GameFooter";
import { GameSettings, Player } from "./types";
import { getBoardSize, getSymbols } from "./utils/gameHelpers";

import { useTranslation } from "@/lib/i18n";

export default function Page() {
  const { t } = useTranslation();
  const { currentUser, jwtToken, authError } = useAuth();
  const { state, setStatus, setGameStart, setUpdateBoard, setGameOver, setQueueError, reset } =
    useGameState();
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    mapSize: "3x3",
    symbolSet: "XO",
  });
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const mySymbolRef = React.useRef(state.mySymbol);

  const { socketRef, emitMove, disconnect } = useSocket({
    jwtToken,
    username: currentUser?.username || null,
    status: state.status,
    gameSettings,
    onGameStart: (data) => {
      setGameStart(data, currentUser?.username || "", getBoardSize(data.settings?.mapSize || "3x3"));
      mySymbolRef.current = data.players.find(
        (p: Player) => p.username === currentUser?.username
      )?.symbol || null;
    },
    onUpdateBoard: (data) => setUpdateBoard(data, mySymbolRef.current),
    onGameOver: (data) => setGameOver(data),
    onWaitingInQueue: () => setStatus("SEARCHING"),
    onAlreadyInQueue: (data) => setQueueError(data.message),
    onAlreadyInGame: (data) => setQueueError(data.message),
    onError: (data) => setQueueError(data.message || "An error occurred"),
    onConnectError: (error) => {
      setConnectionError(`Connection failed: ${error.message}`);
      setStatus("SETTINGS");
    },
  });

  const handleClick = (i: number) => {
    if (state.status !== "PLAYING" || !state.isMyTurn || state.board[i]) return;
    emitMove(state.roomId, i);
  };

  const handleBackToSettings = () => {
    reset();
    disconnect();
  };

  const symbols = getSymbols(gameSettings.symbolSet);

  if (authError) return <AuthErrorScreen error={authError} />;

  if (connectionError) {
    return (
      <ConnectionErrorScreen
        error={connectionError}
        onRetry={() => {
          setConnectionError(null);
          setStatus("SEARCHING");
        }}
      />
    );
  }

  if (state.status === "QUEUE_ERROR") {
    return <QueueErrorScreen error={state.queueErrorMessage} />;
  }

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <Loader2 className="animate-spin w-12 h-12 text-emerald-500" />
      </main>
    );
  }

  if (state.status === "SETTINGS") {
    return (
      <SettingsScreen
        gameSettings={gameSettings}
        onSettingsChange={setGameSettings}
        onStartMatchmaking={() => setStatus("SEARCHING")}
      />
    );
  }

  if (state.status === "SEARCHING") {
    return (
      <main className="min-h-screen bg-[#020617] text-white font-sans">
        <GameHeader
          gameSettings={gameSettings}
          gameCount={state.gameCount}
        />
        <SearchingScreen username={currentUser.username} gameSettings={gameSettings} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white font-sans selection:bg-emerald-500/30">
      <GameHeader
        gameSettings={gameSettings}
        gameCount={state.gameCount}
      />

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 items-start">
        <PlayerCard
          name={currentUser.username}
          symbol={state.mySymbol}
          label={t("TicTacToe.you")}
          isActive={state.isMyTurn && state.status === "PLAYING"}
          symbolSet={symbols}
        />

        <div className="flex flex-col gap-6">
          <StatusCard
            winner={state.winner}
            isMyTurn={state.isMyTurn}
            mySymbol={state.mySymbol}
            currentUsername={currentUser.username}
            opponentName={state.opponentName}
            disconnectReason={state.disconnectReason}
            gameStatus={state.status as "PLAYING" | "GAME_OVER"}
          />

          <GameBoard
            board={state.board}
            mapSize={gameSettings.mapSize}
            onSquareClick={handleClick}
            isMyTurn={state.isMyTurn}
            gameStatus={state.status as "PLAYING" | "GAME_OVER" | "SEARCHING"}
            symbolSet={symbols}
          />

          <GameFooter onFinish={handleBackToSettings} />
        </div>

        <PlayerCard
          name={state.opponentName}
          symbol={state.mySymbol === symbols[0] ? symbols[1] : symbols[0]}
          label={t("TicTacToe.opponent")}
          isActive={!state.isMyTurn && state.status === "PLAYING"}
          symbolSet={symbols}
        />
      </div>
    </main>
  );
}
