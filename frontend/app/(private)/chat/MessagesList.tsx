"use client";

import { useChatStore } from "./chatStore";
import { useRef, useEffect } from "react";


export function MessagesList() {
  const { messages, iBlockedThem, theyBlockedMe, isPartnerTyping } =
    useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col chat-scroll min-w-0">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`max-w-[70%] p-3 rounded-xl text-sm break-word overflow-hidden whitespace-pre-wrap shrink-0 ${msg.type === "system"
            ? "bg-emerald-600/20 border border-emerald-500/30 self-center text-emerald-300 rounded-lg"
            : msg.sender === "me"
              ? "bg-blue-600 self-end text-white rounded-br-none"
              : "bg-slate-700 self-start text-slate-200 rounded-bl-none"
            } message-bubble`}
          style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
        >
          {(msg.type === "text" || msg.type === "system") && msg.text}
          {msg.type === "game_invite" && (
            <span className="italic text-yellow-300">🎮 Game Invite</span>
          )}
        </div>
      ))}
      <div>
        {!iBlockedThem && !theyBlockedMe && isPartnerTyping && (
          <div className="text-xs text-blue-400 italic animate-pulse">
            is typing...
          </div>
        )}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
}
