import { useState, useEffect } from "react";
import { AuthUser, Stats, MatchHistory } from "../types";
import api from "@/lib/api";

export const useGameStats = (user: AuthUser | null) => {
  const [stats, setStats] = useState<Stats>({
    wins: 0,
    losses: 0,
    total: 0,
    winRate: 0,
    draws: 0,
  });
  const [recentHistory, setRecentHistory] = useState<MatchHistory[]>([]);
  const [fullHistory, setFullHistory] = useState<MatchHistory[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);

  useEffect(() => {
    if (!user?.username) return;

    const fetchStats = async () => {
      try {
        const res = await api.get(
          `/stats?username=${user.username}&limit=5&game_type=tic-tac-toe`
        );
        setStats(res.data.stats);
        setRecentHistory(res.data.history);
      } catch (error) {
      }
    };
    fetchStats();
  }, [user]);

  const fetchFullHistory = async () => {
    if (!user?.username) return;

    setLoadingAll(true);
    try {
      const res = await api.get(
        `/stats?username=${user.username}&limit=all&game_type=tic-tac-toe`
      );
      setFullHistory(res.data.history);
    } catch (error) {
    } finally {
      setLoadingAll(false);
    }
  };

  return { stats, recentHistory, fullHistory, loadingAll, fetchFullHistory };
};
