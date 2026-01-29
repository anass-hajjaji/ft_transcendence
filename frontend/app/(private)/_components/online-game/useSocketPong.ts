import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { PlayerNames, ServerGameState } from "./types";

const getServerUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
  return apiUrl.replace(/\/$/, "");
};

const getSocketUrl = (namespace: string) => {
  const base = getServerUrl().replace(/\/api$/, "");

  const url = new URL(base);
  console.log("Base URL for socket:", url.toString());
  url.pathname = namespace.startsWith('/') ? namespace : `/${namespace}`;

  return url.toString();
};

export function useSocketPong() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState("Not Connected");
  const [isConnected, setIsConnected] = useState(false);
  const [isQueuing, setIsQueuing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gameState, setGameState] = useState<ServerGameState | null>(null);
  const [playerNames, setPlayerNames] = useState<PlayerNames>({
    p1: "Player 1",
    p2: "Player 2",
  });
  const [mapType, setMapType] = useState<string>("default");
  const [winnerInfo, setWinnerInfo] = useState<{
    winner: string;
    score: string;
  } | null>(null);
  const gameStateRef = useRef<ServerGameState | null>(null);
  const [queueTimeout, setQueueTimeout] = useState(false); 
  const [reconnecting, setReconnecting] = useState(false); 
  const [opponentReconnecting, setOpponentReconnecting] = useState(false);
  const resetGame = () => {
    setWinnerInfo(null);
    setGameState(null);
    setStatus("Ready to play");
  };
  const joinPrivateGame = (roomId: string, mapType: string = "default") => {
    if (socket && isConnected) {
      socket.emit("join_private_game", { roomId, mapType });
    }
  };

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const connect = () => {
    setStatus("Connecting...");
    setWinnerInfo(null);

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="))
      ?.split("=")[1];

    if (!token) {
      setStatus("Authentication Failed");
      alert("Please login first");
      return;
    }


    if (socket) {
      socket.disconnect();
      setSocket(null);
    }


    setTimeout(() => {

      const socketUrl = getSocketUrl("/pong");
      console.log("Attempting connection to:", socketUrl);

      const newSocket = io(socketUrl, { 
        path: "/socket.io",
        auth: { token },
        timeout: 10000,
        reconnection: true,
        transports: ["websocket", "polling"],
      });

      setupListeners(newSocket);
      setSocket(newSocket);
    }, 100);
  };

  const setupListeners = (s: Socket) => {
    s.on("connect", () => {
      setIsConnected(true);
      setStatus("Connected");
    });

    s.on("disconnect", () => {
      setIsConnected(false);
      setStatus("Disconnected");
      setGameState(null);
      setIsQueuing(false);
      setCountdown(null);
    });

    s.on("connect_error", (err) => {
      setStatus("Connection Failed");
    });

    s.on("error", (data: string | { message: string }) => {
      const message = typeof data === 'string' ? data : data.message;

      if (message && message.includes('another location')) {
        alert('⚠️ You connected from another tab or device while in a game.\nThis session will be closed to prevent conflicts.');
        setStatus('Connected elsewhere');
        setTimeout(() => s.disconnect(), 1000);
        return;
      }

      if (message && message.includes('map')) {
        alert(message);
        setTimeout(() => {
          window.location.href = '/ping-pong/online-game';
        }, 100);
      } else if (message && message.includes('already in a game')) {
        alert('You are already in a game. Please finish or leave your current game first.');
      } else if (message && message.includes('in progress')) {
        alert('This game has already started. Please create a new game invitation.');
        setTimeout(() => {
          window.location.href = '/home';
        }, 100);
      } else {
        alert(message || 'An error occurred');
      }
      setIsQueuing(false);
    });

    s.on("waiting", () => setIsQueuing(true));

    s.on("left_queue", () => {
      setIsQueuing(false);
      setStatus("Left queue");
    });

    s.on("queue_timeout", () => {
      console.log('Queue timeout reached');
      setQueueTimeout(true);
      setIsQueuing(false);
      setStatus('Queue timeout - No opponent found');
      alert('No opponent found after 2 minutes. Please try again.');
    });

    s.on("match_found", (data: { playerNames?: PlayerNames; mapType?: string; countdown?: number }) => {
      setIsQueuing(false);
      if (data.playerNames) setPlayerNames(data.playerNames);
      if (data.mapType) setMapType(data.mapType);
      if (data.countdown !== undefined) {
        setCountdown(data.countdown);
        setStatus(`Match found! Starting in ${data.countdown}...`);
      }
    });

    s.on("reconnected", (data: { playerNames?: PlayerNames; mapType?: string }) => {
      console.log('Reconnected to game:', data);
      setReconnecting(false);
      if (data.playerNames) setPlayerNames(data.playerNames);
      if (data.mapType) setMapType(data.mapType);
      setStatus('Reconnected to game');
    });

    s.on("opponent_reconnected", () => {
      console.log('Opponent reconnected');
      setOpponentReconnecting(false);
      setStatus('Game resumed');
    });

    s.on("opponent_disconnected_reconnect", (data: { waitTime: number }) => {
      console.log('Opponent disconnected, waiting for reconnection:', data.waitTime);
      setOpponentReconnecting(true);
      setStatus(`Opponent disconnected - waiting ${data.waitTime}s for reconnection...`);
    });

    s.on("countdown", (count: number) => {
      setCountdown(count);
      setStatus(`Match starts in ${count}...`);
    });

    s.on("game_start", () => {
      setCountdown(null);
      setStatus("Game Started!");
    });

    s.on("game_state", (state: ServerGameState) => {
      setGameState(state);
      if (state.playerNames) setPlayerNames(state.playerNames);
    });

    s.on("opponent_disconnected", () => {
      setGameState(null);
      setIsQueuing(false);
      setCountdown(null);
      alert("Opponent Disconnected - You win by forfeit!");
    });

    s.on("opponent_left", () => {
      setGameState(null);
      setIsQueuing(false);
      setCountdown(null);
      setStatus("Opponent left the game");
      alert("Your opponent left the game");
    });

    s.on(
      "game_over",
      (data: {
        winner: string;
        finalScores?: { p1: number; p2: number };
        playerNames?: { p1: string; p2: string };
      }) => {

        if (data.playerNames) {
          setPlayerNames(data.playerNames);
        }


        let score = "0 - 0";
        if (data.finalScores) {
          score = `${data.finalScores.p1} - ${data.finalScores.p2}`;
        } else {
          const finalState = gameStateRef.current;
          score = finalState
            ? `${finalState.p1.score} - ${finalState.p2.score}`
            : "0 - 0";
        }

        setWinnerInfo({ winner: data.winner, score });
        setGameState(null);
        setCountdown(null);


        s.disconnect();
        setIsConnected(false);
        setStatus("Game Ended");
      }
    );
  };

  const disconnect = () => {
    if (socket) {

      if (isQueuing) {
        socket.emit("leave_queue");
      }

      const roomId = new URLSearchParams(window.location.search).get('roomId');
      if (roomId) {
        socket.emit("leave_game");
      }

      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setGameState(null);
      setIsQueuing(false);
      setWinnerInfo(null);
      setQueueTimeout(false);
      setReconnecting(false);
      setOpponentReconnecting(false); 
    }
  };


  const leaveQueue = () => {
    if (socket && isQueuing) {
      socket.emit("leave_queue");
      setIsQueuing(false);
      setQueueTimeout(false);
      setStatus("Left queue");
    }
  };

  const isQueuingRef = useRef(isQueuing);
  useEffect(() => {
    isQueuingRef.current = isQueuing;
  }, [isQueuing]);

  useEffect(() => {
    return () => {
      if (socket) {
        if (isQueuingRef.current) {
          socket.emit("leave_queue");
        }
        socket.disconnect();
      }
    };
  }, [socket]); 

  return {
    socket,
    status,
    isConnected,
    isQueuing,
    countdown,
    gameState,
    playerNames,
    mapType,
    winnerInfo,
    queueTimeout, 
    reconnecting, 
    opponentReconnecting,
    connect,
    disconnect,
    leaveQueue,
    joinPrivateGame,
    resetGame,
  };
}
