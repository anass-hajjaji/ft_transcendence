
import { FastifyReply, FastifyRequest } from 'fastify';
import { dbAll, dbGet, dbRun } from "../db/db-utils";
import userService from '../services/user';
import { getTournamentAlias, setTournamentAlias } from '../models/user';


interface CreateUserBody {
  name: string;
  email: string;
}
interface UpdateUserBody {
  name: string;
  email: string;
}
interface IdParam {
  id: string;
}

export const getUserHandler = async (
  request: FastifyRequest<{ Params: IdParam }>,
  reply: FastifyReply
) => {
  try {
    const id = Number(request.params.id);
    const user = await userService.getUserById(id);
    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }
    reply.code(200).send(user);
  } catch (error) {
    reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const getUserFriendsHandler = async (
  request: FastifyRequest<{ Params: IdParam }>,
  reply: FastifyReply
) => {
  try {
    const id = Number(request.params.id);
    const friends = await userService.getUserFriends(id);
    reply.code(200).send(friends);
  } catch (error) {
    reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const getAllUsersHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const users = await userService.getAllUsers();
    reply.code(200).send(users);
  } catch (error) {
    reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const searchUserByNameHandler = async (
  req: FastifyRequest<{ Querystring: { q?: string } }>,
  reply: FastifyReply
) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return reply.send([]);
  }

  const users = await dbAll(
    `
    SELECT *
    FROM users
    WHERE LOWER(username) LIKE LOWER(?)
    LIMIT 20
    `,
    [`%${q}%`]
  );

  return reply.send(users);
};
export const getUserWithFriendStatusHandler = async (
  req: FastifyRequest<{ Querystring: { username?: string } }>,
  reply: FastifyReply
) => {
  const { username } = req.query;
  const me = (req.user as any)?.id_user;

  if (!username || username.trim() === "") {
    return reply.code(400).send({ error: "Username required" });
  }

  const user = await dbGet(
    `
    SELECT
      u.id_user,
      u.username,
      u.avatar,
      u.email,
      CASE
        WHEN f.id_friendship IS NOT NULL THEN 1
        ELSE 0
      END AS is_friend,
      f.status AS friendship_status
    FROM users u
    LEFT JOIN friends f
      ON (
        (f.user_id = ? AND f.friend_id = u.id_user)
        OR
        (f.friend_id = ? AND f.user_id = u.id_user)
      )
    WHERE LOWER(u.username) = LOWER(?)
      AND u.id_user != ?
    LIMIT 1
    `,
    [
      me,
      me,
      username,
      me
    ]
  );

  if (!user) {
    return reply.code(404).send({ error: "User not found" });
  }

  return reply.send(user);
};

export const checkIsFriendHandler = async (
  req: FastifyRequest<{ Querystring: { username: string } }>,
  reply: FastifyReply
) => {
  const { username } = req.query;
  const me = (req.user as any)?.id;

  const result = await dbGet(
    `
    SELECT
      u.id_user,
      u.username,
      CASE
        WHEN f.status = 'ACCEPTED' THEN 1
        ELSE 0
      END AS is_friend
    FROM users u
    LEFT JOIN friends f
      ON (
        (f.user_id = ? AND f.friend_id = u.id_user)
        OR
        (f.friend_id = ? AND f.user_id = u.id_user)
      )
    WHERE LOWER(u.username) = LOWER(?)
      AND u.id_user != ?
    LIMIT 1
    `,
    [me, me, username, me]
  );

  if (!result) {
    return reply.code(404).send({ error: "User not found" });
  }

  return reply.send({
    username: result.username,
    is_friend: Boolean(result.is_friend)
  });
};

const userController = {
  getUsers: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const users = await userService.getAllUsers();
      reply.send(users);

    } catch (error) {
      reply.status(400).send({ error });
    }
  },
  getUserById: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: number };
      const user = await userService.getUserById(id);
      if (user) {
        reply.send(user);
      } else {
        reply.status(404).send({ message: "User not found" });
      }
    }
    catch (error) {
      reply.status(400).send({ error });
    }
  },
  updateUser: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: number };
      const body = request.body as Record<string, unknown>;
      const updatedUser = await userService.updateUser(id, body);
      reply.send(updatedUser);
    } catch (error) {
      reply.status(400).send({ error });
    }
  },
  deleteUser: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: number };
      await userService.deleteUser(id);
      reply.status(204).send();
    } catch (error) {
      reply.status(400).send({ error });
    }
  },
};

export const getTournamentAliasHandler = async (
  request: FastifyRequest<{ Params: IdParam }>,
  reply: FastifyReply
) => {
  try {
    const id = Number(request.params.id);
    const alias = await getTournamentAlias(id);
    reply.code(200).send({ alias });
  } catch (error) {
    reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const setTournamentAliasHandler = async (
  request: FastifyRequest<{ Params: IdParam; Body: { alias: string } }>,
  reply: FastifyReply
) => {
  try {
    const id = Number(request.params.id);
    const { alias } = request.body as { alias: string };

    if (!alias || alias.trim() === '') {
      return reply.code(400).send({ message: 'Alias is required' });
    }

    const result = await setTournamentAlias(id, alias.trim());

    if (!result.success) {
      if (result.error === 'alias_taken') {
        return reply.code(409).send({ message: 'This alias is already taken' });
      }
      return reply.code(400).send({ message: 'Failed to set alias' });
    }

    reply.code(200).send({ message: 'Alias updated', alias: alias.trim() });
  } catch (error) {
    reply.code(500).send({ message: 'Internal Server Error' });
  }
};

const VALID_LANGUAGES = ['en', 'fr', 'es'];

export const getLanguageHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userId = (request as any).user?.id;

    if (!userId) {
      return reply.code(401).send({ message: 'Unauthorized' });
    }

    const user = await dbGet(
      'SELECT language FROM users WHERE id_user = ?',
      [userId]
    ) as { language: string } | undefined;

    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }

    reply.code(200).send({ language: user.language || 'en' });
  } catch (error) {
    reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const setLanguageHandler = async (
  request: FastifyRequest<{ Body: { language: string } }>,
  reply: FastifyReply
) => {
  try {
    const userId = (request as any).user?.id;

    if (!userId) {
      return reply.code(401).send({ message: 'Unauthorized' });
    }

    const { language } = request.body as { language: string };
    if (!language || !VALID_LANGUAGES.includes(language)) {
      return reply.code(400).send({
        message: `Invalid language. Must be one of: ${VALID_LANGUAGES.join(', ')}`
      });
    }

    await dbRun(
      'UPDATE users SET language = ? WHERE id_user = ?',
      [language, userId]
    );

    reply.code(200).send({ success: true, language });
  } catch (error) {
    reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export default userController;