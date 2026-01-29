import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  GameSettings,
  GameStatus,
  GameStartPayload,
  UpdateBoardPayload,
  GameOverPayload,
  QueuePayload,
  ErrorPayload
} from "../types";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

const SOCKET_BASE_URL = BACKEND_URL.replace(/\/api$/, '');

interface UseSocketProps {
  jwtToken: string | null;
  username: string | null;
  status: GameStatus;
  gameSettings: GameSettings;
  onGameStart: (data: GameStartPayload) => void;
  onUpdateBoard: (data: UpdateBoardPayload) => void;
  onGameOver: (data: GameOverPayload) => void;
  onWaitingInQueue: (data: QueuePayload) => void;
  onAlreadyInQueue: (data: QueuePayload) => void;
  onAlreadyInGame: (data: QueuePayload) => void;
  onError: (data: ErrorPayload) => void;
  onConnectError: (error: Error) => void;
}

export function useSocket({
  jwtToken,
  username,
  status,
  gameSettings,
  onGameStart,
  onUpdateBoard,
  onGameOver,
  onWaitingInQueue,
  onAlreadyInQueue,
  onAlreadyInGame,
  onError,
  onConnectError,
}: UseSocketProps) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!username || !jwtToken) return;

    console.log(`Initializing socket for ${username}`);

    if (socketRef.current?.connected) {
      console.log("Socket already connected");
      return;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    socketRef.current = io(`${SOCKET_BASE_URL}/tictactoe`, {
      auth: { token: jwtToken },
      reconnection: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log(`Connected as ${username}`);
    });

    socket.on("connect_error", onConnectError);
    socket.on("waiting_in_queue", onWaitingInQueue);
    socket.on("already_in_queue", onAlreadyInQueue);
    socket.on("already_in_game", onAlreadyInGame);
    socket.on("error", onError);
    socket.on("game_start", onGameStart);
    socket.on("update_board", onUpdateBoard);
    socket.on("game_over", onGameOver);

    return () => {
      console.log(`Disconnecting socket for ${username}`);
      socket.disconnect();
    };
  }, [username, jwtToken]);

  useEffect(() => {
    if (status === "SEARCHING" && socketRef.current?.connected) {
      socketRef.current.emit("join_queue", gameSettings);
    }
  }, [status]);

  const emitMove = (roomId: string | null, index: number) => {
    socketRef.current?.emit("make_move", { roomId, index });
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  return { socketRef, emitMove, disconnect };
}
