import { RefreshCw, Trophy } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

interface GameFooterProps {
  onRematch: () => void;
}

export function GameFooter({ onRematch }: GameFooterProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={onRematch}
        className="bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
      >
        <RefreshCw size={18} />
        {t("LocalGame.rematch")}
      </button>
      <Link
        href="/secGameHome"
        className="bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
      >
        <Trophy size={18} />
        {t("LocalGame.finish")}
      </Link>
    </div>
  );
}
