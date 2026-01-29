import { Trophy } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

interface GameFooterProps {
  onFinish: () => void;
}

export function GameFooter({ onFinish }: GameFooterProps) {
  const { t } = useTranslation();
  return (
    <Link
      href="/secGameHome"
      className="bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
    >
      <Trophy size={18} />
      {t("TicTacToe.finish")}
    </Link>
  );
}
