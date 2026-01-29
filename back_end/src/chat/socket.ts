import { Server, Socket, Namespace } from "socket.io";
import { ChatService } from "./chatService";
import {
  JoinPrivateChatSchema,
  SendMessageSchema,
  BlockUserSchema,
  TypingEventSchema,
  safeParse,
  SendGameEnvite,
  AcceptGameInvite,
  RejectGameInvite,
  CancelGameInvite,
  ExpireGameInvite,
  GetUnreadCountsSchema,
  GetLastMessageTimesSchema,
} from "./schemas";
import { authenticateSocket } from "../game/middleware";

type GameInviteData = {
  to: string;
  roomId: string;
  mapType: string;
  timestamp: number;
};

const pendingOfflineTimeouts = new Map<string, NodeJS.Timeout>();

export const setupChatNamespace = (namespace: Namespace) => {
  // Add authentication middleware (same as pong socket)
  namespace.use(authenticateSocket as any);
  namespace.on("connection", async (socket: Socket) => {
    console.log(`New Connection: ${socket.id}, User ID: ${(socket as any).userId}`);

    const username = socket.handshake.query.username as string;
    // listen for join private chat event
    socket.on("join_private_chat", async (data: unknown) => {
      const parsed = safeParse(JoinPrivateChatSchema, data, "join_private_chat");
      if (!parsed) {
        socket.emit("error", { message: "Invalid join private chat data" });
        return;
      }
      const { me: user1, other: user2 } = parsed;
      const user1Exists = await ChatService.userExists(user1);
      const user2Exists = await ChatService.userExists(user2);
      
      if (!user1Exists || !user2Exists) {
        socket.emit("error", { message: "User not found" });
        return;
      }
      const roomId = [user1, user2].sort().join("-");
      await ChatService.markMessagesAsRead(user1, user2);
      socket.join(roomId);
      console.log(`User ${user1} joined socket-room: ${roomId}`);

      const history = await ChatService.getHistory(user1, user2);
      const relationship = await ChatService.getRelationship(user1, user2);
      const partnerStatus = await ChatService.getUserStatus(user2);

      socket.emit("room_data", {
        history: history,
        iBlockedThem: relationship.iBlockedThem, 
        theyBlockedMe: relationship.theyBlockedMe, 
        partnerStatus: partnerStatus, 
      });
    });

    // listen for block user event
    socket.on("block_user", async (data: unknown) => {
      const parsed = safeParse(BlockUserSchema, data, "block_user");
      if (!parsed) {
        socket.emit("error", { message: "Invalid block user data" });
        return;
      }

      const { me, target } = parsed;

      try {
        await ChatService.blockUser(me, target);
        console.log(`${me} blocked ${target}`);
        // Let the frontend know it succeeded
        socket.emit("block_success", { target: target });
        const roomId = [me, target].sort().join("-");
        socket.to(roomId).emit("blocked_by_other");
      } catch (err) {
        console.error("Block failed", err);
      }
    });

    // listen for send message event
    socket.on("send_message", async (data: unknown) => {
      const parsed = safeParse(SendMessageSchema, data, "send_message");
      if (!parsed) {
        socket.emit("error", { message: "Invalid send message data" });
        return;
      }
      const { sender, target, text, type } = parsed;
      const roomId = [sender, target].sort().join("-");

      const theyBlockedMe = await ChatService.isUserBlocked(sender, target);
      const iBlockedThem = await ChatService.isUserBlocked(target, sender);

      if (theyBlockedMe || iBlockedThem) {
        console.log("Communication not allowed.");
        return;
      }
      try {
        await ChatService.saveMessage(sender, target, text, type);

        console.log(`Msg (${type}): ${sender} -> ${target}`);
        socket.to(roomId).emit("receive_message", {
          text: text,
          sender: sender,
          id: Date.now(),
          type: type,
        });
        const targetPersonalRoom = `user_${target}`;
        namespace.to(targetPersonalRoom).emit("new_message_notification", {
          from: sender,
          timestamp: Date.now(),
        });
        const senderPersonalRoom = `user_${sender}`;
        namespace.to(senderPersonalRoom).emit("new_message_notification", {
          from: target,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.error("Failed to save message", err);
      }
    });
    // listen for unblock user event
    socket.on("unblock_user", async (data: unknown) => {
      const parsed = safeParse(BlockUserSchema, data, "unblock_user");
      if (!parsed) {
        socket.emit("error", { message: "Invalid unblock user data" });
        return;
      }
      const { me, target } = parsed;
      try {
        await ChatService.unblockUser(me, target);

        // Notify ME (Show Input Box)
        socket.emit("unblock_success");

        //Notify THEM (Show Input Box)
        const roomId = [me, target].sort().join("-");
        socket.to(roomId).emit("unblocked_by_other");
      } catch (err) {
        console.error("Unblock failed", err);
      }
    });
    // listen for typing start event
    socket.on("typing_start", (data: unknown) => {
      const parsed = safeParse(TypingEventSchema, data, "typing_start");
      if (!parsed) return;

      const { from, to } = parsed;
      const roomId = [from, to].sort().join("-");
      socket.to(roomId).emit("partner_typing", { isTyping: true });
    });
    // listen for typing stop event
    socket.on("typing_stop", (data: unknown) => {
      const parsed = safeParse(TypingEventSchema, data, "typing_stop");
      if (!parsed) return;
      const { from, to } = parsed;
      const roomId = [from, to].sort().join("-");
      socket.to(roomId).emit("partner_typing", { isTyping: false });
    });

    // listen for mark messages read event
    socket.on("mark_messages_read", async (data: unknown) => {
      const parsed = safeParse(TypingEventSchema, data, "mark_messages_read");
      if (!parsed) return;

      const { from: me, to: other } = parsed;
      try {
        await ChatService.markMessagesAsRead(me, other);
      } catch (err) {
        console.error("Failed to mark messages as read:", err);
      }
    });

    //listen for get unread counts event
    socket.on("get_unread_counts", async (data: unknown) => {
      const parsed = safeParse(GetUnreadCountsSchema, data, "get_unread_counts");
      if (!parsed) {
        socket.emit("error", { message: "Invalid get_unread_counts data" });
        return;
      }

      const { me, friends } = parsed;        
      
      try {
        const countsArray = await Promise.all(
          friends.map(async (friendUsername) => {
            const count = await ChatService.getUnreadCount(me, friendUsername);
            return { username: friendUsername, count };
          })
        );
        const counts: Record<string, number> = {};
        countsArray.forEach(({ username, count }) => {
          if (count > 0) {
            counts[username] = count;
          }
        });
        socket.emit("unread_counts", { counts });
      } catch (err) {
        console.error("Failed to fetch unread counts:", err);
        socket.emit("error", { message: "Failed to fetch unread counts" });
      }
    });

    //listen for get last message times event
    socket.on("get_last_message_times", async (data: unknown) => {
      const parsed = safeParse(GetLastMessageTimesSchema, data, "get_last_message_times");
      if (!parsed) {
        socket.emit("error", { message: "Invalid get_last_message_times data" });
        return;
      }
      const { me, friends } = parsed;
      try {
        const timesArray = await Promise.all(
          friends.map(async (friendUsername) => {
            const timestamp = await ChatService.getLastMessageTime(me, friendUsername);
            return { username: friendUsername, timestamp };
          })
        );
        const times: Record<string, number> = {};
        timesArray.forEach(({ username, timestamp }) => {
          if (timestamp > 0) {
            times[username] = timestamp;
          }
        });
        socket.emit("last_message_times", { times });
      } catch (err) {
        console.error("Failed to fetch last message times:", err);
        socket.emit("error", { message: "Failed to fetch last message times" });
      }
    });

    
    // user connected logic
    if (username) {
      const personalRoom = `user_${username}`;
      socket.join(personalRoom);
      if (pendingOfflineTimeouts.has(username)) {
        clearTimeout(pendingOfflineTimeouts.get(username)!);
        pendingOfflineTimeouts.delete(username);
        console.log(`🔄 ${username} reconnected during grace period - cancelled offline emission`);
      }

      await ChatService.setUserStatus(username, "online");
      console.log(`User connected with username: ${username}`);
      socket.broadcast.emit("user_is_online", {
        username: username,
        status: "online",
      });
      try {
        const onlineUsers = await ChatService.getonlineUsers();
        socket.emit("online_users", { users: onlineUsers });
      } catch (err) {
        console.error("Failed to fetch online users:", err);
      }
      socket.data.username = username;
    }

    socket.on('send_game_invite', async (data: unknown) => {
      const parsed = safeParse(SendGameEnvite, data, 'send_game_invite');
      if (!parsed) {
        socket.emit("error", { message: "Invalid game invite data" });
        return;
      }
      console.log(`Game invite from ${username} to ${parsed.to}`);
      const recipientRoom = `user_${parsed.to}`;
      namespace.to(recipientRoom).emit('game_invite_received', {
        from: username,
        roomId: parsed.roomId,
        mapType: parsed.mapType
      });
    });
    socket.on('accept_game_invite', async (data: unknown) => {
      const parsed = safeParse(AcceptGameInvite, data, 'accept_game_invite');
      if (!parsed) {
        socket.emit("error", { message: "Invalid accept game invite data" });
        return;
      }
      console.log(`${username} accepted game invite from ${parsed.from}`);      
      const senderRoom = `user_${parsed.from}`;
      namespace.to(senderRoom).emit('game_invite_accepted', { roomId: parsed.roomId, mapType: parsed.mapType });
      socket.emit('game_invite_accepted', { roomId: parsed.roomId, mapType: parsed.mapType });
    });
    socket.on('reject_game_invite', async (data: unknown) => {
      const parsed = safeParse(RejectGameInvite, data, 'reject_game_invite');
      if (!parsed) {
        socket.emit("error", { message: "Invalid reject game invite data" });
        return;
      }
      console.log(`${username} rejected game invite from ${parsed.from}`);
      const senderRoom = `user_${parsed.from}`;
      namespace.to(senderRoom).emit('game_invite_rejected', { from: username });
    });
    socket.on('cancel_game_invite', async (data: unknown) => {
      const parsed = safeParse(CancelGameInvite, data, 'cancel_game_invite');
      if (!parsed) {
        socket.emit("error", { message: "Invalid cancel game invite data" });
        return;
      }
      console.log(`${username} cancelled game invite to ${parsed.to}`);      
      // Notify recipient
      const recipientRoom = `user_${parsed.to}`;
      namespace.to(recipientRoom).emit('game_invite_cancelled', { from: username });
    });
    socket.on('expire_game_invite', async (data: unknown) => {
      const parsed = safeParse(ExpireGameInvite, data, 'expire_game_invite');
      if (!parsed) {
        socket.emit("error", { message: "Invalid expire game invite data" });
        return;
      }
      console.log(`Game invite from ${username} to ${parsed.to} expired (50s timeout)`);
      const recipientRoom = `user_${parsed.to}`;
      namespace.to(recipientRoom).emit('game_invite_expired', { from: username });
    });
    
    // user disconnected logic
    socket.on("disconnect", async () => {
      const username = socket.data.username;
      
      if (username) {
        const socketRooms = await namespace.in(`user_${username}`).fetchSockets();
        const count_of_tabs = socketRooms.length;
        if (count_of_tabs === 0) {
          const offlineTimeout = setTimeout(async () => {
            const currentSockets = await namespace.in(`user_${username}`).fetchSockets();            
            if (currentSockets.length === 0) {
              await ChatService.setUserStatus(username, "offline");
              namespace.emit("user_is_offline", {
                username: username,
                status: "offline",
              });
            }  
            pendingOfflineTimeouts.delete(username);
          }, 3000);
          pendingOfflineTimeouts.set(username, offlineTimeout);
        }
      }
    });
  });
};
