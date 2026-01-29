"use client";

import { useChatStore } from "./chatStore";
import { useState , useRef} from "react";
import { useTranslation } from "@/lib/i18n";
import { SendHorizontal } from "lucide-react";

interface TheFooterProps 
{
  myUsername: string;
  chatPartnerName: string;
}

export function TheFooter({ myUsername, chatPartnerName }: TheFooterProps) {

  const { iBlockedThem, theyBlockedMe,
    unblockUser, sendMessage, emitTyping } = useChatStore();
  const [inputText, setInputText] = useState("");
  const { t } = useTranslation();

  const handleSend = (text = inputText, type: "text" | "game_invite" = "text") => 
  {
    if (!text.trim()) return;
    sendMessage(text, type, myUsername, chatPartnerName);
    if (type === 'text') setInputText("");
  };
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
    const handleTyping = () => {
      emitTyping("start", myUsername, chatPartnerName);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emitTyping("stop", myUsername, chatPartnerName);
      }, 500);
    };

  return (
    <div className="p-4 bg-[#1e293b] border-t border-slate-700 rounded-2xl">
      {iBlockedThem ? (
        // Red Banner
        <div className="flex flex-col items-center justify-center py-3 gap-2 bg-red-500/10 border border-red-500/20 rounded-xl">
          <span className="text-red-400 font-medium flex items-center gap-2">🚫 {t("TheFooter.youBlockedThisUser")}</span>
          <button
            onClick={() => unblockUser(myUsername, chatPartnerName)}
            className="text-xs text-slate-400 underline hover:text-white transition"
          >
            {t("TheFooter.unblockToChat")}
          </button>
        </div>
      ) : theyBlockedMe ? (
        // Gray Banner
        <div className="flex flex-col items-center justify-center py-4 bg-gray-800/50 border border-gray-700 rounded-xl">
          <span className="text-gray-400 font-medium flex items-center gap-2">🔒 {t("TheFooter.messagingDisabled")}</span>
          <span className="text-xs text-gray-500">{t("TheFooter.cannotSendMessages")}</span>
        </div>
      ) : (
        // Input Box
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={t("TheFooter.typing")}
            maxLength={500}
            className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
          />
          <span className="absolute right-29 bottom-4 text-xs text-slate-500">
            {inputText.length}/500
          </span>
          <button
            onClick={() => handleSend()}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 rounded-lg font-bold">
            <SendHorizontal size={20} />
          </button>
        </div>
      )}
    </div>
  );
}