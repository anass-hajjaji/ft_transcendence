"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { User } from "@/app/_hooks/global-store";
import { Notification, NotificationType } from "./types";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';

const NOTIFICATIONS_STORAGE_KEY = 'tournament_notifications';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: number) => void;
    markAllAsRead: () => void;
    clearNotification: (id: number) => void;
    clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
};

interface NotificationProviderProps {
    children: React.ReactNode;
    user: User | null | undefined;
}

const loadNotificationsFromStorage = (userId: number | undefined): Notification[] => {
    if (typeof window === 'undefined' || !userId) return [];
    try {
        const stored = localStorage.getItem(`${NOTIFICATIONS_STORAGE_KEY}_${userId}`);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Filter out notifications older than 24 hours
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
            return parsed.filter((n: Notification) => n.timestamp > oneDayAgo);
        }
    } catch (e) {
        console.error('Failed to load notifications from storage:', e);
    }
    return [];
};

const saveNotificationsToStorage = (userId: number | undefined, notifications: Notification[]) => {
    if (typeof window === 'undefined' || !userId) return;
    try {
        localStorage.setItem(`${NOTIFICATIONS_STORAGE_KEY}_${userId}`, JSON.stringify(notifications));
    } catch (e) {
        console.error('Failed to save notifications to storage:', e);
    }
};

export const NotificationProvider = ({ children, user }: NotificationProviderProps) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (user?.id_user) {
            const stored = loadNotificationsFromStorage(user.id_user);
            setNotifications(stored);
        }
        setIsHydrated(true);
    }, [user?.id_user]);

    useEffect(() => {
        if (isHydrated && user?.id_user) {
            saveNotificationsToStorage(user.id_user, notifications);
        }
    }, [notifications, isHydrated, user?.id_user]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = (notif: Omit<Notification, "id" | "read" | "timestamp">) => {
        const newNotif: Notification = {
            ...notif,
            id: Date.now(),
            read: false,
            timestamp: Date.now(),
        };
        setNotifications(prev => [newNotif, ...prev]);

        if (notif.type === 'game_invite') {
            toast.info(`Game invite from ${notif.sender}`);
        } else if (notif.type === 'tournament_active') {
            toast.warning(notif.message);
        }
    };

    useEffect(() => {
        if (!user?.username) return;

        if (socketRef.current?.connected) return;

        const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("access_token="))
            ?.split("=")[1];

        if (!token) {
            console.error("Authentication required for notifications");
            return;
        }

		const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
        
        const socketBaseUrl = apiUrl.replace(/\/api$/, "").replace(/\/$/, "");

        const socket = io(`${socketBaseUrl}/chat`, {
            path: "/socket.io",
            query: { username: user.username },
            auth: { token },
            transports: ["websocket", "polling"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log(" Notification socket connected");
        });

        socket.on("connect_error", (err) => {
            console.error("Notification socket error:", err.message);
        });

        socket.on("notification_message", (data: { sender: string; text: string; type: string }) => {
            if (data.type === 'game_invite') {
                addNotification({
                    type: "game_invite",
                    message: `${data.sender} invited you to a game`,
                    sender: data.sender,
                    link: `/chat/${data.sender}`,
                });
            } else {
                addNotification({
                    type: "message",
                    message: `New message from ${data.sender}`,
                    sender: data.sender,
                    link: `/chat/${data.sender}`,
                });
            }
        });

        socket.on("tournament_invite", (data: { message: string, hostName: string, tournamentId: number }) => {
            console.log("Received tournament invite:", data);
            addNotification({
                type: "tournament_active",
                message: data.message,
                sender: data.hostName,
                link: `/tournament1`,
            });
        });

        socket.on("tournament_match_ready", (data: { message: string, hostName: string }) => {
            console.log("Received tournament match ready:", data);
            addNotification({
                type: "tournament_active",
                message: data.message,
                sender: data.hostName,
                link: `/tournament1`,
            });
        });

        socket.on("navigate_to_game", (data: { roomId: string; map?: string }) => {
            console.log("Redirecting to game room:", data.roomId);
            const mapParam = data.map ? `&map=${data.map}` : '';
            router.push(`/ping-pong/online-game?room=${data.roomId}${mapParam}`);
        });

        return () => {
            if (socket.connected) {
                socket.disconnect();
            }
            socketRef.current = null;
        };
    }, [user?.username]);

    const markAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAllNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};