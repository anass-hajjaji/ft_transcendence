import { FastifyRequest, FastifyReply } from "fastify";
import * as playerService from "../services/player.service";

export const getPlayersHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const players = await playerService.getLeaderboard();
    reply.send(players);
  } catch (error) {
    reply.status(500).send({ message: "Internal Server Error" });
  }
};
