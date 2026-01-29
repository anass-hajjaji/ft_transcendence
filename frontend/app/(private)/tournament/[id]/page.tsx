"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { startPong, stopPong } from "@/lib/ponggame";
import {
  updateTournamentInApi,
  getTournamentFromApi,
  getGamesFromApi,
} from "@/lib/api";
import { Play} from "lucide-react";
import TournamentBracket from "@/app/(private)/_components/tournament-bracket";
import { useTranslation } from "@/lib/i18n";

interface TournamentData {
  players: string[];
  winners: string[];
}
interface PlayedGame {
  winner_name: string;
}

export default function TournamentPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const tournamentId = params.id as string;
  const map = searchParams.get("map") as "default" | "inverted" | null;

  const [colorMap, setColorMap] = useState<Record<string, string>>({});

  const [matches, setMatches] = useState<[string, string][]>([]);
  const [winnersQueue, setWinnersQueue] = useState<string[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [players, setPlayers] = useState<string[]>([]); 
  const [pastWinners, setPastWinners] = useState<string[]>([]); 

  const [viewingBracket, setViewingBracket] = useState(true); 
  const [viewingMatchUp, setViewingMatchUp] = useState(true); 
  const [champion, setChampion] = useState<string | null>(null); 

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scores, setScores] = useState({ left: 0, right: 0 });
  const [winnerInfo, setWinnerInfo] = useState<{
    winner: string;
    score: string;
  } | null>(null);

  useEffect(() => {
    if (!tournamentId) return;

    const colorsParam = searchParams.get("colors");
    if (colorsParam) {
      try {
        setColorMap(JSON.parse(decodeURIComponent(colorsParam)));
      } catch (e) {
      }
    }

    const buildBracket = (
      initialPlayers: string[],
      playedGames: PlayedGame[]
    ) => {
      let currentMatches: [string, string][] = [];
      let winners: string[] = [];
      const historyWinners: string[] = [];

      for (let i = 0; i < initialPlayers.length; i += 2) {
        if (i + 1 < initialPlayers.length) {
          currentMatches.push([initialPlayers[i], initialPlayers[i + 1]]);
        } else {
          currentMatches.push([initialPlayers[i], "Bye"]);
        }
      }

      for (const game of playedGames) {
        winners.push(game.winner_name);
        historyWinners.push(game.winner_name);

        if (winners.length >= 2) {
          currentMatches.push([winners[0], winners[1]]);
          winners = winners.slice(2);
        }
      }

      setMatches(currentMatches);
      setWinnersQueue(winners);
      setPlayers(initialPlayers);
      setPastWinners(historyWinners);
      setCurrentMatchIndex(playedGames.length);
      setIsLoading(false);
    };

    const loadTournament = async () => {
      try {
        const tournamentData: TournamentData = await getTournamentFromApi(
          tournamentId
        );
        const playedGames: PlayedGame[] = await getGamesFromApi(tournamentId);

        buildBracket(tournamentData.players, playedGames);
      } catch (err) {
        router.push("/home");
      }
    };

    loadTournament();
  }, [tournamentId, router, searchParams]);

  const currentMatch = matches ? matches[currentMatchIndex] : null;

  const handleMatchEnd = (
    winner: string | null,
    finalScores: { left: number; right: number }
  ) => {
    const finalScore = `${finalScores.left} - ${finalScores.right}`;
    if (winner) {
      setWinnerInfo({ winner, score: finalScore });
    } else {
      setWinnerInfo({ winner: "Draw!", score: finalScore });
    }
  };

  useEffect(() => {
    if (isLoading || viewingBracket || viewingMatchUp || !canvasRef.current || !currentMatch || champion) return;

    stopPong();
    setScores({ left: 0, right: 0 });

    const [player1, player2] = currentMatch;

    if (player2 === "Bye") {
      handleMatchEnd(player1, { left: 1, right: 0 });
      return;
    }

    console.log("Starting game between:", player1, "and", player2);

    const ctx = canvasRef.current.getContext("2d");
    if (ctx)
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const p1Color = colorMap[player1] || "#10b981";
    const p2Color = colorMap[player2] || "#10b981";

    startPong({
      canvas: canvasRef.current,
      leftPlayer: player1,
      rightPlayer: player2,
      handleMatchEnd,
      winScore: 5,
      map: map || "default",
      onScoreUpdate: setScores,
      leftPaddleColor: p1Color,
      rightPaddleColor: p2Color,
    });

    return () => {
      stopPong();
    };
  }, [currentMatch, map, isLoading, colorMap, viewingMatchUp, viewingBracket, champion]);

  const handleNextMatch = async () => {
    if (!winnerInfo || !matches || !tournamentId) return;

    const currentWinner = winnerInfo.winner;
    const newQueue = [...winnersQueue, currentWinner];
    const newHistory = [...pastWinners, currentWinner];
    let newMatches = [...matches];

    if (newQueue.length >= 2) {
      const newMatch: [string, string] = [newQueue[0], newQueue[1]];
      newMatches.push(newMatch);
      setMatches(newMatches);
      setWinnersQueue(newQueue.slice(2));
    } else {
      setWinnersQueue(newQueue);
    }

    setPastWinners(newHistory);

    let nextIndex = currentMatchIndex + 1;
    let nextMatch = newMatches[nextIndex];

    while (nextMatch && nextMatch[1] === "Bye") {
      const winner = nextMatch[0];
      newQueue.push(winner);
      newHistory.push(winner);

      if (newQueue.length >= 2) {
        const m: [string, string] = [newQueue[0], newQueue[1]];
        newMatches.push(m);
        newQueue.splice(0, 2);
      }

      nextIndex++;
      nextMatch = newMatches[nextIndex];
    }

    let localQueue = [...winnersQueue, currentWinner];
    let localMatches = [...matches];
    let localIndex = currentMatchIndex + 1;

    let active = true;
    while (active) {
      active = false;

      while (localQueue.length >= 2) {
        const m: [string, string] = [localQueue[0], localQueue[1]];
        localMatches.push(m);
        localQueue.splice(0, 2);
        active = true;
      }

      if (localIndex < localMatches.length) {
        const m = localMatches[localIndex];
        if (m[1] === "Bye") {
          localQueue.push(m[0]);
          localIndex++;
          active = true;
        }
      }
    }

    setMatches(localMatches);
    setWinnersQueue(localQueue);

    if (localIndex < localMatches.length) {
      setCurrentMatchIndex(localIndex);
      setWinnerInfo(null);

      const totalMatches = players.length - 1;
      const isFinals = localIndex === totalMatches - 1;

      if (isFinals) {
        setViewingBracket(true);
      } else {
        setViewingBracket(false);
        setViewingMatchUp(true);
      }

    } else {
      if (localQueue.length === 1 && localQueue[0] === currentWinner) {
        handleChampion(localQueue[0]);
      } else if (localQueue.length === 1) {
        handleChampion(localQueue[0]);
      } else {
        setWinnerInfo(null);
      }
    }
  };

  const handleChampion = async (winner: string) => {
    setChampion(winner);
    setWinnerInfo(null);
    if (tournamentId) {
      try {
        await updateTournamentInApi(tournamentId, winner);
      } catch (error) {
        console.error("Failed to update tournament winner:", error);
      }
    }
  };

  const handleStartMatch = () => {
    setViewingMatchUp(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="animate-pulse text-emerald-500 text-xl font-bold">{t("Tournament.loading")}</div>
      </div>
    );
  }

  if (champion) {
    return (
      <TournamentBracket
        players={players}
        matches={matches}
        winners={pastWinners}
        tournamentWinner={champion}
        onStartTournament={() => router.push("/home")}
      />
    );
  }

  if (viewingBracket) {
    return (
      <TournamentBracket
        players={players}
        matches={matches}
        winners={pastWinners}
        onStartTournament={() => {
          setViewingBracket(false);
          setViewingMatchUp(true);
        }}
      />
    );
  }

  if (viewingMatchUp && currentMatch) {
    const p1 = currentMatch[0];
    const p2 = currentMatch[1];
    const p1Color = colorMap[p1] || "#10b981";
    const p2Color = colorMap[p2] || "#10b981";

    if (p2 === "Bye") {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
          <h1 className="text-3xl font-bold text-slate-500 mb-8">{t("Tournament.round")} {Math.floor(currentMatchIndex / 2) + 1}</h1>
          <div className="text-2xl mb-8">
            <span style={{ color: p1Color }}>{p1}</span> {t("Tournament.bye")}
          </div>
          <button
            onClick={() => {
              handleStartMatch();
            }}
            className="px-8 py-3 bg-emerald-600 rounded-lg text-black font-bold hover:bg-emerald-500 transition"
          >
            {t("Tournament.continue")}
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
        <h1 className="text-4xl font-bold text-emerald-600 mb-16 tracking-wider">{t("Tournament.upcomingMatch")}</h1>

        <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-32 h-32 rounded-full border-4 flex items-center justify-center bg-zinc-900 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
              style={{ borderColor: p1Color, boxShadow: `0 0 20px ${p1Color}40` }}
            >
              <span className="text-4xl font-bold" style={{ color: p1Color }}>{p1.charAt(0)}</span>
            </div>
            <div className="text-3xl font-bold" style={{ color: p1Color }}>{p1}</div>
          </div>

          <div className="text-5xl font-black text-slate-700 italic">{t("Tournament.vs")}</div>

          <div className="flex flex-col items-center gap-4">
            <div
              className="w-32 h-32 rounded-full border-4 flex items-center justify-center bg-zinc-900 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
              style={{ borderColor: p2Color, boxShadow: `0 0 20px ${p2Color}40` }}
            >
              <span className="text-4xl font-bold" style={{ color: p2Color }}>{p2.charAt(0)}</span>
            </div>
            <div className="text-3xl font-bold" style={{ color: p2Color }}>{p2}</div>
          </div>
        </div>

        <button
          onClick={handleStartMatch}
          className="group relative px-10 py-5 bg-emerald-600 rounded-2xl text-black font-black text-2xl hover:bg-emerald-500 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95"
        >
          <span className="flex items-center gap-3">
            {t("Tournament.startMatch")} <Play className="w-6 h-6 fill-black" />
          </span>
        </button>
      </div>
    );
  }

  const player1Name = currentMatch ? currentMatch[0] : "";
  const player2Name = currentMatch ? currentMatch[1] : "";
  const p1Color = colorMap[player1Name] || "#10b981";
  const p2Color = colorMap[player2Name] || "#10b981";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <h1 className="text-3xl font-bold text-emerald-600 mb-4">{t("Sidebar.tournament")}</h1>

      {currentMatch && currentMatch.length === 2 && (
        <div className="w-full max-w-[800px] flex justify-between items-center mb-8 px-6 py-4 bg-gray-900/80 rounded-2xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] backdrop-blur-sm">
          <div
            className="text-2xl font-bold text-left flex-1"
            style={{ color: p1Color }}
          >
            {currentMatch[0]}
          </div>
          <div className="text-5xl font-black bg-black/40 px-6 py-2 rounded-xl border border-emerald-500/20 flex items-center gap-4 text-emerald-500">
            <span style={{ color: p1Color }}>
              {scores.left}
            </span>{" "}
            <span className="text-emerald-700 text-3xl">{t("Tournament.vs")}</span>
            <span style={{ color: p2Color }}>
              {scores.right}
            </span>{" "}
          </div>
          <div
            className="text-2xl font-bold text-right flex-1"
            style={{ color: p2Color }}
          >
            {currentMatch[1]}
          </div>
        </div>
      )}

      <div className="w-full max-w-[1024px] mb-4 relative group">
        <div className="absolute -inset-1 bg-linear-to-r from-emerald-600 to-emerald-900 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <canvas
          ref={canvasRef}
          width={1024}
          height={720}
          className="relative block w-full h-auto border-2 border-emerald-500/20 bg-black rounded-lg shadow-2xl"
        />
      </div>

      {winnerInfo && (
        <div
          className={`absolute p-10 rounded-3xl text-center shadow-2xl border max-w-lg w-full transform transition-all scale-100 ${map === "inverted"
            ? "bg-black text-emerald-500 border-white/10 shadow-emerald-900/20"
            : "bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-white/10 shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)]"
            }`}
        >
          <h2 className="text-5xl font-black mb-6 bg-clip-text text-transparent bg-linear-to-br from-white to-slate-400">
            {winnerInfo.winner === t("Tournament.draw")
              ? t("Tournament.draw")
              : `${winnerInfo.winner} ${t("Tournament.wins")}`}
          </h2>
          <p className="text-2xl mb-10 text-emerald-500 bg-emerald-500/10 py-3 rounded-xl border border-emerald-500/20 inline-block px-8">{t("Tournament.finalScore")}: {winnerInfo.score}</p>
          <div className="flex gap-4 justify-center">
            <button
              className="w-full py-4 rounded-xl font-bold text-lg bg-emerald-600 text-black hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/20 transition-all cursor-pointer"
              onClick={handleNextMatch}
            >
              {t("Tournament.nextMatch")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}