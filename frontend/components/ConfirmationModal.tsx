import React from "react";
import { useChatStore } from "../app/(private)/chat/chatStore";
import { useTranslation } from "@/lib/i18n";



type ModalProps = {
  message: string;
  onConfirm: () => void; 
};

export default function ConfirmationModal({
   message, onConfirm
}: ModalProps) {

  const { showBlockModal, setShowBlockModal, getCurrentChatPartner } = useChatStore();
  const { t } = useTranslation();
  if (!showBlockModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

      <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-96 shadow-2xl">

        <h3 className="text-xl font-bold text-white mb-2">{"block " + getCurrentChatPartner() + "?"}</h3>
        <p className="text-slate-300 text-sm mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowBlockModal(false)}
            className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
          >
            {t("ConfirmationModal.cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-white font-bold bg-red-600 hover:bg-red-700"
          >
            {t("ConfirmationModal.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}