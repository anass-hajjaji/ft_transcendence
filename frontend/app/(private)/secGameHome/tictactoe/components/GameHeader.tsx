import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { GameSettings } from "../types";
import { getSymbols } from "../utils/gameHelpers";
import { useTranslation } from "@/lib/i18n";

interface GameHeaderProps {
  gameSettings: GameSettings;
  gameCount: number;
  isSettings?: boolean;
}

export function GameHeader({
  gameSettings,
  gameCount,
  isSettings = false,
}: GameHeaderProps) {
  const { t } = useTranslation();
  const [sym1, sym2] = getSymbols(gameSettings.symbolSet);

  return (
    <header className="p-6 flex items-center justify-between max-w-7xl mx-auto">
      <Link
        href="/secGameHome"
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors text-sm cursor-pointer"
      >
        <ArrowLeft size={16} />
        {t("TicTacToe.back")}
      </Link>
      <div className="text-center">
        <h1 className="text-3xl font-semibold">{t("GameNames.TicTacToe")}</h1>
        <p className="text-slate-500 text-sm mt-1">
          {isSettings ? (
            t("TicTacToe.gameSettings")
          ) : (
            <>
              {gameSettings.mapSize} • {sym1}/{sym2}
              {gameCount > 1 && (
                <span className="ml-2 text-emerald-400">{t("TicTacToe.game")} {gameCount}</span>
              )}
            </>
          )}
        </p>
      </div>
      <div className="w-[120px]" />
    </header>
  );
}
