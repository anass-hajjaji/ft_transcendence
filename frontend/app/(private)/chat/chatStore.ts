import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import {
  ReceiveMessageSchema,
  RoomDataPayloadSchema,
  TypingEventSchema,
  UserStatusEventSchema,
  OnlineUsersEventSchema,
  OutgoingMessageSchema,
  GameInviteReceivedSchema,
  GameInviteAcceptedSchema,
  GameInviteRejectedSchema,
  GameInviteCancelledSchema,
  GameInviteExpiredSchema,
  SendGameInviteSchema,
  UnreadCountsSchema,
  LastMessageTimesSchema,
  safeParse,
  MESSAGE_MAX_LENGTH,
  type MessageType,
} from './schemas';

export { MESSAGE_MAX_LENGTH };

type ChatMessage = {
  id: number;
  text: string;
  sender: "me" | "them";
  type: MessageType;
  timestamp?: number; 
};

type ChatUser = {
  id_user: number;
  username: string;
  avatar?: string;
};

// Game invite type aymane
type GameInvite = {
  from: string;
  roomId: string;
  mapType: string;
  timestamp: number;
};

type InviteStatus = 'waiting' | 'timeout' | 'rejected'; //ayman

interface ChatState {
  socket: Socket | null;
  myUsername: string | null; 
  currentChatPartner: string | null;
  messages: ChatMessage[];
  iBlockedThem: boolean;
  theyBlockedMe: boolean;
  isPartnerTyping: boolean;
  onlineUsers: Set<string>;
  showBlockModal: boolean;
  users: ChatUser[];
  usersLoaded: boolean;
  lastMessageFrom: { username: string; timestamp: number } | null;
  unreadCounts: Map<string, number>;
  lastMessageTimes: Map<string, number>;

  // Game invites
  gameInvites: Map<string, GameInvite>;
  sentInvite: GameInvite | null;
  inviteStatus: InviteStatus | null;
  inviteTimeoutId: NodeJS.Timeout | null;

  connect: (myUsername: string) => void;
  disconnect: () => void;
  joinRoom: (myUsername: string, otherUsername: string) => void;
  sendMessage: (text: string, type: "text" | "game_invite", myUsername: string, targetUsername: string) => void;
  blockUser: (me: string, target: string) => void;
  unblockUser: (me: string, target: string) => void;
  emitTyping: (type: "start" | "stop", me: string, target: string) => void;
  isUserOnline: (username: string) => boolean;
  setShowBlockModal: (show: boolean) => void;
  setUsers: (users: ChatUser[]) => void;
  userExists: (username: string) => boolean;
  setCurrentChatPartner: (username: string | null) => void;
  getCurrentChatPartner: () => string | null;

  sendGameInvite: (to: string, mapType: string) => void;
  acceptGameInvite: (from: string) => void;
  rejectGameInvite: (from: string) => void;
  cancelGameInvite: () => void;

  getUnreadCount: (username: string) => number;
  clearUnreadCount: (username: string) => void;
  fetchUnreadCounts: () => void;
  
  fetchLastMessageTimes: () => void;
  updateLastMessageTime: (username: string) => void;
  getSortedUsers: () => ChatUser[];
}

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  myUsername: null,
  currentChatPartner: null,
  messages: [],
  iBlockedThem: false,
  theyBlockedMe: false,
  isPartnerTyping: false,
  onlineUsers: new Set<string>(),
  showBlockModal: false,
  users: [],
  usersLoaded: false,
  gameInvites: new Map(),
  sentInvite: null,
  inviteStatus: null,
  inviteTimeoutId: null,
  lastMessageFrom: null,
  unreadCounts: new Map<string, number>(),
  lastMessageTimes: new Map<string, number>(),

  connect: (myUsername) => {
    if (get().socket) return;

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="))
      ?.split("=")[1];

    if (!token) {
      console.error("Authentication required for chat");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
    const socketBaseUrl = apiUrl.replace(/\/api$/, "").replace(/\/$/, "");

    const socket = io(`${socketBaseUrl}/chat`, {
      path: "/socket.io",
      query: { username: myUsername },
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socket.on("receive_message", (data: unknown) => {
      const parsed = safeParse(ReceiveMessageSchema, data, "receive_message");
      if (!parsed) return;

      const newMsg: ChatMessage = {
        id: parsed.id ?? Date.now(),
        text: parsed.text,
        sender: parsed.sender === myUsername ? "me" : "them",
        type: parsed.type,
      };
      set((state) => ({ messages: [...state.messages, newMsg] }));
      const currentPartner = get().currentChatPartner;
      if (currentPartner && parsed.sender === currentPartner) {
        socket.emit("mark_messages_read", { from: myUsername, to: currentPartner });
      }
    });

    socket.on("new_message_notification", (data: { from: string; timestamp: number }) => {
      console.log("New message notification from:", data.from);
      set((state) => {
        const newTimes = new Map(state.lastMessageTimes);
        newTimes.set(data.from, data.timestamp || Date.now());
        const newCounts = new Map(state.unreadCounts);
        if (state.currentChatPartner !== data.from) {
          const currentCount = newCounts.get(data.from) || 0;
          newCounts.set(data.from, currentCount + 1);
        }
        return { 
          lastMessageFrom: { username: data.from, timestamp: data.timestamp },
          unreadCounts: newCounts,
          lastMessageTimes: newTimes
        };
      });
    });

    // Block Logic Listeners
    socket.on("blocked_by_other", () => set({ theyBlockedMe: true }));
    socket.on("unblocked_by_other", () => set({ theyBlockedMe: false }));
    socket.on("block_success", () => set({ iBlockedThem: true }));
    socket.on("unblock_success", () => set({ iBlockedThem: false }));

    socket.on("partner_typing", (data: unknown) => {
      const parsed = safeParse(TypingEventSchema, data, "partner_typing");
      if (!parsed) return;
      set({ isPartnerTyping: parsed.isTyping });
    });

    // online/offline Status Listeners
    socket.on("user_is_online", (data: unknown) => {
      const parsed = safeParse(UserStatusEventSchema, data, "user_is_online");
      if (!parsed) return;
      set((state) => {
        const newonlineUsers = new Set(state.onlineUsers);
        newonlineUsers.add(parsed.username);
        return { onlineUsers: newonlineUsers };
      });
    });

    socket.on("user_is_offline", (data: unknown) => {
      const parsed = safeParse(UserStatusEventSchema, data, "user_is_offline");
      if (!parsed) return;
      set((state) => {
        const newonlineUsers = new Set(state.onlineUsers);
        newonlineUsers.delete(parsed.username);
        return { onlineUsers: newonlineUsers };
      });
    });

    socket.on("online_users", (data: unknown) => {
      const parsed = safeParse(OnlineUsersEventSchema, data, "online_users");
      if (!parsed) return;
      set(() => {
        const newonlineUsers = new Set<string>(parsed.users);
        return { onlineUsers: newonlineUsers };
      });
    });

    // Listen for unread counts from server
    socket.on("unread_counts", (data: unknown) => {
      const parsed = safeParse(UnreadCountsSchema, data, "unread_counts");
      if (!parsed) return;
      
      const newCounts = new Map<string, number>();
      Object.entries(parsed.counts).forEach(([username, count]) => {
        newCounts.set(username, count);
      });
      set({ unreadCounts: newCounts });
    });

    // Listen for last message times from server (for friend list sorting)
    socket.on("last_message_times", (data: unknown) => {
      const parsed = safeParse(LastMessageTimesSchema, data, "last_message_times");
      if (!parsed) return;
      
      const newTimes = new Map<string, number>();
      Object.entries(parsed.times).forEach(([username, timestamp]) => {
        newTimes.set(username, timestamp);
      });
      set({ lastMessageTimes: newTimes });
    });

    // Game invite listeners with validation
    socket.on('game_invite_received', (data: unknown) => {
      const parsed = safeParse(GameInviteReceivedSchema, data, 'game_invite_received');
      if (!parsed) return;
      set((state) => {
        const newInvites = new Map(state.gameInvites);
        newInvites.set(parsed.from, {
          from: parsed.from,
          roomId: parsed.roomId,
          mapType: parsed.mapType,
          timestamp: parsed.timestamp || Date.now()
        });
        return { gameInvites: newInvites };
      });
    });

    socket.on('game_invite_accepted', (data: unknown) => {
      const parsed = safeParse(GameInviteAcceptedSchema, data, 'game_invite_accepted');
      if (!parsed) return;      
      const timeoutId = get().inviteTimeoutId;
      if (timeoutId) clearTimeout(timeoutId);
      set({ sentInvite: null, inviteStatus: null, inviteTimeoutId: null });      
      const mapType = parsed.mapType || 'default';
      window.location.href = `/ping-pong/online-game?roomId=${parsed.roomId}&map=${mapType}`;
    });

    socket.on('game_invite_rejected', (data: unknown) => {
      const parsed = safeParse(GameInviteRejectedSchema, data, 'game_invite_rejected');
      if (!parsed) return;
      const timeoutId = get().inviteTimeoutId;
      if (timeoutId) clearTimeout(timeoutId);

      set({ inviteStatus: 'rejected', inviteTimeoutId: null });
      setTimeout(() => {
        set({ sentInvite: null, inviteStatus: null });
      }, 3000);
    });

    socket.on('game_invite_cancelled', (data: unknown) => {
      const parsed = safeParse(GameInviteCancelledSchema, data, 'game_invite_cancelled');
      if (!parsed) return;
      set((state) => {
        const newInvites = new Map(state.gameInvites);
        newInvites.delete(parsed.from);
        return { gameInvites: newInvites };
      });
    });

    socket.on('game_invite_expired', (data: unknown) => {
      const parsed = safeParse(GameInviteExpiredSchema, data, 'game_invite_expired');
      if (!parsed) return;
      set((state) => {
        const newInvites = new Map(state.gameInvites);
        newInvites.delete(parsed.from);
        return { gameInvites: newInvites };
      });
    });

    // Tournament notification listeners (Smart Alias System)
    socket.on("tournament_invite", (data: { message: string; hostName: string; tournamentId?: number }) => {
      if (typeof window !== 'undefined') {
        import('react-toastify').then(({ toast }) => {
          toast.info(`${data.message}`, {
            position: 'top-right',
            autoClose: 8000,
          });
        });
      }
    });

    socket.on("tournament_match_ready", (data: { message: string; hostName: string }) => {
      if (typeof window !== 'undefined') {
        import('react-toastify').then(({ toast }) => {
          toast.success(`${data.message}`, {
            position: 'top-right',
            autoClose: 8000,
          });
        });
      }
    });
    set({ socket, myUsername });
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket)
      socket.disconnect();
    set({ socket: null, messages: [] });
  },

  joinRoom: (me, other) => {
    const socket = get().socket;
    if (!socket) return;

    socket.off("room_data");

    socket.emit("join_private_chat", { me, other });
    socket.on("room_data", (data: unknown) => {
      const parsed = safeParse(RoomDataPayloadSchema, data, "room_data");
      if (!parsed) return;

      const formattedHistory: ChatMessage[] = parsed.history.map((msg, index) => ({
        id: index,
        text: msg.text,
        type: msg.type || 'text',
        sender: msg.sender === me ? "me" : "them"
      }));
      set((state) => {
        const newonlineUsers = new Set(state.onlineUsers);
        if (parsed.partnerStatus === 'online') {
          newonlineUsers.add(other);
        } else {
          newonlineUsers.delete(other);
        }
        return { 
          onlineUsers: newonlineUsers,
          messages: formattedHistory,
          iBlockedThem: parsed.iBlockedThem,
          theyBlockedMe: parsed.theyBlockedMe
        };
      });
    });
  },
  sendMessage: (text, type, me, target) => {
    const socket = get().socket;

    const validation = OutgoingMessageSchema.safeParse({ text, type });
    if (!validation.success) {
      console.error("Message validation failed:", validation.error.format());
      return;
    }

    const validatedText = validation.data.text;
    const myMsg: ChatMessage = {
      id: Date.now(),
      text: validatedText,
      sender: "me",
      type: validation.data.type
    };
    set((state) => ({ 
      messages: [...state.messages, myMsg],
      lastMessageFrom: { username: target, timestamp: Date.now() }
    }));
    if (socket) {
      socket.emit("send_message", { text: validatedText, target, sender: me, type: validation.data.type });}
  },

  blockUser: (me, target) => {
    get().socket?.emit("block_user", { me, target });
  },
  unblockUser: (me, target) => {
    get().socket?.emit("unblock_user", { me, target });
  },
  emitTyping: (type, me, target) => {
    const socket = get().socket;
    if (type === "start")
      socket?.emit("typing_start", { from: me, to: target });
    else
      socket?.emit("typing_stop", { from: me, to: target });
  },

  isUserOnline: (username) => {
    return get().onlineUsers.has(username);
  },

  setShowBlockModal: (show) => set({ showBlockModal: show }),

  setCurrentChatPartner: (username) => set({ currentChatPartner: username }),

  setUsers: (users) => set({ users, usersLoaded: true }),

  userExists: (username) => {
    return get().users.some(user => user.username === username);
  },

  sendGameInvite: (to, mapType) => {
    const socket = get().socket;
    if (!socket) return;

    const validation = SendGameInviteSchema.safeParse({ to, mapType });
    if (!validation.success) {
      return;
    }

    const existingTimeout = get().inviteTimeoutId;
    if (existingTimeout) clearTimeout(existingTimeout);

    const roomId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    socket.emit('send_game_invite', {
      to: validation.data.to,
      roomId,
      mapType: validation.data.mapType
    });

    const timeoutId = setTimeout(() => {
      socket.emit('expire_game_invite', { to: validation.data.to });
      set({ inviteStatus: 'timeout', inviteTimeoutId: null });
      setTimeout(() => {
        set({ sentInvite: null, inviteStatus: null });
      }, 3000);
    }, 20000);

    set({
      sentInvite: {
        from: validation.data.to,
        roomId,
        mapType: validation.data.mapType,
        timestamp: Date.now()
      },
      inviteStatus: 'waiting',
      inviteTimeoutId: timeoutId
    });
  },

  acceptGameInvite: (from) => {
    const socket = get().socket;
    if (!socket) return;

    const invite = get().gameInvites.get(from);
    if (!invite) {
      console.error('No invite found from:', from);
      return;
    }
    socket.emit('accept_game_invite', {
      from,
      roomId: invite.roomId,
      mapType: invite.mapType
    });

    set((state) => {
      const newInvites = new Map(state.gameInvites);
      newInvites.delete(from);
      return { gameInvites: newInvites };
    });
  },

  rejectGameInvite: (from) => {
    const socket = get().socket;
    if (!socket) return;

    socket.emit('reject_game_invite', { from });

    set((state) => {
      const newInvites = new Map(state.gameInvites);
      newInvites.delete(from);
      return { gameInvites: newInvites };
    });
  },

  cancelGameInvite: () => {
    const socket = get().socket;
    const sentInvite = get().sentInvite;
    const timeoutId = get().inviteTimeoutId;

    if (!socket || !sentInvite) return;

    if (timeoutId) clearTimeout(timeoutId);
    socket.emit('cancel_game_invite', { to: sentInvite.from });
    set({ sentInvite: null, inviteStatus: null, inviteTimeoutId: null });
  },

  getUnreadCount: (username: string) => {
    return get().unreadCounts.get(username) || 0;
  },
  getCurrentChatPartner: () => {
    return get().currentChatPartner;
  },

  clearUnreadCount: (username: string) => {
    set((state) => {
      const newCounts = new Map(state.unreadCounts);
      newCounts.delete(username);
      return { unreadCounts: newCounts };
    });
  },

  fetchUnreadCounts: () => {
    const { socket, myUsername, users } = get();
    if (!socket || !myUsername || users.length === 0) return;
    
    const friends = users.map(u => u.username);
    socket.emit("get_unread_counts", { me: myUsername, friends });
  },

  fetchLastMessageTimes: () => {
    const { socket, myUsername, users } = get();
    if (!socket || !myUsername || users.length === 0) return;
    
    const friends = users.map(u => u.username);
    socket.emit("get_last_message_times", { me: myUsername, friends });
  },

  updateLastMessageTime: (username: string) => {
    set((state) => {
      const newTimes = new Map(state.lastMessageTimes);
      newTimes.set(username, Date.now());
      return { lastMessageTimes: newTimes };
    });
  },

  getSortedUsers: () => {
    const { users, lastMessageTimes } = get();
    const copy = [...users];
    copy.sort((a, b) => {
      const timeA = lastMessageTimes.get(a.username) || 0;
      const timeB = lastMessageTimes.get(b.username) || 0;
      return timeB - timeA;
    });
    return copy;
  },
}));