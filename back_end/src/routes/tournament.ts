import { FastifyInstance } from 'fastify';
import {
  createTournamentHandler,
  updateTournamentHandler,
  getTournamentHandler,
} from '../controllers/tournament.controller';
import { validate, validateParams, CreateTournamentSchema, UpdateTournamentSchema, TournamentIdParamSchema } from '../validation';

async function tournamentRoutes(fastify: FastifyInstance) {
  fastify.post('/', { preHandler: validate(CreateTournamentSchema) }, createTournamentHandler);
  fastify.put('/:id', { preHandler: validateParams(TournamentIdParamSchema) }, updateTournamentHandler);
  fastify.get('/:id', { preHandler: validateParams(TournamentIdParamSchema) }, getTournamentHandler);
}

export default tournamentRoutes;