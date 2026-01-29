import React, { useState } from "react";
import { UserProfile } from "./types";
import UserProfileModal from "./UserProfileModal";
import SearchUserModal from "./SearchUserModal";
import FriendRequestsModal from "./FriendRequestsModal";
import useSWR from "swr";
import api from "@/lib/api";
import { Users } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface RightSidebarProps {
  currentUserId: number;
}

export default function RightSidebar({ currentUserId }: RightSidebarProps) {
  const { t } = useTranslation();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const { data: friendsData, error: friendsError } = useSWR(`/friends/${currentUserId}`, async () => {
    try {
      const response = await api.get(`/friends/${currentUserId}`);
      return response.data;
    } catch (err) {
      return [];
    }
  }, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });

  const { data: pendingData, error: pendingError } = useSWR("/friends/pending", async () => {
    try {
      const response = await api.get("/friends/pending");
      return response.data;
    } catch (err) {
      return { incoming: [], outgoing: [] };
    }
  }, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });

  const incomingCount = pendingData?.incoming?.length || 0;
  const outgoingCount = pendingData?.outgoing?.length || 0;
  const totalCount = incomingCount + outgoingCount;

  const friends = (friendsData || []).slice(0, 10);

  return (
    <>
      <div className="fixed right-0 top-1/2 -mt-[35vh] w-20 h-[70vh] bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white shadow-xl flex flex-col items-center py-8 space-y-8 border-l border-gray-700 rounded-l-3xl z-50">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-xl font-bold shadow-md">
            <i className="fas fa-user"></i>
          </div>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-gray-700 flex items-center justify-center text-xl font-bold shadow-md">
          <button
            onClick={() => setShowSearchModal(true)}
            className="hover:text-emerald-600 transition-colors text-xl"
          >
            <i className="fas fa-search"></i>
          </button>
        </div>

        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gray-700 flex items-center justify-center text-xl font-bold shadow-md">
            <button
              onClick={() => setShowRequestsModal(true)}
              className="hover:text-emerald-500 transition-colors"
              title={t("FriendRequests.title")}
            >
              <Users className="w-5 h-5" />
            </button>
          </div>
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {totalCount > 9 ? "9+" : totalCount}
            </span>
          )}
        </div>

        {showSearchModal && (
          <SearchUserModal
            onClose={() => setShowSearchModal(false)}
            onSelectUser={(user) => {
              setSelectedUser(user);
              setShowSearchModal(false);
            }}
          />
        )}

        {showRequestsModal && (
          <FriendRequestsModal onClose={() => setShowRequestsModal(false)} />
        )}

        <div className="w-8 border-t border-amber-50"></div>

        <div className="flex flex-col items-center space-y-3 overflow-y-auto p-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-emerald-500">
          {friends.map((userProfile: UserProfile) => (
            <div
              key={userProfile.id_user}
              className="relative group cursor-pointer"
              onClick={() => setSelectedUser(userProfile)}
            >
              <div className="w-10 h-10 rounded-2xl bg-gray-700 flex items-center justify-center text-sm">
                <i className="fas fa-user"></i>
              </div>
              <span
                className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full border-2 border-gray-900 ${userProfile.status === "online"
                  ? "bg-emerald-600"
                  : "bg-gray-500"
                  }`}
              ></span>

            </div>
          ))}
        </div>
      </div>

      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  );
}

