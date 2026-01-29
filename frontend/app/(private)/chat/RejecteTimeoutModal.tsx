import { useChatStore } from "./chatStore";
import { useTranslation } from "@/lib/i18n";

export function RejectedInvite() {
  const { inviteStatus, getCurrentChatPartner } = useChatStore();
  const { t } = useTranslation();
  return (
    <>
      {inviteStatus === 'rejected' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="bg-gray-900 p-10 rounded-3xl border-2 border-red-500/30 max-w-md w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-3xl font-bold text-white mb-4">{t("ChatConversation.InviteDeclined")}</h3>
            <p className="text-gray-300 text-lg mb-8">
              <span className="text-red-400 font-semibold">{getCurrentChatPartner()}</span> {t("ChatConversation.DeclinedYourGameInvite")}.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export function TimeoutInvite() {
  const { inviteStatus, cancelGameInvite, getCurrentChatPartner } = useChatStore();
  const { t } = useTranslation();
  return (
    <>
      {inviteStatus === 'timeout' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="bg-gray-900 p-10 rounded-3xl border-2 border-yellow-500/30 max-w-md w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">⏰</div>
            <h3 className="text-3xl font-bold text-white mb-4">{t("ChatConversation.NoResponse")}</h3>
            <p className="text-gray-300 text-lg mb-8">
              <span className="text-yellow-400 font-semibold">{getCurrentChatPartner()}</span> {t("ChatConversation.DidNotRespondToYourInvite")}.
            </p>
            <button
              onClick={() => cancelGameInvite()}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all"
            >
              {t("ChatConversation.Close")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}