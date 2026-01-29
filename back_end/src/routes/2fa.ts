import { FastifyInstance } from "fastify";
import { TwoFAController } from "../controllers/twofa.controller";
import { validate, Setup2FASchema, Enable2FASchema, Disable2FASchema } from "../validation";

export async function twoFARoutes(fastify: FastifyInstance) {
  fastify.post("/2fa/setup", { preHandler: validate(Setup2FASchema) }, TwoFAController.set2FA);
  fastify.post("/2fa/enabled", { preHandler: validate(Enable2FASchema) }, TwoFAController.Enab2FA);
  fastify.post("/2fa/disabled", { preHandler: validate(Disable2FASchema) }, TwoFAController.desab2fa);
}
