"use client";

import { useChatStore } from "./chatStore";
import { useTranslation } from "@/lib/i18n";

export function InviteBanner({ chatPartnerName }: { chatPartnerName: string }) {
  const {
    gameInvites, acceptGameInvite, rejectGameInvite
  } = useChatStore();

  const receivedInvite = gameInvites.get(chatPartnerName);
  const { t } = useTranslation();
  return (
    <>
      {receivedInvite && (
        <div className="px-4 py-3 bg-emerald-900/20 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="text-emerald-400 text-sm">
            🎮 {chatPartnerName} {t("ChatConversation.InvitedYouToPlayOn")} <span className="font-bold capitalize">{receivedInvite.mapType}</span> {t("ChatConversation.Map")}!
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => acceptGameInvite(chatPartnerName)}
              className="px-4 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded font-medium transition"
            >
              {t("ChatConversation.Accept")}
            </button>
            <button
              onClick={() => rejectGameInvite(chatPartnerName)}
              className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-medium transition"
            >
              {t("ChatConversation.Reject")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}