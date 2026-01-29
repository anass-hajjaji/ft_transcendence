import { FastifyInstance } from "fastify";
import userRoutes from "./user";
import gameRoutes from './game';
import tournamentRoutes from './tournament';
import playerRoutes from "./players";
import statsRoutes from './stats';
import { twoFARoutes } from "./2fa";
import friendRoute from "./friends";
import authRoute from "./auth";
import avatarRoutes from "./avatar";

async function apiRoutes(fastify: FastifyInstance) {
  fastify.register(userRoutes, { prefix: '/users' });

  
  fastify.register(gameRoutes, { prefix: '/games' });
  fastify.register(tournamentRoutes, { prefix: '/tournaments' });
  fastify.register(playerRoutes, { prefix: "/players" });
  fastify.register(statsRoutes, { prefix: '/stats' });
  fastify.register(authRoute, { prefix: '/auth' });
  fastify.register(twoFARoutes);
  fastify.register(avatarRoutes, { prefix: '/avatar' });
  fastify.register(friendRoute, { prefix: '/friends' });
}

export default apiRoutes;
