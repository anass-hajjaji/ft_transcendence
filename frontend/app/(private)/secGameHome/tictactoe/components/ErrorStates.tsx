import { WifiOff, AlertCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import Link from "next/link";

export function AuthErrorScreen({ error }: { error: string }) {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center gap-6 p-6">
      <WifiOff className="w-20 h-20 text-red-500" />
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t("TicTacToe.authenticationError")}</h2>
        <p className="text-slate-400 text-lg">{error}</p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium transition-colors cursor-pointer"
      >
        {t("TicTacToe.retry")}
      </button>
    </main>
  );
}

export function ConnectionErrorScreen({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center gap-6 p-6">
      <WifiOff className="w-20 h-20 text-red-500" />
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t("TicTacToe.connectionError")}</h2>
        <p className="text-slate-400 text-lg">{error}</p>
      </div>
      <div className="flex gap-4">
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium transition-colors cursor-pointer"
        >
          {t("TicTacToe.retryConnection")}
        </button>
        <Link
          href="/secGameHome"
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
        >
          {t("TicTacToe.backToDashboard")}
        </Link>
      </div>
    </main>
  );
}

export function QueueErrorScreen({ error }: { error: string }) {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center gap-6 p-6">
      <AlertCircle className="w-20 h-20 text-yellow-500" />
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-2">{t("TicTacToe.queueError")}</h2>
        <p className="text-slate-400 text-lg">{error}</p>
        <p className="text-slate-500 text-sm mt-3">
          {t("TicTacToe.closeOtherTabs")}
        </p>
      </div>
      <Link
        href="/secGameHome"
        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
      >
        {t("TicTacToe.backToDashboard")}
      </Link>
    </main>
  );
}
