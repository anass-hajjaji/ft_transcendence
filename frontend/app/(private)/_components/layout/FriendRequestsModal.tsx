"use client";

import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import api from "@/lib/api";
import Image from "next/image";
import { getFullAvatarUrl } from "../settings/ProfileAvatar";
import { X, Check, Clock, UserPlus, UserMinus } from "lucide-react";

interface FriendRequest {
    id_friendship: number;
    senderID: number;
    receiverID: number;
    username: string;
    avatar: string | null;
    userStatus: string;
}

interface PendingData {
    incoming: FriendRequest[];
    outgoing: FriendRequest[];
}

interface Props {
    onClose: () => void;
}

import { useTranslation } from "@/lib/i18n";

export default function FriendRequestsModal({ onClose }: Props) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");
    const [loading, setLoading] = useState<number | null>(null);

    const { data, error, isLoading } = useSWR<PendingData>(
        "/friends/pending",
        async () => {
            const response = await api.get("/friends/pending");
            return response.data;
        },
        {
            revalidateOnFocus: true,
            revalidateOnMount: true,
        }
    );

    const handleAccept = async (senderID: number) => {
        setLoading(senderID);
        try {
            await api.post("/friends/accept", { senderID });
            mutate("/friends/pending");
        } catch (error) {
        }
        setLoading(null);
    };

    const handleReject = async (otherUserID: number) => {
        setLoading(otherUserID);
        try {
            await api.post("/friends/reject", { otherUserID });
            mutate("/friends/pending");
        } catch (error) {
        }
        setLoading(null);
    };

    const incomingCount = data?.incoming?.length || 0;
    const outgoingCount = data?.outgoing?.length || 0;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-9999 bg-black/70">
            <div className="bg-slate-800 rounded-2xl shadow-xl w-96 max-w-full text-white relative border border-slate-700">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-emerald-500" />
                        {t("FriendRequests.title")}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700">
                    <button
                        onClick={() => setActiveTab("incoming")}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "incoming"
                            ? "text-emerald-400 border-b-2 border-emerald-500"
                            : "text-slate-400 hover:text-white"
                            }`}
                    >
                        {t("FriendRequests.incoming")} {incomingCount > 0 && <span className="ml-1 bg-emerald-500 text-black px-2 py-0.5 rounded-full text-xs">{incomingCount}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab("outgoing")}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "outgoing"
                            ? "text-yellow-400 border-b-2 border-yellow-500"
                            : "text-slate-400 hover:text-white"
                            }`}
                    >
                        {t("FriendRequests.outgoing")} {outgoingCount > 0 && <span className="ml-1 bg-yellow-500 text-black px-2 py-0.5 rounded-full text-xs">{outgoingCount}</span>}
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 max-h-80 overflow-y-auto">
                    {isLoading ? (
                        <div className="text-center text-slate-400 py-8">{t("FriendRequests.loading")}</div>
                    ) : error ? (
                        <div className="text-center text-slate-400 py-8">{t("FriendRequests.noRequests")}</div>
                    ) : activeTab === "incoming" ? (
                        data?.incoming && data.incoming.length > 0 ? (
                            <div className="space-y-3">
                                {data.incoming.map((req) => (
                                    <div
                                        key={req.id_friendship}
                                        className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            {req.avatar ? (
                                                <Image
                                                    src={getFullAvatarUrl(req.avatar)}
                                                    width={40}
                                                    height={40}
                                                    alt={req.username}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                                                    <i className="fas fa-user text-slate-400"></i>
                                                </div>
                                            )}
                                            <span className="font-medium">{req.username}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAccept(req.senderID)}
                                                disabled={loading === req.senderID}
                                                className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50"
                                                title={t("FriendRequests.accept")}
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleReject(req.senderID)}
                                                disabled={loading === req.senderID}
                                                className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50"
                                                title={t("FriendRequests.reject")}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-slate-400 py-8">
                                {t("FriendRequests.noIncoming")}
                            </div>
                        )
                    ) : data?.outgoing && data.outgoing.length > 0 ? (
                        <div className="space-y-3">
                            {data.outgoing.map((req) => (
                                <div
                                    key={req.id_friendship}
                                    className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        {req.avatar ? (
                                            <Image
                                                src={getFullAvatarUrl(req.avatar)}
                                                width={40}
                                                height={40}
                                                alt={req.username}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                                                <i className="fas fa-user text-slate-400"></i>
                                            </div>
                                        )}
                                        <div>
                                            <span className="font-medium">{req.username}</span>
                                            <div className="flex items-center gap-1 text-xs text-yellow-400">
                                                <Clock className="w-3 h-3" />
                                                {t("FriendRequests.pending")}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleReject(req.receiverID)}
                                        disabled={loading === req.receiverID}
                                        className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm transition-colors disabled:opacity-50"
                                    >
                                        {t("FriendRequests.cancel")}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-slate-400 py-8">
                            {t("FriendRequests.noOutgoing")}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
