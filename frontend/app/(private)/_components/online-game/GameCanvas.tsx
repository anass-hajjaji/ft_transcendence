import React, { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { PaddleColors, PlayerNames, ServerGameState } from "./types";

interface Props {
  socket: Socket;
  paddleColors: PaddleColors;
  playerNames: PlayerNames;
  initialState: ServerGameState;
  mapType: string;
}

export default function GameCanvas({
  socket,
  paddleColors,
  playerNames,
  initialState,
  mapType,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentStateRef = useRef<ServerGameState>(initialState);
  const prevStateRef = useRef<ServerGameState>(initialState);
  const lastUpdateTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const WIDTH = 1024;
  const HEIGHT = 720;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["w", "s", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "w" || e.key === "ArrowUp") socket.emit("input", "up");
      if (e.key === "s" || e.key === "ArrowDown") socket.emit("input", "down");
    };
    const handleKeyUp = () => socket.emit("input", "stop");

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [socket]);

  useEffect(() => {
    const onGameState = (state: ServerGameState) => {
      prevStateRef.current = currentStateRef.current || state;
      currentStateRef.current = state;
      lastUpdateTimeRef.current = performance.now();
    };

    socket.on("game_state", onGameState);
    return () => {
      socket.off("game_state", onGameState);
    };
  }, [socket]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const curr = currentStateRef.current;
      const prev = prevStateRef.current;

      if (!curr || !prev) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const now = performance.now();
      const timeSinceUpdate = now - lastUpdateTimeRef.current;
      const serverUpdateRate = 1000 / 120;
      const alpha = Math.min(timeSinceUpdate / serverUpdateRate, 1);

      const ballJumpDistance = Math.sqrt(
        Math.pow(curr.ball.x - prev.ball.x, 2) +
        Math.pow(curr.ball.y - prev.ball.y, 2)
      );
      const isBallJump = ballJumpDistance > 50;

      const p1Y = prev.p1.y + (curr.p1.y - prev.p1.y) * alpha;
      const p2Y = prev.p2.y + (curr.p2.y - prev.p2.y) * alpha;

      let ballX, ballY;
      if (isBallJump) {
        ballX = curr.ball.x;
        ballY = curr.ball.y;
      } else {
        const dt = serverUpdateRate / 1000;
        const ballVelX = (curr.ball.x - prev.ball.x) / dt;
        const ballVelY = (curr.ball.y - prev.ball.y) / dt;
        const predictionTime = timeSinceUpdate / 1000;

        ballX = Math.max(
          10,
          Math.min(WIDTH - 10, curr.ball.x + ballVelX * predictionTime)
        );
        ballY = Math.max(
          10,
          Math.min(HEIGHT - 10, curr.ball.y + ballVelY * predictionTime)
        );
      }

      const colorScheme = mapType === "inverted"
        ? {
          background: "#020617", // Slate 950
          paddle: "#ffffff",
          ball: "#ffffff",
        }
        : {
          background: "#000000",
          paddle: "#10b981",
          ball: "#10b981",
        };

      ctx.fillStyle = colorScheme.background;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.shadowBlur = 20;
      ctx.shadowColor = paddleColors.left;
      ctx.fillStyle = paddleColors.left;
      ctx.fillRect(0, p1Y, 15, 100);

      ctx.shadowColor = paddleColors.right;
      ctx.fillStyle = paddleColors.right;
      ctx.fillRect(WIDTH - 15, p2Y, 15, 100);

      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";

      if (mapType === "inverted") {
        ctx.fillStyle = "#475569";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#64748b";
        ctx.fillRect(WIDTH / 2 - 25, 150, 50, 50);
        ctx.fillRect(WIDTH / 2 - 25, HEIGHT - 200, 50, 50);
        ctx.shadowBlur = 0;
      }
      ctx.beginPath();
      ctx.fillStyle = colorScheme.ball;
      ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
      ctx.fill();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [paddleColors, playerNames, mapType]);

  return (
    <div className="w-full max-w-5xl relative group">
      <div className="absolute -inset-1 bg-linear-to-r from-emerald-600 to-emerald-900 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="relative block w-full h-auto border-2 border-emerald-500/20 bg-black rounded-lg shadow-2xl"
      />
    </div>
  );
}
