"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserGames, getUserByUsername } from "@/lib/api";
import StatsCard from "../../../_components/dashboard/statcard";
import RecentGamesList from "../../../_components/dashboard/RecentGamesList";
import { Game } from "../../../home/types";
import { Trophy, Gamepad2, Skull, Calendar, ArrowLeft, MessageCircle, UserCircle } from "lucide-react";
import MatchDetailsPopup from "../../../_components/dashboard/MatchDetails";
import { useTranslation } from "@/lib/i18n";


interface User {
    id_user: number;
    username: string;
    email?: string;
    avatar?: string;
    status?: string;
    wins?: number;
    losses?: number;
    createdAt?: string;
}

interface GameData {
    game_id: number;
    winner_name: string;
    loser_name: string;
    win_score: number;
    lose_score: number;
    game_type: string;
    create_date: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export const getFullAvatarUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith('http')) return url;

    const baseUrl = API_URL.replace(/\/$/, "");
    const path = url.startsWith('/') ? url : `/${url}`;

    return `${baseUrl}${path}`;
};


export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const username = typeof params.username === 'string' ? params.username : '';
    const { t } = useTranslation();
    const [user, setUser] = useState<User | null>(null);
    const [games, setGames] = useState<Game[]>([]);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingGames, setLoadingGames] = useState(true);

    // Popup state
    const [showPopup, setShowPopup] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Game | null>(null);

    const handleMatchClick = (match: Game) => {
        setSelectedMatch(match);
        setShowPopup(true);
    };

    const handleBackToChat = () => {
        router.push(`/chat/${username}`);
    };

    useEffect(() => {
        if (username) {
            // Fetch user by username
            getUserByUsername(username)
                .then((data: User | null) => {
                    console.log("User data received:", data);
                    setUser(data);

                    if (data?.id_user) {
                        getUserGames(data.id_user)
                            .then((gamesData: GameData[]) => {
                                const mappedGames: Game[] = gamesData.map((g: GameData) => {
                                    const isWinner = g.winner_name === data.username;
                                    const opponentName = isWinner ? g.loser_name : g.winner_name;
                                    const myScore = isWinner ? g.win_score : g.lose_score;
                                    const opponentScore = isWinner ? g.lose_score : g.win_score;
                                    const gameType = g.game_type?.toLowerCase();
                                    const isPingPong = gameType === 'ping-pong' || gameType === 'pong';
                                    const gameDisplay = isPingPong ? 'Ping Pong' : 'Tic Tac Toe';

                                    return {
                                        id: g.game_id,
                                        game: gameDisplay,
                                        time: new Date(g.create_date + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                        score: `${myScore} - ${opponentScore}`,
                                        opponent: opponentName || "Unknown",
                                        duration: "10m",
                                        win: isWinner
                                    };
                                });
                                setGames(mappedGames);
                            })
                            .catch((err: unknown) => console.error("Failed to fetch games", err))
                            .finally(() => setLoadingGames(false));
                    }
                })
                .catch((err: unknown) => {
                    console.error("Failed to fetch user", err);
                    setLoadingUser(false);
                    setLoadingGames(false);
                })
                .finally(() => setLoadingUser(false));
        }
        console.log("Fetching profile for username:", username);
    }, [username]);

    if (loadingUser) {
        return (
            <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
                <div className="text-gray-400">{t("ChatConversation.LoadingProfile")}</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center gap-4">
                <div className="text-gray-400">{t("ChatConversation.UserNotFound")}</div>
                <button
                    onClick={() => router.push('/chat')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white transition"
                >
                    {t("ChatConversation.BackToChat")}
                </button>
            </div>
        );
    }

    const totalGames = (user.wins || 0) + (user.losses || 0);

    return (
        <div className="text-white p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-12rem)] chat-scroll">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Back Button & Actions */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={handleBackToChat}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition"
                    >
                        <ArrowLeft size={20} />
                        <span>{t("ChatConversation.BackToChat")}</span>
                    </button>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-6 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                    <div className="relative">
                        {user.avatar ? (
                            <img
                                src={getFullAvatarUrl(user.avatar)}
                                alt="Profile"
                                className="w-24 h-24 rounded-full border-4 border-emerald-500 shadow-lg object-cover"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full border-4 border-emerald-500 shadow-lg bg-zinc-800 flex items-center justify-center">
                                <UserCircle className="w-full h-full text-zinc-400" />
                            </div>
                        )}
                        <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-black ${user.status === 'online' ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
                    </div>

                    <div className="text-center md:text-left space-y-1">
                        <h1 className="text-3xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            {user.username}
                        </h1>
                        <p className="text-gray-400 flex items-center justify-center md:justify-start gap-2">
                            <span className="text-emerald-500">{t("Leaderboard.player")}</span> • {user.email || 'No email'}
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                                <Calendar size={14} /> {t("UserModalProfile.Joined")} {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <StatsCard
                        title={t("Leaderboard.wins")}
                        value={user.wins || 0}
                        icon={Trophy}
                    />
                    <StatsCard
                        title={t("Leaderboard.losses")}
                        value={user.losses || 0}
                        icon={Skull}
                    />
                    <StatsCard
                        title="Total"
                        value={totalGames}
                        icon={Gamepad2}
                    />
                </div>
                <div>
                    {loadingGames ? (
                        <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-10 text-center text-gray-400">Loading matches...</div>
                    ) : (
                        <RecentGamesList games={games} onMatchClick={handleMatchClick} />
                    )}
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