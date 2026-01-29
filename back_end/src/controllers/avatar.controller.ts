import { FastifyRequest, FastifyReply } from 'fastify';
import avatarService, { DEFAULT_AVATARS } from '../services/avatar.service';
import { MultipartFile } from '@fastify/multipart';

interface AuthenticatedRequest extends FastifyRequest {
  user: { id: number };
  file(): Promise<  MultipartFile | undefined>;
}

interface SetAvatarBody {
  avatarUrl: string;
}

interface DeleteAvatarBody {
  avatarUrl: string;
}

export const avatarController = {

  uploadAvatar: async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const data = await request.file();
      if (!data) {
        return reply.code(400).send({ error: 'No file uploaded' });
      }

      const result = await avatarService.uploadAvatar(userId, data);
      return reply.code(200).send(result);
    } catch (error) {
      return reply.code(400).send({ error: (error as Error)?.message || 'Failed to upload avatar' });
    }
  },

  setAvatar: async (
    request: AuthenticatedRequest & { Body: SetAvatarBody },
    reply: FastifyReply
  ) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { avatarUrl } = request.body as SetAvatarBody;
      if (!avatarUrl) {
        return reply.code(400).send({ error: 'Avatar URL is required' });
      }

      const result = await avatarService.setAvatar(userId, avatarUrl);
      return reply.code(200).send(result);
    } catch (error) {
      return reply.code(400).send({ error: (error as Error).message || 'Failed to set avatar' });
    }
  },


  deleteAvatar: async (
    request: AuthenticatedRequest & { Body: DeleteAvatarBody },
    reply: FastifyReply
  ) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { avatarUrl } = request.body as DeleteAvatarBody;
      if (!avatarUrl) {
        return reply.code(400).send({ error: 'Avatar URL is required' });
      }

      const result = await avatarService.deleteAvatar(userId, avatarUrl);
      return reply.code(200).send(result);
    } catch (error) {
      return reply.code(400).send({ error: (error as Error).message || 'Failed to delete avatar' });
    }
  },


  getAvatars: async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const avatars = await avatarService.getUserAvatars(userId);
      return reply.code(200).send(avatars);
    } catch (error) {
      return reply.code(500).send({ error: (error as Error).message || 'Failed to get avatars' });
    }
  },


  getDefaultAvatars: async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.code(200).send({ defaults: DEFAULT_AVATARS });
  },


  getCurrentAvatar: async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const avatar = await avatarService.getCurrentAvatar(userId);
      return reply.code(200).send({ avatar });
    } catch (error) {
      return reply.code(500).send({ error: (error as Error).message || 'Failed to get current avatar' });
    }
  },
};

export default avatarController;