"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Play } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

const COLOR_SWATCHES = [
  { name: "Purple", hex: "#473472" },
  { name: "Red", hex: "#BF092F" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Orange", hex: "#F4631E" },
];

export default function CustomizeTournamentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const tournamentId = searchParams.get("tournamentId");
  const map = searchParams.get("map");
  const playersParam = searchParams.get("players");

  const [playerColors, setPlayerColors] = useState<Record<string, string>>({});
  const [players, setPlayers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (playersParam) {
      try {
        const parsedPlayers: string[] = JSON.parse(decodeURIComponent(playersParam));
        setPlayers(parsedPlayers);

        const initialColors: Record<string, string> = {};
        parsedPlayers.forEach((player, index) => {
          initialColors[player] = COLOR_SWATCHES[index % COLOR_SWATCHES.length].hex;
        });
        setPlayerColors(initialColors);

      } catch (e) {
        setError("Failed to load player data.");
      }
    }
  }, [playersParam]);

  const handleColorChange = (playerName: string, color: string) => {
    setPlayerColors((prev) => ({
      ...prev,
      [playerName]: color,
    }));
  };

  const handleStart = () => {
    if (!tournamentId || !map) return;

    if (map === 'inverted') {
      const greenUsed = Object.values(playerColors).some(color => color === '#10B981');
      if (greenUsed) {
        alert(t("Tournament.customization.colorValidationInverted"));
        return;
      }
    }
    if (map === 'default') {
      const blackUsed = Object.values(playerColors).some(color => color === '#000000');
      if (blackUsed) {
        alert(t("Tournament.customization.colorValidationDefault"));
        return;
      }
    }

    const colorsString = encodeURIComponent(JSON.stringify(playerColors));

    router.push(
      `/tournament/${tournamentId}?map=${map}&colors=${colorsString}`
    );
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <h1 className="text-2xl text-red-500 mb-4">{t("Tournament.customization.errorTitle")}</h1>
        <Link
          href="/tournament1"
          className="px-6 py-3 rounded font-bold bg-emerald-600 text-black hover:bg-emerald-700 transition-all"
        >
          {t("Tournament.customization.startOver")}
        </Link>
      </div>
    );
  }

  if (!tournamentId || !map || players.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        {t("Tournament.customization.loadingPlayerData")}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold text-emerald-600 mb-8">
        {t("Tournament.customization.title")}
      </h1>
      <div className="bg-zinc-900 p-8 rounded-2xl flex flex-col gap-8 w-full max-w-lg">
        <p className="text-slate-400 text-center">
          {t("Tournament.customization.description")}
        </p>

        <div className="flex flex-col gap-6 max-h-[40vh] overflow-y-auto pr-2">
          {players.map((player) => (
            <div key={player}>
              <label
                className="text-lg font-semibold text-slate-300 mb-3 block"
                style={{ color: playerColors[player] || '#ffffff' }}
              >
                {player}
              </label>
              <div className="flex gap-3 flex-wrap mb-2 ml-2">
                {COLOR_SWATCHES.map((color) => (
                  <button
                    key={`${player}-${color.hex}`}
                    aria-label={color.name}
                    onClick={() => handleColorChange(player, color.hex)}
                    className={`w-10 h-10 rounded-lg cursor-pointer transition-all ${playerColors[player] === color.hex
                        ? 'ring-4 ring-offset-2 ring-offset-zinc-900 ring-white'
                        : 'ring-4 ring-transparent hover:ring-zinc-600'
                      }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-4 border-t border-zinc-700 pt-6">
          <Link
            href={`/map-selection?players=${playersParam || '[]'}`}
            className="w-full text-center p-3 bg-zinc-700 rounded-md text-slate-300 font-bold hover:bg-zinc-600 transition"
          >
            {t("Tournament.customization.backToMaps")}
          </Link>
          <button
            onClick={handleStart}
            className="w-full flex items-center justify-center p-3 bg-emerald-600 rounded-md text-black font-bold hover:bg-emerald-700 transition"
          >
            <Play className="h-5 w-5 mr-2 fill-black" />
            {t("Tournament.customization.startTournament")}
          </button>
        </div>
      </div>
    </div>
  );
}