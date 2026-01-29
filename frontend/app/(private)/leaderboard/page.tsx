"use client";
import dynamic from "next/dynamic";
import { useTranslation } from "@/lib/i18n";

const DynamicLeaderboard = dynamic(
  () => import("@/components/Leaderboard"), 
  { ssr: false }
);

export default function LeaderboardPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center min-h-screen bg-black p-8">
      <div className="w-full max-w-4xl flex justify-end mb-6">
      </div>

      <h1 className="text-4xl font-bold text-emerald-600 mb-2">{t("Leaderboard.title")}</h1>
      <p className="text-slate-400 mb-12">
        {t("Leaderboard.subtitle")}
      </p>

      <DynamicLeaderboard />
    </div>
  );
}