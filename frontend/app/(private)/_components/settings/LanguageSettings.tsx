"use client";

import React from "react";
import { Globe, Check } from "lucide-react";
import { useTranslation, locales, Locale } from "@/lib/i18n";

export default function LanguageSettings() {
  const { locale, setLocale, t } = useTranslation();

  const handleLanguageChange = (code: Locale) => {
    setLocale(code);
  };

  return (
    <section className="p-8 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-white/5 shadow-xl">

      <div className="flex items-center gap-4 mb-6 border-b border-zinc-800 pb-6">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
          <Globe size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{t("Settings.language.title")}</h2>
          <p className="text-slate-400 text-sm">{t("Settings.language.description")}</p>
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
        {locales.map((loc) => (
          <button
            key={loc.code}
            onClick={() => handleLanguageChange(loc.code)}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
              loc.code === locale
                ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                : "bg-black/40 border-zinc-700 text-white hover:border-zinc-500 hover:bg-zinc-800/50"
            }`}
          >
            <span className="text-2xl">{loc.flag}</span>
            <div className="flex-1 text-left">
              <span className="font-medium">{loc.label}</span>
            </div>
            {loc.code === locale && (
              <Check size={20} className="text-emerald-500" />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
