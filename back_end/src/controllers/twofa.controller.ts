
import { FastifyReply, FastifyRequest } from "fastify";
import * as twoFAService from "./../services/twoFAService";


export interface UserInterface {
  id: number;
  [key: string]: unknown;
}

export const TwoFAController = {

  set2FA: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { qrcode, secret } = await twoFAService.setup2fa((request?.user as UserInterface)?.id);
      reply.status(200).send({ qrcode, secret });
    } catch (error) {
      reply.status(400).send({ success: false, message: (error as Error).message });
    }
  },

  Enab2FA: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { code } = request.body as { code: string };
      const isValid = await twoFAService.Enabled2faCode((request?.user as UserInterface)?.id, code);
      if (!isValid) {
        return reply.status(400).send({ success: false, message: "Invalid 2FA code" });
      }
      reply.status(200).send({ success: true, message: "2FA enabled successfully" });
    } catch (error) {
      reply.status(400).send({ success: false, message: (error as Error).message });
    }
  },
  

  desab2fa: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { code } = request.body as { code: string };
      const isValid = await twoFAService.desabled2fa((request?.user as UserInterface)?.id, code);
      if (!isValid) {
        return reply.status(400).send({ success: false, message: "Invalid 2FA code" });
      }
      reply.status(200).send({ success: true, message: "2FA disabled successfully" });
    } catch (error) {
      reply.status(400).send({ success: false, message: (error as Error).message });
    }
  },

};

export default TwoFAController;