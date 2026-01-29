"use client";

import { useState, useEffect, useContext } from "react";
import { Trophy, Plus, Play } from 'lucide-react';
import { useTranslation } from "@/lib/i18n";
import { GlobalContext } from "@/app/_hooks/global-store";
import api from "@/lib/api";

export default function PlayerForm({
  onSubmit,
}: {
  onSubmit: (players: string[]) => void;
}) {
  const { user } = useContext(GlobalContext)!;
  const [players, setPlayers] = useState(["", "", "", ""]);
  const [aliasLoaded, setAliasLoaded] = useState(false);

  useEffect(() => {
    const fetchAlias = async () => {
      if (!user?.id_user || aliasLoaded) return;
      try {
        const response = await api.get(`/users/${user.id_user}/tournament-alias`);
        if (response.data?.alias) {
          setPlayers(prev => {
            const updated = [...prev];
            updated[0] = response.data.alias;
            return updated;
          });
        }
      } catch (error) {
      }
      setAliasLoaded(true);
    };
    fetchAlias();
  }, [user?.id_user, aliasLoaded]);

  const handleChange = (index: number, value: string) => {
    const updated = [...players];
    updated[index] = value;
    setPlayers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredPlayers = players.filter((p) => p.trim() !== "");

    const uniquePlayers = new Set(filteredPlayers);
    if (uniquePlayers.size !== filteredPlayers.length) {
      alert("Player names must be unique!");
      return;
    }

    if (filteredPlayers.length !== 4) {
      alert("You need exactly 4 players!");
      return;
    }
    window.location.href = `/map-selection?players=${encodeURIComponent(
      JSON.stringify(filteredPlayers)
    )}`;
  };

  const { t } = useTranslation();
  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-10 rounded-3xl border border-white/10 shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)]"
    >
      <div className="flex flex-col items-center mb-8">
        <Trophy className="h-12 w-12 text-emerald-500 mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400">{t("Tournament.tournamentSetup")}</h1>
        <p className="text-sm text-slate-400 mt-2">{t("Tournament.addparticipantToStart")}</p>
      </div>

      <div className="flex justify-between items-center mb-6 px-1">
        <span className="font-semibold text-lg">{t("Tournament.participants")} ({players.length})</span>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-black/30 px-3 py-1 rounded-full text-slate-400 border border-white/5">
          <span>{t("Tournament.min")}: 2</span>
          <span className="w-px h-3 bg-white/10"></span>
          <span>{t("Tournament.max")}: 4</span>
        </div>
      </div>

      <div className="flex flex-col space-y-4 mb-8">
        {players.map((player, i) => (
          <div key={i} className="relative w-full group">
            <input
              type="text"
              placeholder={`Participant ${i + 1}`}
              value={player}
              onChange={(e) => handleChange(i, e.target.value)}
              className="w-full p-4 bg-black/40 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium"
              required
            />
            {i === 0 && player && aliasLoaded && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-emerald-400 font-medium">
                (You)
              </span>
            )}
          </div>
        ))}
      </div>

      {players.length < 4 && (
        <button
          type="button"
          onClick={() => setPlayers([...players, ""])}
          className="w-full flex items-center justify-center p-4 bg-white/5 rounded-xl border border-dashed border-white/20 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all mb-6 group cursor-pointer"
        >
          <div className="bg-emerald-500/20 p-1 rounded-md mr-3 group-hover:bg-emerald-500/30 transition-colors">
            <Plus className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="font-medium">{t("Tournament.addparticipant")}</span>
        </button>
      )}

      <button
        type="submit"
        className="w-full flex items-center justify-center p-4 bg-emerald-600 rounded-xl text-black font-bold text-lg hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
      >
        <Play className="h-5 w-5 mr-3 fill-black" />
        {t("Tournament.startTournament")}
      </button>
    </form>
  );
}
