"use client";

import { useEffect, useRef, useState } from "react";
import { startPong, stopPong } from "@/lib/ponggame";
import Link from "next/link";
import { Play } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

type MapType = "default" | "inverted";
type GameStep = "map" | "customize" | "play";


const COLOR_SWATCHES = [
  { name: "Purple", hex: "#473472" },
  { name: "Red", hex: "#BF092F" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Orange", hex: "#F4631E" },
];

export default function LocalGamePage() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [step, setStep] = useState<GameStep>("map");
  const [map, setMap] = useState<MapType>("default");

  const [paddleColors, setPaddleColors] = useState({
    left: "#BF092F",
    right: "#3B82F6",
  });

  const [winnerInfo, setWinnerInfo] = useState<{ winner: string; score: string } | null>(null);
  const [scores, setScores] = useState({ left: 0, right: 0 });

  const handleMatchEnd = (
    winner: string | null,
    finalScores: { left: number; right: number }
  ) => {
    const score = `${finalScores.left} - ${finalScores.right}`;
    if (winner) {
      setWinnerInfo({ winner, score });
    } else {
      setWinnerInfo({ winner: "Draw!", score });
    }
  };

  const [gameKey, setGameKey] = useState(0);

  useEffect(() => {
    if (step !== "play" || !canvasRef.current) return;
    stopPong();
    setWinnerInfo(null);
    setScores({ left: 0, right: 0 });
    const cleanup = startPong({
      canvas: canvasRef.current,
      leftPlayer: "Player 1",
      rightPlayer: "Player 2",
      handleMatchEnd,
      winScore: 5,
      map: map,
      onScoreUpdate: setScores,
      leftPaddleColor: paddleColors.left,
      rightPaddleColor: paddleColors.right,
    });
    return () => {
      stopPong();
      if (cleanup) {
        cleanup();
      }
    };
  }, [step, map, paddleColors, gameKey]);

  const handleRestart = () => {
    setGameKey(prev => prev + 1);
    setStep('play');
  };

  const handleBackToMap = () => {
    setWinnerInfo(null);
    setStep("map");
  };

  if (step === "map") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <h1 className="text-4xl font-bold text-slate-600 mb-12">
          {t("PingPong.step1Title")}
        </h1>
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl justify-center">
          <div
            className="flex-1 max-w-md flex flex-col items-center justify-center p-12 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-white/10 shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)] hover:border-emerald-500/50 hover:bg-white/5 transition-all duration-300 cursor-pointer group"
            onClick={() => {
              setMap("default");
              setStep("customize");
            }}
          >
            <h2 className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors mb-4">
              {t("PingPong.defaultGameTitle")}
            </h2>
            <div className="w-64 h-48 border-4 border-emerald-600 bg-black flex items-center justify-between p-2 mb-8 group-hover:scale-105 transition-transform duration-300">
              <div className="w-4 h-16 bg-emerald-600"></div>
              <div className="w-4 h-16 bg-emerald-600"></div>
            </div>
            <div className="flex items-center justify-center w-full max-w-[200px] p-4 bg-emerald-600/10 border border-emerald-600/20 rounded-xl text-emerald-500 font-bold group-hover:bg-emerald-600 group-hover:text-black transition-all">
              <Play className="h-6 w-6 mr-3 fill-current" />
              {t("PingPong.selectDefault")}
            </div>
          </div>
          <div
            className="flex-1 max-w-md flex flex-col items-center justify-center p-12 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-white/10 shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)] hover:border-emerald-500/50 hover:bg-white/5 transition-all duration-300 cursor-pointer group"
            onClick={() => {
              setMap("inverted");
              setStep("customize");
            }}
          >
            <h2 className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors mb-4">
              {t("PingPong.obstacleMapTitle")}
            </h2>
            <div className="w-64 h-48 border-4 border-slate-700 bg-slate-950 flex items-center justify-between p-2 mb-8 group-hover:scale-105 transition-transform duration-300 relative">
              {/* Paddles */}
              <div className="w-4 h-16 bg-white z-10"></div>
              <div className="w-4 h-16 bg-white z-10"></div>
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white/20 border border-white/40"></div>
              <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white/20 border border-white/40"></div>
            </div>
            <div className="flex items-center justify-center w-full max-w-[200px] p-4 bg-zinc-700/50 border border-zinc-600 rounded-xl text-slate-300 font-bold group-hover:bg-zinc-700 group-hover:text-white transition-all">
              <Play className="h-6 w-6 mr-3" />
              {t("PingPong.selectObstacle")}
            </div>
          </div>
        </div>
        <Link href="/ping-pong" className="inline-block px-6 py-3 bg-emerald-600/10 text-slate-400 border border-emerald-600/20 hover:text-emerald-600 hover:bg-emerald-600/10 mt-12 transition-colors">
          {t("PingPong.backToGameMode")}
        </Link>
      </div>
    );
  }

  if (step === "customize") {

    const handleStartGame = () => {
      if (map === 'inverted' && (paddleColors.left === '#ffffff' || paddleColors.right === '#ffffff')) {
  alert(t("LocalGame.whiteObstacleWarning"));
        return;
      }
      if (map === 'default' && (paddleColors.left === '#000000' || paddleColors.right === '#000000')) {
  alert(t("LocalGame.blackBackgroundWarning"));
        return;
      }
      setStep("play");
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen  text-white p-6">
        <h1 className="text-4xl font-bold text-slate-600 mb-12">
          {t("PingPong.step2Title")}
        </h1>
        <div className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 p-10 rounded-3xl border border-white/10 shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)] flex flex-col gap-8 w-full max-w-lg">

          <div>
            <label className="text-lg font-semibold text-slate-300 mb-3 block">
              {t("PingPong.player1Color")}
            </label>
            <div className="flex gap-3 flex-wrap">
              {COLOR_SWATCHES.map((color) => (
                <button
                  key={`p1-${color.hex}`}
                  aria-label={color.name}
                  onClick={() => setPaddleColors((prev) => ({ ...prev, left: color.hex }))}
                  className={`w-12 h-12 rounded-lg cursor-pointer transition-all ${paddleColors.left === color.hex
                    ? 'ring-4 ring-offset-2 ring-offset-zinc-900 ring-white'
                    : 'ring-4 ring-transparent hover:ring-zinc-600'
                    }`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-lg font-semibold text-slate-300 mb-3 block">
              {t("PingPong.player2Color")}
            </label>
            <div className="flex gap-3 flex-wrap">
              {COLOR_SWATCHES.map((color) => (
                <button
                  key={`p2-${color.hex}`}
                  aria-label={color.name}
                  onClick={() => setPaddleColors((prev) => ({ ...prev, right: color.hex }))}
                  className={`w-12 h-12 rounded-lg cursor-pointer transition-all ${paddleColors.right === color.hex
                    ? 'ring-4 ring-offset-2 ring-offset-zinc-900 ring-white'
                    : 'ring-4 ring-transparent hover:ring-zinc-600'
                    }`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setStep("map")}
              className="w-full p-3 bg-emerald-600 rounded-md text-black font-bold hover:bg-emerald-700 transition cursor-pointer"
            >
              {t("PingPong.backToMaps")}
            </button>
            <button
              onClick={handleStartGame}
              className="w-full flex items-center justify-center p-3 bg-emerald-600 rounded-md text-black font-bold hover:bg-emerald-700 transition cursor-pointer"
            >
              <Play className="h-5 w-5 mr-2 fill-black" />
              {t("PingPong.startGame")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-6">
      <div className="w-full max-w-[800px] flex justify-between items-center mb-8 px-6 py-4 bg-gray-900/80 rounded-2xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] backdrop-blur-sm">
        <div
          className="text-3xl font-bold text-left flex-1 truncate pr-4"
          style={{ color: paddleColors.left }}
        >
          {t("LocalGame.player1Controls")}
        </div>
        <div className="text-5xl font-black bg-black/40 px-6 py-2 rounded-xl border border-emerald-500/20 flex items-center gap-4 text-emerald-500">
          <span style={{ color: paddleColors.left }}>
            {scores.left}
          </span>{" "}
          <span className="text-emerald-700 text-3xl">vs</span>
          <span style={{ color: paddleColors.right }}>
            {scores.right}
          </span>{" "}
        </div>
        <div
          className="text-3xl font-bold text-right flex-1 truncate pl-4"
          style={{ color: paddleColors.right }}
        >
          {t("LocalGame.player2Controls")}
        </div>
      </div>

      <div className="w-full max-w-5xl mb-4 relative group">
        <div className="absolute -inset-1 bg-linear-to-r from-emerald-600 to-emerald-900 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <canvas
          ref={canvasRef}
          width={1024}
          height={720}
          className="relative block w-full h-auto border-2 border-emerald-500/20 rounded-lg shadow-2xl"
        />
      </div>

      <button onClick={handleBackToMap} className="text-slate-400 hover:text-emerald-600 mt-4">
  {t("LocalGame.backToMapSelection")}
      </button>

      {winnerInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`relative p-12 rounded-3xl text-center shadow-2xl border max-w-lg w-full transform transition-all scale-100 ${map === "inverted"
              ? "bg-black text-emerald-500 border-white/10 shadow-emerald-900/20"
              : "bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-white/10 shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)]"
              }`}
          >
            <h2 className="text-5xl font-black mb-6 bg-clip-text text-transparent bg-linear-to-br from-white to-slate-400">
              {winnerInfo.winner === "Draw!"
                ? t("LocalGame.drawTitle")
                : t("LocalGame.winTitle",).replace("{winner}", winnerInfo.winner)}
            </h2>
            <div className="text-3xl font-bold mb-10 text-emerald-500 bg-emerald-500/10 py-3 rounded-xl border border-emerald-500/20 inline-block px-8">
              {winnerInfo.score}
            </div>

            <div className="flex flex-col gap-4">
              <button
                className="w-full py-4 rounded-xl font-bold text-lg bg-emerald-600 text-black hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/20 transition-all cursor-pointer"
                onClick={handleRestart}
              >
                {t("LocalGame.restartMatch")}
              </button>
              <button
                className="w-full py-4 rounded-xl font-bold text-lg bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                onClick={handleBackToMap}
              >
                {t("LocalGame.changeMap")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}