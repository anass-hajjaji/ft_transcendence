import { useState, useEffect } from "react";
import { AuthUser, Game, GameTypeData, PerformanceStats, MatchHistory } from "./types";

import api from "@/lib/api";


function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

export function useDashboardData() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [gameTypesData, setGameTypesData] = useState<GameTypeData[]>([]);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats>({
    wins: 0,
    losses: 0,
    draws: 0,
    totalGames: 0,
    avgPointsPerGame: 0,
    totalPoints: 0,
    bestStreak: 0,
  });
  const [playersMet, setPlayersMet] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/auth/me');
        const data = res.data;
        const userData = data.user || data;

        setUser({
          username: userData.username,
          fullName:
            userData.fullName || userData.full_name || userData.username,
          email: userData.email,
        });

        const statsRes = await api.get(`/stats?username=${userData.username}&limit=10`);
        const statsData = statsRes.data;

        let actualWins = 0;
        let actualLosses = 0;
        let actualDraws = 0;
        const history: MatchHistory[] = statsData.history || [];

        history.forEach((match) => {
          const isDraw = match.win_score === 0 && match.lose_score === 0;
          const gameType = match.game_type?.toLowerCase();
          const isPingPong = gameType === 'ping-pong' || gameType === 'pong';

          if (isDraw && !isPingPong) {
            actualDraws++;
          } else if (match.winner_name === userData.username) {
            actualWins++;
          } else if (match.loser_name === userData.username) {
            actualLosses++;
          }
        });

        const actualTotal = actualWins + actualLosses + actualDraws;

        setPerformanceStats((prev) => ({
          ...prev,
          wins: actualWins,
          losses: actualLosses,
          draws: actualDraws,
          totalGames: actualTotal,
        }));

        const formattedGames = history.map((match) => {
          const isWin = match.winner_name === userData.username;
          const isDraw = match.win_score === 0 && match.lose_score === 0;
          const gameType = match.game_type?.toLowerCase();
          const isPingPong = gameType === 'ping-pong' || gameType === 'pong';

          return {
            id: match.game_id,
            game: match.game_type || "Ping-Pong",
            opponent: isWin ? match.loser_name : match.winner_name,
            time: getTimeAgo(new Date(match.create_date.replace(' ', 'T') + 'Z')),
            score: `${match.win_score}–${match.lose_score}`,
            win: isWin,
            result: (isDraw && !isPingPong) ? 'draw' : (isWin ? 'win' : 'loss') as 'win' | 'loss' | 'draw',
          };
        });
        setRecentGames(formattedGames);

        const gameTypes: { [key: string]: number } = {};
        history.forEach((match) => {
          const type = match.game_type || "Ping-Pong";
          gameTypes[type] = (gameTypes[type] || 0) + 1;
        });

        const gameTypesArray = Object.entries(gameTypes).map(
          ([name, value]) => ({ name, value })
        );
        setGameTypesData(
          gameTypesArray.length > 0
            ? gameTypesArray
            : [{ name: "Ping-Pong", value: statsData.stats?.total || 0 }]
        );

        const uniquePlayers = new Set<string>();
        history.forEach((match) => {
          uniquePlayers.add(match.winner_name);
          uniquePlayers.add(match.loser_name);
        });
        setPlayersMet(Math.max(0, uniquePlayers.size - 1));
      } catch (error) {
      }
    };

    fetchData();
  }, []);

  const winRate =
    performanceStats.totalGames > 0
      ? Math.round((performanceStats.wins / performanceStats.totalGames) * 100)
      : 0;

  const lossRate =
    performanceStats.totalGames > 0
      ? Math.round((performanceStats.losses / performanceStats.totalGames) * 100)
      : 0;

  const drawRate =
    performanceStats.totalGames > 0
      ? Math.round((performanceStats.draws / performanceStats.totalGames) * 100)
      : 0;

  return {
    user,
    recentGames,
    gameTypesData,
    performanceStats,
    playersMet,
    winRate,
    lossRate,
    drawRate,
  };
}
