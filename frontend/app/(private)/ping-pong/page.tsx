
"use client";

import Link from "next/link";
import { Users, Wifi, Play } from "lucide-react";
import { useTranslation } from "@/lib/i18n"; 

export default function PingPongMenu() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-6">

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl justify-center">

        <Link href="/ping-pong/local-game" className="flex-1 max-w-md">
          <div className="flex flex-col items-center justify-center p-12 h-full bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-white/10 shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)] hover:border-emerald-500/50 hover:bg-white/5 transition-all duration-300 cursor-pointer group">
            <Users className="w-24 h-24 text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h2 className="text-3xl font-bold mb-3 text-white group-hover:text-emerald-400 transition-colors">{t("LocalGame.title")}</h2>
            <p className="text-slate-400 text-lg text-center mb-8">
              {t("LocalGame.localGameDescription")}
            </p>
            <div className="flex items-center justify-center w-full max-w-[200px] p-4 bg-emerald-600/10 border border-emerald-600/20 rounded-xl text-emerald-500 font-bold group-hover:bg-emerald-600 group-hover:text-black transition-all">
              <Play className="h-6 w-6 mr-3 fill-current" />
              {t("PingPong.startGame")}
            </div>
          </div>
        </Link>

        <Link href="/ping-pong/online-game" className="flex-1 max-w-md">
          <div className="flex flex-col items-center justify-center p-12 h-full bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-white/10 shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)] hover:border-emerald-500/50 hover:bg-white/5 transition-all duration-300 cursor-pointer group">
            <Wifi className="w-24 h-24 text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h2 className="text-3xl font-bold mb-3 text-white group-hover:text-emerald-400 transition-colors">{t("onlineGame.onlineGameTitle")}</h2>
            <p className="text-slate-400 text-lg text-center mb-8">
              {t("onlineGame.onlineGameDescription")}
            </p>
            <div className="flex items-center justify-center w-full max-w-[200px] p-4 bg-emerald-600/10 border border-emerald-600/20 rounded-xl text-emerald-500 font-bold group-hover:bg-emerald-600 group-hover:text-black transition-all">
              <Play className="h-6 w-6 mr-3 fill-current" />
              {t("onlineGame.startonline")}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}