"use client";

import { useChatStore } from "./chatStore";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserByUsername } from "@/lib/api";
import { UserCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;


export const getFullAvatarUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith('http')) return url;

  const baseUrl = API_URL.replace(/\/$/, "");
  const path = url.startsWith('/') ? url : `/${url}`;

  return `${baseUrl}${path}`;
};

export function ChatHeader({ chatPartnerName }: { chatPartnerName: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [partnerAvatar, setPartnerAvatar] = useState<string | null>(null);

  const {
    iBlockedThem,
    theyBlockedMe,
    isUserOnline,
    setShowBlockModal,
    sendGameInvite,
    gameInvites,
    sentInvite,
  } = useChatStore();

  const receivedInvite = gameInvites.get(chatPartnerName);

  useEffect(() => {
    if (chatPartnerName) {
      getUserByUsername(chatPartnerName)
        .then((user) => {
          if (user?.avatar) {
            setPartnerAvatar(user.avatar);
          }
        })
        .catch((err) => {});
    }
  }, [chatPartnerName]);

  const handleSendInvite = () => {
    sendGameInvite(chatPartnerName, 'default');
  };

  const handleViewProfile = () => {
    router.push(`/chat/profile/${chatPartnerName}`);
  };

  return (
    <>
      <div className="flex justify-between items-center h-full px-6">
        {/* Left - Clickable Avatar and Name */}
        <button
          onClick={handleViewProfile}
          className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer"
          title={`View ${chatPartnerName}'s profile`}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-bold uppercase shrink-0 bg-zinc-100">
            {partnerAvatar ? (
              <Image
                src={getFullAvatarUrl(partnerAvatar)}
                alt="Profile"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCircle className="w-full h-full text-zinc-400" />
            )}
          </div>

          <div className="text-left">
            <h2 className="text-lg font-bold capitalize text-white">
              {chatPartnerName}
            </h2>

            {isUserOnline(chatPartnerName) ? (
              <span className="text-xs text-green-400 flex items-center gap-1">
                ● {t("layout.online")}
              </span>
            ) : (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                ○ {t("layout.offline")}
              </span>
            )}
          </div>
        </button>

        {/* Right */}
        <div className="flex items-center gap-4">
          {!iBlockedThem && !theyBlockedMe && !sentInvite && !receivedInvite && (
            <button
              onClick={handleSendInvite}
              disabled={!isUserOnline(chatPartnerName)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition ${isUserOnline(chatPartnerName)
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-500 text-gray-300 cursor-not-allowed opacity-50"
                }`}
              title={
                isUserOnline(chatPartnerName)
                  ? `Invite ${chatPartnerName} to play Pong`
                  : `${chatPartnerName} is offline`
              }
            >
              🎮 {t("layout.inviteToGame")}
            </button>
          )}

          {!iBlockedThem && (
            <button
              onClick={() => setShowBlockModal(true)}
              className="bg-gray-800 rounded-2xl p-1 hover:shadow-md transition"
            >
              <Image
                src="/icons/icons8-block-user-96.png"
                alt="Block user"
                width={32}
                height={32}
              />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
