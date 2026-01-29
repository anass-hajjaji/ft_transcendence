import { Settings, Users, Grid3x3, Grid2x2, X, Plus, Minus } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { GameSettings } from "../types";
import { getSymbols } from "../utils/gameHelpers";
import { GameHeader } from "./GameHeader";

interface SettingsScreenProps {
  gameSettings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onStartMatchmaking: () => void;
}

export function SettingsScreen({
  gameSettings,
  onSettingsChange,
  onStartMatchmaking,
}: SettingsScreenProps) {
  const { t } = useTranslation();
  const symbols = getSymbols(gameSettings.symbolSet);

  return (
    <main className="min-h-screen bg-[#020617] text-white font-sans">
      <GameHeader
        gameSettings={gameSettings}
        gameCount={1}
        isSettings
      />

      <div className="max-w-2xl mx-auto p-6 mt-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-8 h-8 text-emerald-500" />
            <h2 className="text-2xl font-bold">{t("TicTacToe.customizeYourGame")}</h2>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-slate-300">
              {t("TicTacToe.selectMapSize")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() =>
                  onSettingsChange({ ...gameSettings, mapSize: "3x3" })
                }
                className={`p-6 rounded-xl border-2 transition-all ${gameSettings.mapSize === "3x3"
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-700 bg-slate-800 hover:border-slate-600"
                  }`}
              >
                <Grid3x3 className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                <div className="text-center">
                  <div className="font-bold text-lg">{t("TicTacToe.classic3x3")}</div>
                  <div className="text-sm text-slate-400 mt-1">
                    {t("TicTacToe.traditionalGame")}
                  </div>
                </div>
              </button>

              <button
                onClick={() =>
                  onSettingsChange({ ...gameSettings, mapSize: "4x4" })
                }
                className={`p-6 rounded-xl border-2 transition-all ${gameSettings.mapSize === "4x4"
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-700 bg-slate-800 hover:border-slate-600"
                  }`}
              >
                <Grid2x2 className="w-12 h-12 mx-auto mb-3 text-blue-400" />
                <div className="text-center">
                  <div className="font-bold text-lg">{t("TicTacToe.advanced4x4")}</div>
                  <div className="text-sm text-slate-400 mt-1">
                    {t("TicTacToe.moreChallenging")}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-slate-300">
              {t("TicTacToe.chooseSymbolSet")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() =>
                  onSettingsChange({ ...gameSettings, symbolSet: "XO" })
                }
                className={`p-6 rounded-xl border-2 transition-all ${gameSettings.symbolSet === "XO"
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-700 bg-slate-800 hover:border-slate-600"
                  }`}
              >
                <div className="flex justify-center gap-4 mb-3">
                  <X className="w-10 h-10 text-emerald-400" />
                  <div className="w-10 h-10 rounded-full border-4 border-blue-400"></div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{t("TicTacToe.xAndO")}</div>
                  <div className="text-sm text-slate-400 mt-1">
                    {t("TicTacToe.classicSymbols")}
                  </div>
                </div>
              </button>

              <button
                onClick={() =>
                  onSettingsChange({ ...gameSettings, symbolSet: "+-" })
                }
                className={`p-6 rounded-xl border-2 transition-all ${gameSettings.symbolSet === "+-"
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-700 bg-slate-800 hover:border-slate-600"
                  }`}
              >
                <div className="flex justify-center gap-4 mb-3">
                  <Plus className="w-10 h-10 text-emerald-400" />
                  <Minus className="w-10 h-10 text-blue-400" />
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{t("TicTacToe.plusAndMinus")}</div>
                  <div className="text-sm text-slate-400 mt-1">
                    {t("TicTacToe.alternativeStyle")}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-semibold mb-3 text-slate-400 text-center">
              {t("TicTacToe.preview")}
            </h3>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-sm text-slate-500 mb-2">{t("TicTacToe.map")}</div>
                <div className="text-2xl font-bold text-emerald-400">
                  {gameSettings.mapSize}
                </div>
              </div>
              <div className="h-12 w-px bg-slate-700"></div>
              <div className="text-center">
                <div className="text-sm text-slate-500 mb-2">{t("TicTacToe.symbols")}</div>
                <div className="text-2xl font-bold">
                  <span className="text-emerald-400">{symbols[0]}</span>
                  <span className="text-slate-600 mx-2">/</span>
                  <span className="text-blue-400">{symbols[1]}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onStartMatchmaking}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Users size={24} />
            {t("TicTacToe.startMatchmaking")}
          </button>
        </div>
      </div>
    </main>
  );
}
