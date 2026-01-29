"use client";

import React, { useState } from "react";
import {
  Gamepad2,
  Users,
  Trophy,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import TicTacToeIcon from "./secGamecomps/TicTacToeIcon";
import { useUserInfo } from "./hooks/useUserInfo";
import { useGameStats } from "./hooks/useGameStats";
import { MatchRow } from "./secGamecomps/MatchRow";
import { StatCard } from "./secGamecomps/StatCard";
import { HistoryModal } from "./secGamecomps/HistoryModal";

export default function Page() {
  const { t } = useTranslation();
  const { user, loading } = useUserInfo();
  const { stats, recentHistory, fullHistory, loadingAll, fetchFullHistory } =
    useGameStats(user);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewAll = async () => {
    await fetchFullHistory();
    setIsModalOpen(true);
  };


  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f1220] text-white flex items-center justify-center">
        <div className="text-center">
          <Clock className="animate-spin w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-400">{t("SecGameHome.loading")}</p>
        </div>
      </main>
    );
  }


  if (!user) {
    return (
      <main className="min-h-screen bg-[#0f1220] text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">{t("SecGameHome.unableToLoadUser")}</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen text-white py-8 overflow-y-auto">
      <main className="flex flex-col w-full max-w-[1920px] mx-auto px-8 gap-8 mt-20">
        <section className="w-full  p-8 flex flex-col items-center mb-10 group relative overflow-hidden rounded-2xl
        border-2 border-emerald-500/30
        h-full min-h-[140px]">
          <h1 className="text-center text-3xl font-semibold mb-6">{t("SecGameHome.ticTacToe")}</h1>
          <div className="text-4xl mb-3">
            <TicTacToeIcon />
          </div>
          <h2 className="text-2xl font-medium">
            {t("SecGameHome.welcome")}{user.fullName || user.username}
          </h2>
        </section>


        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <Link
            href={{
              pathname: "/secGameHome/tictactoe",
              query: { username: user.username },
            }}
          >
            <div className="p-6    bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-white/10 shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)] hover:border-emerald-500/50 hover:bg-white/5 transition-all duration-300 cursor-pointer group h-full group">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-500/20 p-4 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                  <Users className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-medium">{t("SecGameHome.findMatch")}</h3>
              </div>
              <p className="text-gray-400 mb-3">{t("SecGameHome.joinQueue")} {user.username}</p>
              <p className="text-green-400 text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                {t("SecGameHome.serverStatusOnline")}
              </p>
            </div>
          </Link>

          <Link href="/secGameHome/localGame">
            <div className="  p-6    bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-white/10 shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)] hover:border-emerald-500/50 hover:bg-white/5 transition-all duration-300 cursor-pointer group h-full group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/20 p-4 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                    <Gamepad2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-medium">{t("SecGameHome.localGame")}</h3>
                </div>
              </div>
              <p className="text-gray-400 mb-3">{t("SecGameHome.localGameDesc")}</p>
            </div>
          </Link>
        </div>

        <section className="w-full bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-white/10 shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)] p-8 mb-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" /> {t("SecGameHome.recentMatches")}
            </h3>
            <button
              onClick={handleViewAll}
              className="text-green-400 text-sm hover:underline cursor-pointer"
            >
              {t("SecGameHome.viewAll")}
            </button>
          </div>

          {recentHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-500 flex flex-col items-center">
              <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
              {t("SecGameHome.noMatches")}
            </div>
          ) : (
            <div className="space-y-3">
              {recentHistory.map((match) => (
                <MatchRow
                  key={match.game_id}
                  match={match}
                  currentUser={user.username}
                />
              ))}
            </div>
          )}
        </section>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard
            icon={<Gamepad2 className="w-8 h-8 text-emerald-500" />}
            value={stats.total}
            label={t("SecGameHome.totalGames")}
          />
          <StatCard
            icon={<Trophy className="w-8 h-8 text-emerald-500" />}
            value={stats.wins}
            label={t("SecGameHome.wins")}
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8 text-emerald-500" />}
            value={`${stats.winRate}%`}
            label={t("SecGameHome.winRate")}
          />
          <StatCard
            icon={<Users className="w-8 h-8 text-emerald-500" />}
            value={stats.draws}
            label={t("SecGameHome.draws")}
          />
        </div>

        <HistoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          fullHistory={fullHistory}
          loadingAll={loadingAll}
          currentUser={user.username}
        />
      </main>
    </div>
  );
}
