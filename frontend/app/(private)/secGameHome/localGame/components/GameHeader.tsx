import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export function GameHeader() {
  const { t } = useTranslation();
  return (
    <header className="p-6 flex items-center justify-between max-w-7xl mx-auto">
      <Link
        href="/secGameHome"
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        {t("LocalGame.backToMenu")}
      </Link>
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">{t("GameNames.TicTacToe")}</h1>
        <p className="text-slate-500 text-sm mt-1">classic mode • 3x3</p>
      </div>
      <div className="w-[120px]" />
    </header>
  );
}
