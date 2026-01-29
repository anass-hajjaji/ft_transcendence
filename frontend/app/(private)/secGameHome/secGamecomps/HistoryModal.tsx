import { Clock, X } from "lucide-react";
import { MatchHistory } from "../types";
import { MatchRow } from "./MatchRow";
import { useTranslation } from "@/lib/i18n";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  fullHistory: MatchHistory[];
  loadingAll: boolean;
  currentUser: string;
}

export function HistoryModal({
  isOpen,
  onClose,
  fullHistory,
  loadingAll,
  currentUser,
}: HistoryModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#181d2f] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-[#181d2f] rounded-t-2xl">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="text-emerald-500" /> {t("SecGameHome.matchHistory")}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {loadingAll ? (
            <div className="flex justify-center py-10">
              <Clock className="animate-spin w-8 h-8 text-emerald-500" />
            </div>
          ) : fullHistory.length === 0 ? (
            <p className="text-center text-slate-500">{t("SecGameHome.noMatchesFound")}</p>
          ) : (
            <div className="space-y-3">
              {fullHistory.map((match) => (
                <MatchRow
                  key={match.game_id}
                  match={match}
                  currentUser={currentUser}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-700 bg-[#151a29] rounded-b-2xl text-center">
          <button
            onClick={onClose}
            className="text-sm text-slate-400 hover:text-white"
          >
            {t("SecGameHome.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
