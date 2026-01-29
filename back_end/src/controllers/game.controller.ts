import { FastifyRequest, FastifyReply } from 'fastify';
import * as gameService from '../services/game.service';

export const getGamesByTournamentHandler = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const id = Number(request.params.id);
    const games = await gameService.getGamesByTournamentId(id);
    reply.code(200).send(games);
  } catch (error) {
    reply.code(500).send({ message: 'Internal Server Error' });
  }
};


export const getAllGamesHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const games = await gameService.getAllGames();
    reply.code(200).send(games);
  } catch (error) {
    reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const getPlayersHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const players = await gameService.getAllPlayers();
    reply.code(200).send(players);
  } catch (error) {
    reply.code(500).send({ message: 'Internal Server Error' });
  }
}

export const getGamesByUserHandler = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const id = Number(request.params.id);
    const games = await gameService.getGamesByUserId(id);
    reply.code(200).send(games);
  } catch (error) {
    reply.code(500).send({ message: 'Internal Server Error' });
  }
};