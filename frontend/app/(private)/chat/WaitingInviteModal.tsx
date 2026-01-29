import { useChatStore } from "./chatStore";
import { useTranslation } from "@/lib/i18n";
export  function WaitingInviteModal() {
  const { inviteStatus, sentInvite , cancelGameInvite, getCurrentChatPartner } = useChatStore();
  const { t } = useTranslation();
  return (
    <>
    { sentInvite && sentInvite.from === getCurrentChatPartner()  && inviteStatus === 'waiting' && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <div className="bg-gray-900 p-10 rounded-3xl border-2 border-emerald-500/30 max-w-md w-full text-center shadow-2xl">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
              <div className="relative w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-4xl">
                ⏳
              </div>
            </div>
          </div>

          <h3 className="text-3xl font-bold text-white mb-4">{t("ChatConversation.WaitingForResponse")}</h3>
          <p className="text-gray-300 text-lg mb-2">
            {t("ChatConversation.InviteSentTo")} <span className="text-emerald-400 font-semibold">{getCurrentChatPartner()}</span>
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Map: <span className="text-emerald-400 capitalize font-medium">{sentInvite.mapType}</span>
          </p>

          <div className="mb-6">
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-emerald-500 animate-pulse"></div>
            </div>
            <p className="text-gray-500 text-xs mt-2">{t("ChatConversation.Waiting(20sec)")}</p>
          </div>

          <button
            onClick={cancelGameInvite}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all"
          >
            {t("ChatConversation.CancelInvite")}
          </button>
        </div>
      </div>
    )}
    </>
  );
}