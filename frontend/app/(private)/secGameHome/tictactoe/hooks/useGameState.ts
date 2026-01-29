import { useState } from "react";
import {
  GameState,
  GameStatus,
  PlayerSymbol,
  GameSettings,
  GameStartPayload,
  UpdateBoardPayload,
  GameOverPayload,
  Player
} from "../types";

const initialState: GameState = {
  status: "SETTINGS",
  board: Array(9).fill(null),
  mySymbol: null,
  isMyTurn: false,
  winner: null,
  opponentName: "Opponent",
  disconnectReason: null,
  gameCount: 1,
  queueErrorMessage: "",
  roomId: null,
};

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);

  const setStatus = (status: GameStatus) =>
    setState((prev) => ({ ...prev, status }));

  const setBoard = (board: (PlayerSymbol | null)[]) =>
    setState((prev) => ({ ...prev, board }));

  const setGameStart = (data: GameStartPayload, currentUsername: string, boardSize: number) => {
    const me = data.players.find((p: Player) => p.username === currentUsername);
    const opponent = data.players.find((p: Player) => p.username !== currentUsername);

    setState((prev) => ({
      ...prev,
      status: "PLAYING",
      board: Array(boardSize).fill(null),
      winner: null,
      disconnectReason: null,
      queueErrorMessage: "",
      roomId: data.roomId,
      mySymbol: me?.symbol || null,
      isMyTurn: data.currentTurn === me?.symbol,
      opponentName: opponent?.username || "Opponent",
      gameCount: data.isRematch ? prev.gameCount + 1 : 1,
    }));
  };

  const setUpdateBoard = (data: UpdateBoardPayload, mySymbol: PlayerSymbol | null) => {
    setState((prev) => ({
      ...prev,
      board: data.board,
      isMyTurn: data.currentTurn === mySymbol,
    }));
  };

  const setGameOver = (data: GameOverPayload, reason?: string) => {
    setState((prev) => ({
      ...prev,
      status: "GAME_OVER",
      board: data.board,
      winner: data.isDraw ? "DRAW" : data.winner,
      disconnectReason: reason || null,
    }));
  };

  const setQueueError = (message: string) => {
    setState((prev) => ({
      ...prev,
      status: "QUEUE_ERROR",
      queueErrorMessage: message,
    }));
  };

  const reset = () => setState(initialState);

  return {
    state,
    setStatus,
    setBoard,
    setGameStart,
    setUpdateBoard,
    setGameOver,
    setQueueError,
    reset,
  };
}
