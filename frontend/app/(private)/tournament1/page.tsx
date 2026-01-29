"use client";

import { useState, useEffect, useContext } from "react";
import { Trophy, ArrowRight } from 'lucide-react';
import api from "@/lib/api";
import { toast } from "react-toastify";
import { GlobalContext } from "@/app/_hooks/global-store";
import PlayerForm from "@/components/PlayerForm";

import { useTranslation } from "@/lib/i18n";

function AliasSetupForm({ onComplete }: { onComplete: (alias: string) => void }) {
  const { t } = useTranslation();
  const { user } = useContext(GlobalContext)!;
  const [alias, setAlias] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!alias.trim()) {
      toast.error("Please enter an alias");
      return;
    }

    if (!user?.id_user) {
      toast.error("User not found");
      return;
    }

    setSaving(true);
    try {
      const response = await api.put(`/users/${user.id_user}/tournament-alias`, {
        alias: alias.trim()
      });

      if (response.status === 200) {
        toast.success("Alias set!");
        onComplete(alias.trim());
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error("This alias is already taken");
      } else {
        toast.error("Failed to save alias");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8 rounded-2xl border border-white/10 shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)]"
    >
      <div className="flex flex-col items-center mb-6">
        <Trophy className="h-10 w-10 text-emerald-500 mb-3 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400">
          {t("Tournament.setAlias")}
        </h1>
        <p className="text-xs text-slate-400 mt-1 text-center">
          {t("Tournament.chooseUniqueName")}
        </p>
      </div>

      <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400">
        {t("Tournament.aliasDescription")}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder={t("Tournament.enterAlias")}
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          maxLength={30}
          autoFocus
          className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={saving || !alias.trim()}
        className={`w-full flex items-center justify-center p-3 rounded-xl font-bold transition-all ${saving || !alias.trim()
          ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
          : 'bg-emerald-600 text-black hover:bg-emerald-500 active:scale-[0.98]'
          }`}
      >
        {saving ? (
          <span className="animate-spin mr-2">⏳</span>
        ) : (
          <ArrowRight className="h-4 w-4 mr-2" />
        )}
        {t("Tournament.continue")}
      </button>
    </form>
  );
}

export default function TournamentSetupPage() {
  const { user } = useContext(GlobalContext)!;
  const [userAlias, setUserAlias] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsAliasSetup, setNeedsAliasSetup] = useState(false);

  useEffect(() => {
    const checkAlias = async () => {
      if (!user?.id_user) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/users/${user.id_user}/tournament-alias`);
        if (response.data?.alias) {
          setUserAlias(response.data.alias);
          setNeedsAliasSetup(false);
        } else {
          setNeedsAliasSetup(true);
        }
      } catch (error) {
        setNeedsAliasSetup(true);
      }
      setLoading(false);
    };

    checkAlias();
  }, [user?.id_user]);

  const handleAliasComplete = (alias: string) => {
    setUserAlias(alias);
    setNeedsAliasSetup(false);
  };

  const handleStart = (players: string[]) => {
    const matches: [string, string][] = [];
    for (let i = 0; i < players.length; i += 2) {
      if (i + 1 < players.length) matches.push([players[i], players[i + 1]]);
      else matches.push([players[i], "Bye"]);
    }

    const matchesParam = encodeURIComponent(JSON.stringify(matches));

    window.location.href = `/tournament?matches=${matchesParam}`;
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white text-lg">Loading...</div>
      </main>
    );
  }

  if (needsAliasSetup) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <AliasSetupForm onComplete={handleAliasComplete} />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black">
      <PlayerForm onSubmit={handleStart} />
    </main>
  );
}
