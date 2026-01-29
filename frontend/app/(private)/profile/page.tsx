"use client";

import React, { useState } from "react";
import { useGlobalContext, User } from "@/app/_hooks/global-store";
import useSWR from "swr";
import api, { getUserFriends, getUserGames } from "@/lib/api";
import StatsCard from "../_components/dashboard/statcard";
import RecentGamesList from "../_components/dashboard/RecentGamesList";
import { Game } from "../home/types";
import { Trophy, Users, Gamepad2, Skull, Calendar, UserCircle } from "lucide-react";
import MatchDetailsPopup from "../_components/dashboard/MatchDetails";


const API_URL = process.env.NEXT_PUBLIC_API_URL!;

import { useTranslation } from "@/lib/i18n";

export const getFullAvatarUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith('http')) return url;

    const baseUrl = API_URL.replace(/\/$/, "");
    const path = url.startsWith('/') ? url : `/${url}`;

    return `${baseUrl}${path}`;
};

export default function ProfilePage() {
    const { t } = useTranslation();
    const { user: contextUser } = useGlobalContext();
    const { data: userData } = useSWR(
        contextUser?.id_user ? `/users/${contextUser.id_user}` : null,
        async () => {
            const res = await api.get('/auth/me');
            return res.data.user || res.data;
        },
        { refreshInterval: 5000 }
    );


    const user = userData || contextUser;

    const { data: friends = [], isLoading: loadingFriends } = useSWR(
        user?.id_user ? `/friends/${user.id_user}` : null,
        () => getUserFriends(user.id_user),
        { refreshInterval: 5000 }
    );

    const { data: games = [], isLoading: loadingGames } = useSWR(
        user?.id_user ? `/games/${user.id_user}` : null,
        async () => {
            const data = await getUserGames(user.id_user);
            return data.map((g: any) => {
                const isWinner = g.winner_name === user.username;
                const opponentName = isWinner ? g.loser_name : g.winner_name;
                const myScore = isWinner ? g.win_score : g.lose_score;
                const opponentScore = isWinner ? g.lose_score : g.win_score;

                const isDraw = g.win_score === 0 && g.lose_score === 0;
                
                const gameType = g.game_type?.toLowerCase();
                const isPingPong = gameType === 'ping-pong' || gameType === 'pong';

                return {
                    id: g.game_id,
                    game: isPingPong ? 'ping-pong' : 'tic-tac-toe',
                    time: new Date(g.create_date + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    score: `${myScore} - ${opponentScore}`,
                    opponent: opponentName || "Unknown",
                    duration: "10m",
                    win: isWinner,
                    result: isDraw ? 'draw' : (isWinner ? 'win' : 'loss')
                };
            });
        },
        { refreshInterval: 5000 }
    );

    const [showPopup, setShowPopup] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Game | null>(null);

    const handleMatchClick = (match: Game) => {
        setSelectedMatch(match);
        setShowPopup(true);
    };

    if (!user) {
        return <div className="text-white p-6">{t("SecGameHome.loading")}</div>;
    }

    const totalGames = (user.wins || 0) + (user.losses || 0);

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-black text-white p-8 pt-16">
            <div className="max-w-6xl mx-auto space-y-8">

                <div className="flex flex-col md:flex-row items-center gap-8 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800">
                    <div className="relative">
                        {user.avatar ? (
                            <img
                                src={getFullAvatarUrl(user.avatar)}
                                alt="Profile"
                                className="w-32 h-32 rounded-full border-4 border-emerald-500 shadow-lg object-cover"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full border-4 border-emerald-500 shadow-lg bg-zinc-800 flex items-center justify-center">
                                <UserCircle className="w-full h-full text-zinc-400" />
                            </div>
                        )}
                        <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-black ${user.status === 'online' ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
                    </div>

                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-4xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            {user.username}
                        </h1>
                        <p className="text-gray-400 flex items-center justify-center md:justify-start gap-2">
                            <span className="text-emerald-500">{t("ProfilePage.player")}</span> • {user.email || 'No email'}
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                                <Calendar size={14} /> {t("ProfilePage.joined")} {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title={t("Dashboard.Wins")}
                        value={user.wins || 0}
                        icon={Trophy}
                    />
                    <StatsCard
                        title={t("Dashboard.Losses")}
                        value={user.losses || 0}
                        icon={Skull}
                    />
                    <StatsCard
                        title={t("ProfilePage.totalMatches")}
                        value={totalGames}
                        icon={Gamepad2}
                    />
                    <StatsCard
                        title={t("ProfilePage.friends")}
                        value={friends.length}
                        icon={Users}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-1 bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6 h-fit">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-emerald-400">
                            <Users size={20} />
                            {t("ProfilePage.friendsList")}
                        </h3>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {loadingFriends ? (
                                <div className="text-gray-500 text-center py-4">{t("ProfilePage.loadingFriends")}</div>
                            ) : friends.length > 0 ? (
                                friends.map((friend) => (
                                    <div key={friend.id_user} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800/50 hover:border-emerald-500/30">
                                        {friend.avatar ? (
                                            <img
                                                src={getFullAvatarUrl(friend.avatar)}
                                                alt={friend.username}
                                                className="w-10 h-10 rounded-full bg-zinc-800 object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                                <UserCircle className="w-8 h-8 text-zinc-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white truncate">{friend.username}</p>
                                            <p className="text-xs text-emerald-500">{friend.status || t("ProfilePage.offline")}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500 text-center py-8 bg-zinc-900/50 rounded-xl border border-dashed border-zinc-800">
                                    <p>{t("ProfilePage.noFriends")}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        {loadingGames ? (
                            <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-10 text-center text-gray-400">{t("ProfilePage.matchesLoading")}</div>
                        ) : (
                            <RecentGamesList games={games} onMatchClick={handleMatchClick} />
                        )}
                    </div>

                </div>

                <MatchDetailsPopup
                    showPopup={showPopup}
                    setShowPopup={setShowPopup}
                    matchData={selectedMatch}
                />

            </div>
        </div>
    );
}