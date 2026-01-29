
import { dbGet, dbAll, dbRun } from '../db/db-utils';
import { getUserByAlias } from '../models/user';
import { getFriendsByUserId } from '../models/user';

export const validateEmail = (email: string): boolean => {
  const emailExpression = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailExpression.test(email);
};

export const getUserById = async (id: number) => {
  const sql = 'SELECT id_user, username, fullName, alias_name, avatar, email, status, wins, losses, date, createdAt FROM users WHERE id_user = ?';
  const user = await dbGet(sql, [id]);
  return user;
};

export const getAllUsers = async () => {
  const sql = 'SELECT id_user, username, fullName, alias_name, email, avatar, status, wins, losses FROM users';
  const users = await dbAll(sql);
  return users;
};

export const updateUser = async (id: number, data: { name: string; email: string }) => {
  if (!data.name && !data.email) {
    throw new Error('At least one field is required to update');
  }
  if (data.email && !validateEmail(data.email)) {
    throw new Error('Invalid email format');
  }

  const sql = 'UPDATE users SET username = ?, fullName = ?, email = ? WHERE id_user = ?';
  await dbRun(sql, [data.name, data.name, data.email, id]);
  return await getUserById(id);
};

export const deleteUser = async (id: number) => {
  const sql = 'DELETE FROM users WHERE id_user = ?';
  await dbRun(sql, [id]);
  return { message: 'User deleted' };
};

export const getUserFriends = async (id: number) => {
  return await getFriendsByUserId(id);
};

export const getUserByTournamentAlias = async (alias: string) => {
  return await getUserByAlias(alias);
};