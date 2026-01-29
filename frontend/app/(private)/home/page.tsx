"use client";

import React, { useState } from "react";
import {
  Trophy,
  Users,
  Gamepad2,
  GamepadDirectional,
  Award,
} from "lucide-react";
import StatsCard from "../_components/dashboard/statcard";
import { StatsCardGame } from "../_components/dashboard/statcard";
import MatchDetailsPopup from "../_components/dashboard/MatchDetails";
import { useDashboardData } from "./useDashboardData";
import RecentGamesList from "../_components/dashboard/RecentGamesList";
import GameTypePieChart from "../_components/dashboard/GameTypePieChart";
import PerformanceWidget from "../_components/dashboard/PerformanceWidget";
import { Game } from "./types";
import { useTranslation } from "@/lib/i18n";


export default function Page() {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Game | null>(null);
  const { t } = useTranslation();
  const {
    user,
    recentGames,
    gameTypesData,
    performanceStats,
    playersMet,
    winRate,
    lossRate,
  } = useDashboardData();

  const handleMatchClick = (match: Game) => {
    setSelectedMatch(match);
    setShowPopup(true);
  };

  return (
    <div className="min-h-screen text-white py-8 overflow-y-auto">
      <main className="flex flex-col w-full max-w-[1920px] mx-auto px-8 gap-8">
        <header className="relative shrink-0 pb-2">
          <div className="mt-5">
            <h2 className="text-6xl font-black tracking-tight leading-tight">
              {t("Dashboard.Greetings")},{" "}
              <span className="text-emerald-400">
                {user?.username}
              </span>
            </h2>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-5 shrink-0">
          <StatsCardGame
            title={t("GameNames.PingPong")}
            value={
              gameTypesData.find((g) => g.name.toLowerCase() === "ping-pong")
                ?.value || 0
            }
            icon={GamepadDirectional}
          />
          <StatsCardGame
            title={t("GameNames.TicTacToe")}
            value={
              gameTypesData.find((g) => g.name.toLowerCase() === "tic-tac-toe")
                ?.value || 0}
            icon={GamepadDirectional} />
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          <StatsCard
            title={t("Dashboard.TotalGames")}
            value={performanceStats.totalGames}
            icon={Gamepad2}
          />
          <StatsCard title={t("Dashboard.PlayersMet")} value={playersMet} icon={Users} />
          <StatsCard title={t("Dashboard.WinRate")} value={`${winRate}%`} icon={Trophy} />
          <StatsCard title={t("Dashboard.lossRate")} value={`${lossRate}%`} icon={Award} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
          <RecentGamesList
            games={recentGames}
            onMatchClick={handleMatchClick} />
          <aside className="space-y-6 flex flex-col">
            <GameTypePieChart data={gameTypesData} />
            <PerformanceWidget stats={performanceStats} winRate={winRate} />
          </aside>
        </section>
        <MatchDetailsPopup
          showPopup={showPopup}
          setShowPopup={setShowPopup}
          matchData={selectedMatch}
        />
      </main>
    </div>
  );
}
