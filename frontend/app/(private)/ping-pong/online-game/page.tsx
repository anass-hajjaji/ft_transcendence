"use client";

import { useState, useEffect } from "react";
import { GameStep, MapType, PaddleColors } from "../../_components/online-game/types";
import { useSocketPong } from "../../_components/online-game/useSocketPong";
import MapSelection from "../../_components/online-game/MapSelection";
import PaddleCustomization from "../../_components/online-game/PaddleCustomization";
import Lobby from "../../_components/online-game/Lobby";
import GameCanvas from "../../_components/online-game/GameCanvas";
import { useSearchParams } from "next/navigation";

export default function onlineGamePage() {
  const [step, setStep] = useState<GameStep>("map");
  const [map, setMap] = useState<MapType>("default");
  const [paddleColors, setPaddleColors] = useState<PaddleColors>({ left: "#BF092F", right: "#3B82F6" });
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  const {
    socket,
    status,
    isConnected,
    isQueuing,
    countdown,
    gameState,
    playerNames,
    mapType: serverMapType,
    winnerInfo,
    connect,
    disconnect,
    leaveQueue
  } = useSocketPong();
  
  const searchParams = useSearchParams();
  const roomFromUrl = searchParams.get("roomId");
  const mapFromUrl = searchParams.get("map");

  useEffect(() => {
    if (roomFromUrl && !isConnected && step === "map" && !isJoiningRoom) {
      if (mapFromUrl) {
        setMap(mapFromUrl as MapType);
      }
      setIsJoiningRoom(true);
      setStep("play");
      connect();
    }
  }, [roomFromUrl, isConnected, step, mapFromUrl, isJoiningRoom, connect]);


useEffect(() => {
  if (isConnected && socket && roomFromUrl && !gameState && isJoiningRoom) {
    console.log("🚀 Joining room:", roomFromUrl);
    setStep("play"); 
    socket.emit("join_private_game", { 
      roomId: roomFromUrl, 
      mapType: mapFromUrl || map 
    });
  }
}, [isConnected, socket, roomFromUrl, mapFromUrl, map, gameState, isJoiningRoom]);
  
  const handleMapSelect = (selectedMap: MapType) => {
    setMap(selectedMap);
    setStep("customize");
  };

  const handleStartConnection = (colors: PaddleColors) => {
    setPaddleColors(colors);
    connect();
    setStep("play");
  };

  const handleLeaveGame = () => {
    disconnect();
    setStep("map");
    setIsJoiningRoom(false);
    window.history.replaceState({}, '', '/ping-pong/online-game');
  };

  const backToHome = () => {
    disconnect();
    setIsJoiningRoom(false);
    window.location.href = '/ping-pong';
  };


  if (step === "map") {
    return <MapSelection onSelect={handleMapSelect} />;
  }

  if (step === "customize") {
    return (
      <PaddleCustomization
        mapType={map}
        onBack={() => setStep("map")}
        onStart={handleStartConnection}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      {roomFromUrl && !isConnected && (
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold text-yellow-400">Connecting to game...</div>
          <div className="text-gray-400">Please wait</div>
        </div>
      )}
      
      {countdown !== null && countdown > 0 && (
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="text-2xl text-emerald-400 mb-4">
            Opponent Found!
          </div>
          <div className="text-xl text-slate-300 mb-2">
            {playerNames.p1} vs {playerNames.p2}
          </div>
          <div className="text-8xl font-bold text-emerald-500 animate-pulse">
            {countdown}
          </div>
          <div className="text-lg text-slate-400">
            Match starts in {countdown} second{countdown !== 1 ? 's' : ''}...
          </div>
        </div>
      )}

      {isConnected && !gameState && countdown === null && (
        <Lobby
          status={roomFromUrl ? "Connecting to private game..." : status}
          isQueuing={roomFromUrl ? true : isQueuing}
          onJoinQueue={() => !roomFromUrl && socket?.emit('join_queue', { mapType: map })}
          onBack={handleLeaveGame}
          onCancelQueue={leaveQueue}
        />
      )}

      {gameState && socket && countdown === null && (
        <div className="flex flex-col items-center w-full">
          <div className="w-full max-w-5xl flex justify-between items-center mb-8 px-6 py-4 bg-gray-900/80 rounded-2xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] backdrop-blur-sm">
            <div
              className="text-3xl font-bold text-left flex-1 truncate pr-4"
              style={{ color: paddleColors.left }}
            >
              {playerNames.p1}
            </div>
            <div className="text-5xl font-black bg-black/40 px-6 py-2 rounded-xl border border-emerald-500/20 flex items-center gap-4 text-emerald-500">
              <span style={{ color: paddleColors.left }}>
                {gameState.p1.score}
              </span>{" "}
              <span className="text-emerald-700 text-3xl">vs</span>
              <span style={{ color: paddleColors.right }}>
                {gameState.p2.score}
              </span>{" "}
            </div>
            <div
              className="text-3xl font-bold text-right flex-1 truncate pl-4"
              style={{ color: paddleColors.right }}
            >
              {playerNames.p2}
            </div>
          </div>

          <GameCanvas
            socket={socket}
            paddleColors={paddleColors}
            playerNames={playerNames}
            initialState={gameState}
            mapType={serverMapType || map}
          />
          <button onClick={handleLeaveGame} className="text-slate-400 hover:text-emerald-600 mt-4">
            Leave Game
          </button>
        </div>
      )}

      {!isConnected && step === "play" && !gameState && (
        <div className="text-emerald-500 animate-pulse">{status}</div>
      )}
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
                ? "It's a Draw!"
                : `${winnerInfo.winner} Wins!`}
            </h2>
            
            <div className="text-3xl font-bold mb-10 text-emerald-500 bg-emerald-500/10 py-3 rounded-xl border border-emerald-500/20 inline-block px-8 font-mono">
              {winnerInfo.score}
            </div>

            <div className="flex flex-col gap-4">
              
              <button
                className="w-full py-4 rounded-xl font-bold text-lg bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                onClick={backToHome}
              >
                Back to game home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}