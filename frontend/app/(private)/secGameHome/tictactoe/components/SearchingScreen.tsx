import { Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { GameSettings } from "../types";
import { getSymbols } from "../utils/gameHelpers";

interface SearchingScreenProps {
  username: string;
  gameSettings: GameSettings;
}

export function SearchingScreen({
  username,
  gameSettings,
}: SearchingScreenProps) {
  const { t } = useTranslation();
  const [sym1, sym2] = getSymbols(gameSettings.symbolSet);

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
      <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t("TicTacToe.findingMatch")}</h2>
        <p className="text-slate-400">
          {t("TicTacToe.playingAs")} <span className="text-emerald-400">{username}</span>
        </p>
        <p className="text-slate-500 text-sm mt-2">
          {t("TicTacToe.map")}: {gameSettings.mapSize} • {t("TicTacToe.symbols")}: {sym1}/{sym2}
        </p>
      </div>
    </div>
  );
}
