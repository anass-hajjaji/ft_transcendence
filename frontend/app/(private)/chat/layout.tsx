"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getUserFriends, getCurrentUser } from "../../../lib/api";
import { useChatStore } from "./chatStore";
import { useTranslation } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { UserCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export const getFullAvatarUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith('http')) return url;

    const baseUrl = API_URL.replace(/\/$/, "");
    const path = url.startsWith('/') ? url : `/${url}`;

    return `${baseUrl}${path}`;
};
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { 
    connect, 
    isUserOnline, 
    setUsers: setStoreUsers,
    unreadCounts, 
    clearUnreadCount,
    getSortedUsers,
    fetchUnreadCounts,
    fetchLastMessageTimes,
  } = useChatStore();
  const { t } = useTranslation();
  
  const users = getSortedUsers();
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          connect(currentUser.username);
          const friends = await getUserFriends(currentUser.id_user);
          setStoreUsers(friends);
        } else {
          setStoreUsers([]);
        }
      } catch (error) {
        setStoreUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [connect, setStoreUsers]);

  useEffect(() => {
    if (users.length > 0 && !loading) {
      const timer = setTimeout(() => {
        fetchUnreadCounts();
        fetchLastMessageTimes();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [users.length, loading, fetchUnreadCounts, fetchLastMessageTimes]);

  return (
    <div className="min-h-screen bg-black pt-20 px-4 pb-4 w-full ">
      <div className="max-w-7xl mx-auto h-[calc(100vh-12rem)] flex gap-4 " >
        <aside className="w-60 min-w-42 min-h-[500px] bg-slate-800 rounded-2xl border border-slate-700 flex flex-col overflow-hidden">

          <div onClick={() => router.push("/chat")}
            className="flex justify-center items-center  h-20 border-b border-gray-700 gap-4 hover:opacity-80 transition-opacity cursor-pointer">
            <Image
              src="/icons/icons8-message.svg"
              alt="Messages"
              width={24}  
              height={24}
            />
            <h1 className="text-lg font-semibold text-white">
              {t("layout.messages")}
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 chat-scroll">
            {loading ? (
              <div className="text-center text-slate-400 py-4">{t("layout.loadingUsers")}</div>
            ) : users.length === 0 ? (
              <div className="text-center text-slate-400 py-4">{t("layout.noUsersFound")}</div>
            ) : (
              users.map((user) => (
                <Link
                  key={user.id_user}
                  href={`/chat/${user.username}`} 
                  onClick={() => clearUnreadCount(user.username)}
                  className="user-list-item p-3 rounded-xl text-white bg-slate-800 hover:bg-slate-700 transition flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                    {user.avatar ? (
                      <Image
                        src={getFullAvatarUrl(user.avatar)}
                        alt={`${user.username}'s profile`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCircle className="w-full h-full text-zinc-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="username font-semibold truncate">{user.username}</span>
                      {/* Unread message badge */}
                      {(unreadCounts.get(user.username) || 0) > 0 && (
                        <span className="bg-green-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1.5 ">     
                          {(unreadCounts.get(user.username) || 0) > 99 ? '99+' : unreadCounts.get(user.username)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 capitalize">
                      {isUserOnline(user.username) ? (
                        <span className="text-green-400">● {t("layout.online")}</span>
                      ) : (
                        <span className="text-gray-400">○ {t("layout.offline")}</span>
                      )}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

        </aside>

        {/* --- RIGHT CONTENT (Where the chat goes) --- */}
        <main className="flex-1  bg-slate-800  rounded-2xl border border-slate-700 relative">
          {children}
        </main>
      </div>
    </div>
  );
}