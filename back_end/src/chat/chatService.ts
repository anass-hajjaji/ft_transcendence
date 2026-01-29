import { db } from "../db";

const getUserID = (username: string): Promise<number | null> => {
  return new Promise((resolve, reject) => {
    db.get("SELECT id_user FROM users WHERE username = ?", [username], (err, row: any) => {
      if (err)
        return reject(err);
      if (row)
        return resolve(row.id_user);
      return resolve(null);
    });
  });
};

// Helper: Always sort user IDs to maintain consistent chat pairs
const getSortedIds = (id1: number, id2: number) => {
  if (id1 < id2) 
    return { u1: id1, u2: id2 };
  else 
    return { u1: id2, u2: id1 };
};

// Helper: Get or Create a Conversation ID (conv_id)
const getConvID = (id1: number, id2: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const { u1, u2 } = getSortedIds(id1, id2);

    db.get(
      `SELECT conv_id FROM chat WHERE user1 = ? AND user2 = ?`,
      [u1, u2],
      (err, row: any) => {
        if (err) return reject(err);
        if (row) return resolve(row.conv_id);

        // if no chat , Create one.
        db.run(
          "INSERT INTO chat (user1, user2) VALUES (?, ?)",
          [u1, u2],
          function (err) {
            if (err) return reject(err);
            resolve(this.lastID);
          }
        );
      }
    );
  });
};


// Main Chat Service Object
export const ChatService = {
  userExists: async (username: string): Promise<boolean> => {
    const userId = await getUserID(username);
    if (userId === null) return false;
    return true;
  },
  // SAVE MESSAGE
  saveMessage: async (senderName: string, receiverName: string, text: string, type: string = 'text') => {
    try {
      const senderId = await getUserID(senderName);
      const receiverId = await getUserID(receiverName);

      if (senderId === null || receiverId === null) return { error: 'User not found' };
      const convId = await getConvID(senderId, receiverId);       // Get the Room ID
      return new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO message (conv_id, sender_id, content, type) VALUES (?, ?, ?, ?)`,
          [convId, senderId, text, type],
          function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    } catch (err) {
      console.error("Save Error:", err);
      throw err;
    }
  },

  //  LOAD HISTORY
  getHistory: async (user1: string, user2: string) => {
    try {
      const u1Id = await getUserID(user1);
      const u2Id = await getUserID(user2);

      if (u1Id === null || u2Id === null) {
        return []; // Return empty history for invalid users
      }
      const convId = await getConvID(u1Id, u2Id);
      const sql = `
        SELECT 
          m.content as text, 
          m.type,
          u.username as sender, 
          m.created_date
        FROM message m
        JOIN users u ON m.sender_id = u.id_user
        WHERE m.conv_id = ?
        ORDER BY m.created_date ASC`;
      return new Promise((resolve, reject) => {
        db.all(sql, [convId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    } catch (err) {
      console.error("History Error:", err);
      return [];
    }
  },

  // BLOCK USER
  blockUser: async (blockerName: string, blockedName: string) => {
    try {
      const blockerId = await getUserID(blockerName);
      const blockedId = await getUserID(blockedName);

      if (blockerId === null || blockedId === null) {
        return { error: 'User not found' };
      }

      return new Promise((resolve, reject) => {
        db.run(
          `INSERT OR IGNORE INTO blocked_users (blocker_id, blocked_id) VALUES (?, ?)`,
          [blockerId, blockedId],
          function (err) {
            if (err)
              reject(err);
            else
              resolve(true);
          }
        );
      });
    } catch (err) {
      console.error("Block Error:", err);
    }
  },

  // CHECK PERMISSION (The Guard Dog)
  isUserBlocked: async (senderName: string, receiverName: string) => {
    const senderId = await getUserID(senderName);
    const receiverId = await getUserID(receiverName);
    if (senderId === null || receiverId === null) {
      return false;
    }
    return new Promise<boolean>((resolve, reject) => {
      db.get(
        `SELECT block_id FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?`,
        [receiverId, senderId],
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row); // true if blocked, false otherwise
        }
      );
    });
  },
  // SET USER STATUS
  setUserStatus: async (username: string, status: string) => {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE users SET status = ? WHERE username = ?",
        [status, username],
        (err) => {
          if (err) reject(err);
          else resolve(true);
        }
      );
    });
  },
  // GET RELATIONSHIP STATUS BETWEEN TWO USERS
  getRelationship: async (me: string, other: string) => {
    const myId = await getUserID(me);
    const theirId = await getUserID(other);
    if (myId === null || theirId === null) {
      return { iBlockedThem: false, theyBlockedMe: false };
    }

    return new Promise<{ iBlockedThem: boolean, theyBlockedMe: boolean }>((resolve, reject) => {
      db.all(
        `SELECT blocker_id FROM blocked_users 
         WHERE (blocker_id = ? AND blocked_id = ?) 
            OR (blocker_id = ? AND blocked_id = ?)`,
        [myId, theirId, theirId, myId],
        (err, rows: any[]) => {
          if (err) return reject(err);

          let iBlockedThem = false;
          let theyBlockedMe = false;

          rows.forEach(row => {
            if (row.blocker_id === myId) iBlockedThem = true;    // I am the blocker
            if (row.blocker_id === theirId) theyBlockedMe = true; // They are the blocker
          });

          resolve({ iBlockedThem, theyBlockedMe });
        }
      );
    });
  },
  // UNBLOCK USER
  unblockUser: async (blockerName: string, blockedName: string) => {
    const blockerId = await getUserID(blockerName);
    const blockedId = await getUserID(blockedName);
    if (blockerId === null || blockedId === null) {
      return true;
    }
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?",
        [blockerId, blockedId], (err) => err ? reject(err) : resolve(true)
      );
    });
  },
  getUserStatus: async (username: string): Promise<"online" | "offline"> => {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT status FROM users WHERE username = ?",
        [username],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(row.status || 'offline');
          } else  resolve('offline');
        }
      );
    });
  },
// GET ONLINE USERS
  getonlineUsers: async (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT username FROM users WHERE status = 'online'",
        [],
        (err, rows: any[]) => {
          if (err) return reject(err);
          const users = (rows || []).map(r => r.username as string);
          resolve(users);
        }
      );
    });
  },
// MARK MESSAGES AS READ
  markMessagesAsRead: async (me: string, other: string) => {
    const myId = await getUserID(me);
    const otherId = await getUserID(other);
    if (!myId || !otherId) return;
    const convId = await getConvID(myId, otherId);
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE message 
       SET is_seen = 1 
       WHERE conv_id = ? 
       AND sender_id = ?  -- Only mark THEIR messages as read (not mine)
       AND is_seen = 0`,
        [convId, otherId],
        function (err) {
          if (err) reject(err);
          else resolve(true);
        }
      );
    });
  },

  getUnreadCount: async (me: string, other: string): Promise<number> => {
    const myId = await getUserID(me);
    const otherId = await getUserID(other);
    if (!myId || !otherId) return 0;
    const convId = await getConvID(myId, otherId);
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM message 
       WHERE conv_id = ? 
       AND sender_id = ? -- Count messages sent by THEM
       AND is_seen = 0`,
        [convId, otherId],
        (err, row: any) => {
          if (err) reject(err);
          else resolve(row ? row.count : 0);
        }
      );
    });
  },

 //  GET LAST MESSAGE TIME
  getLastMessageTime: async (me: string, other: string): Promise<number> => {
    const myId = await getUserID(me);
    const otherId = await getUserID(other);
    if (!myId || !otherId) return 0;
    const convId = await getConvID(myId, otherId);
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT MAX(created_date) as lastTime FROM message WHERE conv_id = ?`,
        [convId],
        (err, row: any) => {
          if (err) reject(err);
          else {
            const lastTime = row?.lastTime ? new Date(row.lastTime).getTime() : 0;
            resolve(lastTime);
          }
        }
      );
    });
  },

};
