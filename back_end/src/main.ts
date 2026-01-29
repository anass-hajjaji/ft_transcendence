
import Fastify, { FastifyReply,  FastifyRequest } from 'fastify';
import cors from '@fastify/cors';

import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import apiRoutes from './routes';
import { initDb } from './db';
import { setupUnifiedSocket } from './socket';

import dotenv from 'dotenv';
import jsonwebtoken from 'jsonwebtoken';
import * as fs from 'fs';


dotenv.config();

const server = Fastify({
  logger: true,
});


server.register(jwt, {
  secret: process.env.JWT_SECRET || "secret",
  sign: { expiresIn: process.env.JWT_EXPIRES || "1h" },
});

server.register(jwt, {
  namespace: "refresh",
  secret: process.env.JWT_REFRESH_SECRET || "refresh_secret",
  sign: { expiresIn: process.env.JWT_REFRESH || "7d" },
});

server.register(cookie, {
  secret: process.env.COOKIE_SECRET || "cookie",
});

const allowedOrigin = process.env.FRONTEND_URL!;

server.register(cors, {
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

server.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory at: ${uploadsDir}`);
}

server.register(fastifyStatic, {
  root: uploadsDir,
  prefix: '/uploads/',
  decorateReply: false,
});

server.register(helmet, {
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

server.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

const excludePaths = [
  '/auth/signin',
  '/auth/signup',
  '/auth/forgotpassword',
  '/auth/declareforgotpassword',
  '/auth/refresh',
  '/auth/sign2fa',
  '/avatar/defaults',
  '/auth/google-signin',
  '/auth/intra-signin',
];

const excludePathPrefixes = [
  '/uploads/'
];

const authenticate = async (request: FastifyRequest , reply: FastifyReply) => {
  try {
    if (excludePaths.includes(request.url)) {
      return;
    }
    for (const prefix of excludePathPrefixes) {
      if (request.url.startsWith(prefix)) {
        return;
      }
    }
    const token = request.cookies.access_token;
    if (!token) {
      return reply.code(401).send({ error: "Missing token" });
    }
    const decoded = jsonwebtoken.verify(
      token,
      process.env.JWT_SECRET || "secret"
    ) as { id: number };
    if (!decoded) {
      return reply.code(401).send({ error: "Invalid token" });
    }
    request.user = { id: decoded.id };
  } catch  {
    reply.code(401).send({ error: "Invalid or missing token" });
  }
};

server.addHook("preHandler", authenticate);

server.register(apiRoutes);


process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const start = async () => {
  try {
    console.log("DEBUG: Starting initDb...");
    await initDb();
    console.log("DEBUG: initDb complete. Starting server listen...");

    await server.listen({ port: 4000, host: '0.0.0.0' });
    console.log("DEBUG: Server listen complete. Setting up socket...");

    setupUnifiedSocket(server);
    console.log("DEBUG: Socket setup complete. Server running.");

  } catch (err: any) {
    console.error("Fatal Error in Start:", err);
    process.exit(1);
  }
};

start();
