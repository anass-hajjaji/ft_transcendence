"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import { useChatStore } from "../chatStore";
import { getCurrentUser } from "../../../../lib/api";
import { ChatHeader } from "../header";
import { TheFooter } from "../theFooter";
import { MessagesList } from "../MessagesList";
import { InviteBanner } from "../inviteBanner";
import { useTranslation} from "@/lib/i18n";
import { WaitingInviteModal } from "../WaitingInviteModal"
import {RejectedInvite, TimeoutInvite} from "../RejecteTimeoutModal"

export default function ChatConversation() {
  const params = useParams();
  const router = useRouter();
  const chatPartnerName = typeof params.id === 'string' ? params.id : '';
  
  const [myUsername, setMyUsername] = useState<string>('');
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const { t } = useTranslation();
  const {
    connect, joinRoom,
    blockUser, setShowBlockModal,
    userExists, usersLoaded, clearUnreadCount,
    setCurrentChatPartner
  } = useChatStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setMyUsername(user?.username || 'guest');
      } catch (error) {
        setMyUsername('guest');
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (usersLoaded && (!userExists(chatPartnerName) )) {
      router.replace('/chat');
    }
  }, [usersLoaded, chatPartnerName, userExists, router]);

  useEffect(() => {
    if (!myUsername || isLoadingUser ) return;
    if (usersLoaded && (!userExists(chatPartnerName))) return;
    
    connect(myUsername); 
    joinRoom(myUsername, chatPartnerName); 
    clearUnreadCount(chatPartnerName); 
    setCurrentChatPartner(chatPartnerName);
    
    return () => {
      setCurrentChatPartner(null);
    };
  }, [myUsername, chatPartnerName, isLoadingUser, 
    usersLoaded, userExists, connect, joinRoom, clearUnreadCount, setCurrentChatPartner]);

  const confirmBlock = () => {
    blockUser(myUsername, chatPartnerName);
    setShowBlockModal(false);
  };
  if (isLoadingUser || !usersLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">{t("ChatConversation.loadingChat")}</div>
      </div>
    );
  }

  if (!userExists(chatPartnerName)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">{t("ChatConversation.loadingChat")}</div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto min-w-[400px]  min-h-[500px] h-[calc(100vh-12rem)]">
      <div className="flex flex-col h-full justify-between">
        <header className="border-b border-slate-700">
          <div className="h-20">
            <ChatHeader chatPartnerName={chatPartnerName} />
          </div>
          <InviteBanner chatPartnerName={chatPartnerName} />
        </header>
        <MessagesList />
        <TheFooter myUsername={myUsername} chatPartnerName={chatPartnerName} />
      </div>
      <ConfirmationModal
        message={t("ChatConversation.blockMessage")}
        onConfirm={confirmBlock}
      />
      <WaitingInviteModal />
      <TimeoutInvite  />
      <RejectedInvite />
    </div>
  );
}