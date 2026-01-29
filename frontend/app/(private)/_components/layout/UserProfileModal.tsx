import React, { useContext, useState, useEffect } from "react";
import { UserProfile } from "./types";
import { useTranslation } from "@/lib/i18n";
import Image from "next/image";
import { getFullAvatarUrl } from "../settings/ProfileAvatar";
import { useRouter } from "next/navigation";
import { GlobalContext } from "@/app/_hooks/global-store";
import useSWR, { mutate } from "swr";
import api from "@/lib/api";
import { Clock, UserPlus, UserMinus, Check, X } from "lucide-react";
import { isAxiosError } from "axios";

interface Props {
  user: UserProfile;
  onClose: () => void;
}

type FriendshipState = "none" | "pending_sent" | "pending_received" | "friends";

interface PendingRequest {
  senderID: number;
  receiverID: number;
}

interface PendingRequestsResponse {
  outgoing?: PendingRequest[];
  incoming?: PendingRequest[];
}

export default function UserProfileModal({ user, onClose }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { user: currentUser } = useContext(GlobalContext)!;

  const [friendshipState, setFriendshipState] = useState<FriendshipState>("none");
  const [loading, setLoading] = useState(false);

  const { data: statusData, isLoading: statusLoading } = useSWR(
    currentUser && user.id_user !== currentUser.id_user
      ? `/friends/status?profileID=${user.id_user}`
      : null,
    async () => {
      const response = await api.get(`/friends/status?profileID=${user.id_user}`);
      return response.data;
    }
  );

  useEffect(() => {
    if (statusData) {
      if (statusData.isFriend) {
        setFriendshipState("friends");
      } else if (statusData.status === "PENDING") {
        api.get<PendingRequestsResponse>("/friends/pending").then((res) => {
          const pending = res.data;
          const isSent = pending.outgoing?.some((r: PendingRequest) => r.receiverID === user.id_user);
          const isReceived = pending.incoming?.some((r: PendingRequest) => r.senderID === user.id_user);
          if (isSent) setFriendshipState("pending_sent");
          else if (isReceived) setFriendshipState("pending_received");
          else setFriendshipState("none");
        }).catch(() => setFriendshipState("none"));
      } else {
        setFriendshipState("none");
      }
    }
  }, [statusData, user.id_user]);

  const winRate =
    user.wins + user.losses > 0
      ? Math.round((user.wins / (user.wins + user.losses)) * 100)
      : 0;
  const handleSendRequest = async () => {
    setLoading(true);
    try {
      await api.post("/friends/request", { receiverID: user.id_user });
      setFriendshipState("pending_sent");
      mutate("/friends/pending");
    } catch (error: unknown) {
      const message = isAxiosError(error) ? error.response?.data?.error : "Failed to send request";
      alert(message || "Failed to send request");
    }
    setLoading(false);
  };

  const handleCancelRequest = async () => {
    setLoading(true);
    try {
      await api.post("/friends/reject", { otherUserID: user.id_user });
      setFriendshipState("none");
      mutate("/friends/pending");
    } catch (error: unknown) {
      const message = isAxiosError(error) ? error.response?.data?.error : "Failed to cancel request";
      alert(message || "Failed to cancel request");
    }
    setLoading(false);
  };

  const handleAcceptRequest = async () => {
    setLoading(true);
    try {
      await api.post("/friends/accept", { senderID: user.id_user });
      setFriendshipState("friends");
      mutate("/friends/pending");
    } catch (error: unknown) {
      const message = isAxiosError(error) ? error.response?.data?.error : "Failed to accept request";
      alert(message || "Failed to accept request");
    }
    setLoading(false);
  };

  const handleRejectRequest = async () => {
    setLoading(true);
    try {
      await api.post("/friends/reject", { otherUserID: user.id_user });
      setFriendshipState("none");
      mutate("/friends/pending");
    } catch (error: unknown) {
      const message = isAxiosError(error) ? error.response?.data?.error : "Failed to reject request";
      alert(message || "Failed to reject request");
    }
    setLoading(false);
  };

  const handleRemoveFriend = async () => {
    setLoading(true);
    try {
      await api.post("/friends/remove", { friendID: user.id_user });
      setFriendshipState("none");
    } catch (error: unknown) {
      const message = isAxiosError(error) ? error.response?.data?.error : "Failed to remove friend";
      alert(message || "Failed to remove friend");
    }
    setLoading(false);
  };

  const renderFriendButton = () => {
    if (statusLoading) {
      return <div className="w-full bg-slate-700 rounded-lg py-2 text-center text-sm">Loading...</div>;
    }

    switch (friendshipState) {
      case "pending_sent":
        return (
          <button
            onClick={handleCancelRequest}
            disabled={loading}
            className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            Cancel Request
          </button>
        );

      case "pending_received":
        return (
          <div className="flex gap-2">
            <button
              onClick={handleAcceptRequest}
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Accept
            </button>
            <button
              onClick={handleRejectRequest}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reject
            </button>
          </div>
        );

      case "friends":
        return (
          <button
            onClick={handleRemoveFriend}
            disabled={loading}
            className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            <UserMinus className="w-3.5 h-3.5" />
            Remove Friend
          </button>
        );

      default:
        return (
          <button
            onClick={handleSendRequest}
            disabled={loading}
            className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Friend
          </button>
        );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-9999 bg-black/70">
      <div className="bg-slate-800 rounded-2xl shadow-xl p-6 w-[420px] max-w-[95vw] text-white relative border border-slate-700">
        <button
          onClick={onClose}
          className="absolute top-7 right-6 text-slate-400 hover:bg-slate-700"
          aria-label="Close"
        >
          <i className="fas fa-times"></i>
        </button>

        {currentUser && currentUser.id_user === user.id_user && (
          <button
            onClick={() => {
              router.push("/settings");
              onClose();
            }}
            className="absolute top-7 right-15 text-slate-400 hover:bg-slate-700"
          >
            <i className="fas fa-cog text-slate-400 hover:text-white cursor-pointer"></i>
          </button>
        )}

        <h1 className="text-xl font-semibold mb-5">
          {t("UserModalProfile.PlayerProfile")}
        </h1>

        <div className="flex justify-center mb-5">
          <div className="relative">
            {user.avatar ? (
              <Image
                src={getFullAvatarUrl(user.avatar)}
                width={80}
                height={80}
                alt={user.username}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-3xl font-bold text-gray-300">
                <i className="fas fa-user"></i>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-center text-xl font-semibold mb-2">
          {user.username}
        </h3>
        <p className="text-center text-sm text-gray-400 mb-2">
          <span className={user.status === "online" ? "text-emerald-600" : "text-slate-400"}>
            {user.status || "offline"}
          </span>
        </p>

        {friendshipState === "friends" && (
          <div className="flex justify-center my-3">
            <div className="border-t border-b rounded-2xl border border-emerald-600/30 bg-emerald-600/20 w-20 h-6 flex justify-center">
              <p className="text-center text-sm text-emerald-400">
                {t("UserProfileModal.Friend")}
              </p>
            </div>
          </div>
        )}

        {friendshipState === "pending_sent" && (
          <div className="flex justify-center my-3">
            <div className="rounded-full border border-yellow-500/30 bg-yellow-500/20 px-3 py-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-yellow-400" />
              <p className="text-sm text-yellow-400">Pending</p>
            </div>
          </div>
        )}

        <div className="bg-slate-900/50 rounded-lg p-4 mb-6 shadow-lg">
          <div className="text-slate-400 flex items-center space-x-1 opacity-40">
            <i className="fas fa-chart-line text-xl"></i>
            <h4 className="text-l font-semibold">{t("UserModalProfile.Statistics")}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl">
              <p className="text-slate-500 text-sm">{t("UserModalProfile.Wins")}</p>
              <p className="text-xl font-bold text-emerald-600">{user.wins ?? 0}</p>
            </div>
            <div className="p-3 rounded-xl">
              <p className="text-slate-500 text-sm">{t("UserModalProfile.Losses")}</p>
              <p className="text-xl font-bold text-red-500">{user.losses ?? 0}</p>
            </div>
          </div>
          <div className="flex justify-between border-t border-slate-700"></div>
          <div className="p-3 rounded-xl flex items-center">
            <div className="flex flex-col">
              <p className="text-slate-500 text-sm">{t("UserModalProfile.WinRate")}</p>
              <p className="text-xl font-bold text-gray-100">{winRate}%</p>
            </div>
            <p className="text-sm text-gray-400 mt-5">
              ({user.wins ?? 0}W / {user.losses ?? 0}L)
            </p>
          </div>
        </div>

        {currentUser && currentUser.id_user !== user.id_user && (
          <div>
            {renderFriendButton()}
          </div>
        )}
      </div>
    </div>
  );
}