import { FastifyInstance } from 'fastify';
import avatarController from '../controllers/avatar.controller';
import { validate, SetAvatarSchema, DeleteAvatarSchema } from '../validation';


const avatarRoutes = async (app: FastifyInstance) => {
  app.post('/upload',  avatarController.uploadAvatar );

  app.post('/set', { preHandler: validate(SetAvatarSchema) }, avatarController.setAvatar as { (request: unknown, reply: unknown) } );

  app.delete('/', { preHandler: validate(DeleteAvatarSchema) }, avatarController.deleteAvatar  as { (request: unknown, reply: unknown) } );

  app.get('/list', avatarController.getAvatars );

  app.get('/defaults', avatarController.getDefaultAvatars );

  app.get('/current', avatarController.getCurrentAvatar );
};

export default avatarRoutes;