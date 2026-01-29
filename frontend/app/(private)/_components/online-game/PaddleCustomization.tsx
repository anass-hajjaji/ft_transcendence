import React, { useState } from "react";
import { Play } from "lucide-react";
import { MapType, PaddleColors } from "./types";
import { useTranslation } from "@/lib/i18n";

const COLOR_SWATCHES = [
  { name: "Purple", hex: "#473472" },
  { name: "Red", hex: "#BF092F" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Orange", hex: "#F4631E" },
];

interface Props {
  mapType: MapType;
  onBack: () => void;
  onStart: (colors: PaddleColors) => void;
}

export default function PaddleCustomization({
  mapType,
  onBack,
  onStart,
}: Props) {
  const [colors, setColors] = useState<PaddleColors>({
    left: "#BF092F",
    right: "#3B82F6",
  });

  const { t } = useTranslation();

  const handleStart = () => {
    if (mapType === 'inverted' && (colors.left === '#ffffff' || colors.right === '#ffffff')) {
      alert(`The Obstacle Map obstacles are white! Please choose a different paddle color.`);
      return;
    }
    if (mapType === 'default' && (colors.left === '#000000' || colors.right === '#000000')) {
      alert(`The Default Map background is black! Please choose a different color.`);
      return;
    }
    onStart(colors);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold text-slate-600 mb-12">
        {t("PingPong.step2Title")}
      </h1>
      <div className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 p-10 rounded-3xl border border-white/10 shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)] flex flex-col gap-8 w-full max-w-lg">

        <div>
          <label className="text-lg font-semibold text-slate-300 mb-3 block">
            {t("PingPong.player1Color")}
          </label>
          <div className="flex gap-3 flex-wrap">
            {COLOR_SWATCHES.map((color) => (
              <button
                key={`p1-${color.hex}`}
                aria-label={color.name}
                onClick={() => setColors((prev) => ({ ...prev, left: color.hex }))}
                className={`w-12 h-12 rounded-lg cursor-pointer transition-all ${colors.left === color.hex
                  ? 'ring-4 ring-offset-2 ring-offset-zinc-900 ring-white'
                  : 'ring-4 ring-transparent hover:ring-zinc-600'
                  }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-lg font-semibold text-slate-300 mb-3 block">
            {t("PingPong.player2Color")}
          </label>
          <div className="flex gap-3 flex-wrap">
            {COLOR_SWATCHES.map((color) => (
              <button
                key={`p2-${color.hex}`}
                aria-label={color.name}
                onClick={() => setColors((prev) => ({ ...prev, right: color.hex }))}
                className={`w-12 h-12 rounded-lg cursor-pointer transition-all ${colors.right === color.hex
                  ? 'ring-4 ring-offset-2 ring-offset-zinc-900 ring-white'
                  : 'ring-4 ring-transparent hover:ring-zinc-600'
                  }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={onBack}
            className="w-full p-3 bg-emerald-600 rounded-md text-black font-bold hover:bg-emerald-700 transition cursor-pointer"
          >
            {t("PingPong.backToMaps")}
          </button>
          <button
            onClick={handleStart}
            className="w-full flex items-center justify-center p-3 bg-emerald-600 rounded-md text-black font-bold hover:bg-emerald-700 transition cursor-pointer"
          >
            <Play className="h-5 w-5 mr-2 fill-black" />
            {t("PingPong.startGame")} 
          </button>
        </div>
      </div>
    </div>
  );
}
