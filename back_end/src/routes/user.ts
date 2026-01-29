
import { FastifyInstance } from "fastify";

import userController, {
  getAllUsersHandler,
  getUserHandler,
  getUserFriendsHandler,
  searchUserByNameHandler,
  getUserWithFriendStatusHandler,
  checkIsFriendHandler,
  getTournamentAliasHandler,
  setTournamentAliasHandler,
  getLanguageHandler,
  setLanguageHandler,
} from "../controllers/user.controller";
import { validateQuery, validateParams, SearchUserQuerySchema, UserIdParamSchema } from "../validation";

const userRoutes = async (app: FastifyInstance) => {

 app.get('/search', { preHandler: validateQuery(SearchUserQuerySchema) }, searchUserByNameHandler);

  app.get('/searchFriends', checkIsFriendHandler);
  app.get('/', getAllUsersHandler);

  app.get('/:id', { preHandler: validateParams(UserIdParamSchema) }, getUserHandler);
  app.get('/:id/friends', { preHandler: validateParams(UserIdParamSchema) }, getUserFriendsHandler);

  app.get('/:id/tournament-alias', { preHandler: validateParams(UserIdParamSchema) }, getTournamentAliasHandler);
  app.put('/:id/tournament-alias', { preHandler: validateParams(UserIdParamSchema) }, setTournamentAliasHandler);

  app.get('/language', getLanguageHandler);
  app.put('/language', setLanguageHandler);

  app.put("/:id", { preHandler: validateParams(UserIdParamSchema) }, userController.updateUser);

  app.delete("/:id", { preHandler: validateParams(UserIdParamSchema) }, userController.deleteUser);
};

export default userRoutes;