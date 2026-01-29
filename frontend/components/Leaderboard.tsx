// components/Leaderboard.tsx
"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import api from "@/lib/api";

interface PlayerStats {
  id_user: number;
  username: string;
  alias_name?: string;
  wins: number;
  losses: number;
}

export default function Leaderboard() {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get("/players");
        setPlayers(res.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div className="text-emerald-600 animate-pulse">{t("Leaderboard.loading")}</div>;
  }

  return (
    <div className="w-full max-w-4xl bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
      <div className="bg-zinc-800/50 p-4 border-b border-zinc-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Trophy className="text-yellow-500" /> {t("Leaderboard.globalRankings")}
        </h2>
        <span className="text-xs text-slate-500 bg-black/30 px-2 py-1 rounded">
          {t("Leaderboard.clientSideRendered")}
        </span>
      </div>
      
      <table className="w-full text-left">
        <thead className="bg-black/20 text-slate-400">
          <tr>
            <th className="p-4">{t("Leaderboard.rank")}</th>
            <th className="p-4">{t("Leaderboard.player")}</th>
            <th className="p-4 text-center">{t("Leaderboard.wins")}</th>
            <th className="p-4 text-center">{t("Leaderboard.losses")}</th>
            <th className="p-4 text-right">{t("Leaderboard.winRate")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {players.map((player, index) => {
            const total = player.wins + player.losses;
            const rate = total > 0 ? Math.round((player.wins / total) * 100) : 0;
            
            return (
              <tr key={player.id_user} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-mono text-slate-500">
                  {index === 0 ? <Medal className="text-yellow-500 inline h-5 w-5" /> : 
                   index === 1 ? <Medal className="text-gray-400 inline h-5 w-5" /> :
                   index === 2 ? <Medal className="text-orange-700 inline h-5 w-5" /> :
                   `#${index + 1}`}
                </td>
                <td className="p-4 font-bold text-white">{player.alias_name || player.username}</td>
                <td className="p-4 text-center text-emerald-500 font-bold">{player.wins}</td>
                <td className="p-4 text-center text-red-500">{player.losses}</td>
                <td className="p-4 text-right text-slate-300">{rate}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}