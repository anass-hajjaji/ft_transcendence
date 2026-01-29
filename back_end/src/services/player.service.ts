
import { dbGet, dbRun, dbAll } from '../db/db-utils';

interface Player {
  id_user: number;
  alias_name: string;
  username: string;
  wins: number;
  losses: number;
}

export const findPlayerByName = async (name: string): Promise<Player | undefined> => {
  const sql = 'SELECT * FROM users WHERE alias_name = ?';
  return await dbGet(sql, [name]);
};
export const createGuestPlayer = async (name: string): Promise<Player> => {

  const sql = 'INSERT INTO users (username, alias_name, fullName, email, wins, losses, status) VALUES (?, ?, ?, ?, 0, 0, "offline")';
  const timestamp = Date.now();
  const username = `guest_${name}_${timestamp}`;
  const email = `guest_${name}_${timestamp}@local.game`;
  const fullName = `Guest ${name}`;

  const { lastID } = await dbRun(sql, [username, name, fullName, email]);
  return { id_user: lastID, alias_name: name, username, wins: 0, losses: 0 };
};

export const getOrCreatePlayer = async (aliasName: string): Promise<Player> => {
  const existingPlayer = await findPlayerByName(aliasName);

  if (existingPlayer) {
    return existingPlayer;
  }

  const newPlayer = await createGuestPlayer(aliasName);
  return newPlayer;
};

export const getLeaderboard = async () => {
  const sql = 'SELECT id_user, username, alias_name, wins, losses FROM users ORDER BY wins DESC';
  return await dbAll(sql);
};