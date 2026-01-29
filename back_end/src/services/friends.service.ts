
import { connectDB } from "../db";

export async function sendRequest(senderID: number, receiverID: number) {
  if (senderID === receiverID)
    throw new Error("Cannot add yourself");
  const db = await connectDB();


  const existRequest = await db.get(
    `SELECT * FROM friends 
        WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`,
    [senderID, receiverID, receiverID, senderID]
  );

  if (existRequest) {
    if (existRequest.status === 'PENDING') {
      throw new Error("Friend request already sent");
    } else if (existRequest.status === 'ACCEPTED') {
      throw new Error("You are already friends");
    }
  }

  await db.run(
    `INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'PENDING')`,
    [senderID, receiverID]
  );
}


export async function acceptRequest(senderID: number, receiverID: number) {
  const db = await connectDB();

  const update =
    await db.run(
      `UPDATE friends SET status = 'ACCEPTED' 
     WHERE user_id = ? AND friend_id = ? AND status = 'PENDING'`,
      [senderID, receiverID]
    );
  if (update.changes === 0) {
    throw new Error("No pending friend request");
  }
}


export async function getFriendsList(userID: number) {
  const db = await connectDB();
  const friends = await db.all(
    `SELECT 
         CASE 
           WHEN user_id = ? THEN friend_id 
           ELSE user_id 
         END AS friendID 
       FROM friends 
       WHERE (user_id = ? OR friend_id = ?) AND status = 'ACCEPTED'`,
    [userID, userID, userID]
  );
  return friends;
}



export async function friendStatus(userID: number, profileID: Number) {
  if (userID === profileID)
    return { ownProfile: true, isFriend: false, status: null };

  const db = await connectDB();
  const result = await db.get(`SELECT * FROM friends 
     WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`, [userID, profileID, profileID, userID]);

  if (!result) {
    return { ownProfile: false, isFriend: false, status: null };
  }
  return {
    ownProfile: false,
    isFriend: result.status === 'ACCEPTED',
    status: result.status
  };
}


export async function removeFriend(userID: number, friendID: number) {
  const db = await connectDB();
  const del = await db.run(
    `DELETE FROM friends 
     WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) 
       AND status = 'ACCEPTED'`,
    [userID, friendID, friendID, userID]
  );
  if (del.changes === 0) {
    throw new Error("No such friend to remove");
  }
}

export async function getPendingRequests(userID: number) {
  const db = await connectDB();

  const incoming = await db.all(
    `SELECT f.id_friendship, f.user_id as senderID, f.friend_id as receiverID, f.status,
              u.username, u.avatar, u.status as userStatus
       FROM friends f
       JOIN users u ON u.id_user = f.user_id
       WHERE f.friend_id = ? AND f.status = 'PENDING'`,
    [userID]
  );

  const outgoing = await db.all(
    `SELECT f.id_friendship, f.user_id as senderID, f.friend_id as receiverID, f.status,
              u.username, u.avatar, u.status as userStatus
       FROM friends f
       JOIN users u ON u.id_user = f.friend_id
       WHERE f.user_id = ? AND f.status = 'PENDING'`,
    [userID]
  );

  return { incoming, outgoing };
}

export async function rejectRequest(userID: number, otherUserID: number) {
  const db = await connectDB();

  const del = await db.run(
    `DELETE FROM friends 
       WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
         AND status = 'PENDING'`,
    [userID, otherUserID, otherUserID, userID]
  );

  if (del.changes === 0) {
    throw new Error("No pending request found");
  }
}
