import { FastifyInstance } from 'fastify';
import {
  getGamesByTournamentHandler,
  getAllGamesHandler,
  getGamesByUserHandler
} from '../controllers/game.controller';

async function gameRoutes(fastify: FastifyInstance) {
  fastify.get('/by-tournament/:id', getGamesByTournamentHandler);
  fastify.get('/user/:id', getGamesByUserHandler);
  fastify.get('/games', getAllGamesHandler);
  fastify.get('/all', getAllGamesHandler);
  fastify.get('/users', getAllGamesHandler);
  fastify.get('/', getAllGamesHandler);

}


export default gameRoutes;