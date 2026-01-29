import React from "react";
import { Play } from "lucide-react";
import Link from "next/link";
import { MapType } from "./types";
import { useTranslation } from "@/lib/i18n";
interface Props {
  onSelect: (map: MapType) => void;
}

export default function MapSelection({ onSelect }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6">
      <h1 className="text-4xl font-bold text-slate-600 mb-12">
        {t("PingPong.step1Title")}
      </h1>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl justify-center">
        <div
          className="flex-1 max-w-md flex flex-col items-center justify-center p-12 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-white/10 shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)] hover:border-emerald-500/50 hover:bg-white/5 transition-all duration-300 cursor-pointer group"
          onClick={() => onSelect("default")}
        >
          <h2 className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors mb-4">
            {t("PingPong.defaultGameTitle")}
          </h2>
          <div className="w-64 h-48 border-4 border-emerald-600 bg-black flex items-center justify-between p-2 mb-8 group-hover:scale-105 transition-transform duration-300">
            <div className="w-4 h-16 bg-emerald-600"></div>
            <div className="w-4 h-16 bg-emerald-600"></div>
          </div>
          <div className="flex items-center justify-center w-full max-w-[200px] p-4 bg-emerald-600/10 border border-emerald-600/20 rounded-xl text-emerald-500 font-bold group-hover:bg-emerald-600 group-hover:text-black transition-all">
            <Play className="h-6 w-6 mr-3 fill-current" />
            {t("PingPong.selectDefault")}
          </div>
        </div>
        <div
          className="flex-1 max-w-md flex flex-col items-center justify-center p-12 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-white/10 shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)] hover:border-emerald-500/50 hover:bg-white/5 transition-all duration-300 cursor-pointer group"
          onClick={() => onSelect("inverted")}
        >
          <h2 className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors mb-4">
            {t("PingPong.obstacleMapTitle")}
          </h2>
          <div className="w-64 h-48 border-4 border-slate-700 bg-slate-950 flex items-center justify-between p-2 mb-8 group-hover:scale-105 transition-transform duration-300 relative">
            <div className="w-4 h-16 bg-white z-10"></div>
            <div className="w-4 h-16 bg-white z-10"></div>

            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white/20 border border-white/40"></div>
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white/20 border border-white/40"></div>
          </div>
          <div className="flex items-center justify-center w-full max-w-[200px] p-4 bg-zinc-700/50 border border-zinc-600 rounded-xl text-slate-300 font-bold group-hover:bg-zinc-700 group-hover:text-white transition-all">
            <Play className="h-6 w-6 mr-3" />
            {t("PingPong.selectObstacle")}
          </div>
        </div>
      </div>
      <Link href="/ping-pong" className="inline-block px-6 py-3 bg-emerald-600/10 text-slate-400 border border-emerald-600/20 hover:text-emerald-600 hover:bg-emerald-600/10 mt-12 transition-colors">
        {t("PingPong.backToGameMode")}
      </Link>
    </div>
  );
}
