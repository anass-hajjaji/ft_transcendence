import { dbGet, dbAll, dbRun } from '../db/db-utils';
import { connectDB } from '../db';

const SAFE_UPDATE_FIELDS = ['username', 'fullName', 'email', 'alias_name', 'avatar', 'status', 'password', '2FA'];

export async function createUserModel(data: Record<string, unknown>) {
  const db = await connectDB();
  const fields = Object.keys(data).join(", ");
  const placeholders = Object.keys(data).map(() => "?").join(", ");
  const values = Object.values(data);
  const result = await db.run(
    `INSERT INTO users (${fields}) VALUES (${placeholders})`,
    values
  );
  return { id_user: result.lastID, ...data };
}


export async function getAllUsersModel() {
  const users = await dbAll("SELECT * FROM users");
  return users;
}

export async function updateUserModel(id: number, data: Record<string, unknown>) {

  console.log("Updating user ID:", id, "with data:", data);
  try {
    const safeData: Record<string, unknown> = {};
    for (const field of SAFE_UPDATE_FIELDS) {
      if (data[field] !== undefined) {
        safeData[field] = data[field];
      }
    }
    console.log("Safe data for update:", safeData);
    if (Object.keys(safeData).length === 0) {

      return;
    }

    const fields = Object.keys(safeData).map((key) => `${key} = ?`).join(", ");
    const values = Object.values(safeData);
    values.push(id);
    console.log("Final update query values:", values);

    const result = await dbRun(
      `UPDATE users SET ${fields} WHERE id_user = ?`,
      values
    );
    console
    return result;
  } catch (error) {
    throw error;
  }
}


export async function deleteUserModel(id: number) {
  await dbRun("DELETE FROM users WHERE id_user = ?", [id]);
}

export async function getUserByemail(email: string) {
  const user = await dbGet("SELECT * FROM users WHERE email = ?", [email]);
  return user;
}

export async function updatePasswordEmail(email: string, password: string) {
  const result = await dbRun("UPDATE users SET password = ? WHERE email = ?", [password, email]);
  return result;
}

export async function getUserById(id: number) {
  const user = await dbGet("SELECT * FROM users WHERE id_user = ?", [id]);
  return user;
}

export async function getFriendsByUserId(id: number) {

  const query = `
    SELECT u.* 
    FROM users u
    JOIN friends f ON (u.id_user = f.friend_id OR u.id_user = f.user_id)
    WHERE (f.user_id = ? OR f.friend_id = ?)
      AND f.status = 'ACCEPTED'
      AND u.id_user != ?
  `;

  const friends = await dbAll(query, [id, id, id]);
  return friends;
}

export async function getUserByAlias(alias: string) {
  const user = await dbGet(
    "SELECT id_user, username, alias_name FROM users WHERE LOWER(alias_name) = LOWER(?)",
    [alias]
  );
  return user;
}

export async function getTournamentAlias(userId: number) {
  const user = await dbGet(
    "SELECT alias_name FROM users WHERE id_user = ?",
    [userId]
  );
  return user?.alias_name || null;
}

export async function setTournamentAlias(userId: number, alias: string) {

  const existing = await dbGet(
    "SELECT id_user FROM users WHERE LOWER(alias_name) = LOWER(?) AND id_user != ?",
    [alias, userId]
  );
  if (existing) {
    return { success: false, error: 'alias_taken' };
  }

  await dbRun("UPDATE users SET alias_name = ? WHERE id_user = ?", [alias, userId]);
  return { success: true };
}

