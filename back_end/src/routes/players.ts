import { FastifyInstance } from "fastify";
import { getPlayersHandler } from "../controllers/player.controller";

async function playerRoutes(fastify: FastifyInstance) {
  fastify.get("/", getPlayersHandler);
}

export default playerRoutes;
