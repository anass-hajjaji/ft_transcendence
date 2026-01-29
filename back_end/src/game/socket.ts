
import { Server, Socket, Namespace } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { GameSession } from './types';
import { authenticateSocket } from './middleware';
import { createGameHandlers } from './handlers';

const games: Record<string, GameSession> = {};
const socketRooms: Record<string, string> = {};
const socketRoles: Record<string, 'p1' | 'p2'> = {};
const socketToUserId: Record<string, number> = {};
const waitingPlayerRef = { current: null as { socketId: string; mapType: string } | null };

export function setupPongNamespace(namespace: Namespace) {
  namespace.use(authenticateSocket as any);

  namespace.on('connection', (socket: Socket) => {
    console.log('Pong player connected:', socket.id, 'User ID:', (socket as any).userId);
    
    socketToUserId[socket.id] = (socket as any).userId;

    const handlers = createGameHandlers(games, socketRooms, socketRoles, socketToUserId, waitingPlayerRef);

    socket.on('join_queue', handlers.handleJoinQueue(socket, namespace));
    socket.on('join_private_game', handlers.handleJoinPrivateGame(socket, namespace));
    socket.on('leave_queue', handlers.handleLeaveQueue(socket, waitingPlayerRef));
    socket.on('input', handlers.handleInput(socket));
    socket.on('disconnect', handlers.handleDisconnect(socket, namespace, waitingPlayerRef));
    socket.on('disconnecting', (reason) => {
      console.log('⚠️ Pong player disconnecting:', socket.id, 'Reason:', reason);
    });
  });
}

export function setupSocket(fastify: FastifyInstance) {
  const allowedOrigin = process.env.FRONTEND_URL!;
  const io = new Server(fastify.server, {
    cors: { 
      origin: allowedOrigin,
      credentials: true
    },
    path: "/socket.io",
    pingTimeout: 10000,
    pingInterval: 5000,
    connectTimeout: 45000,
    transports: ['websocket', 'polling'],
    allowUpgrades: true,
  });

  setupPongNamespace(io.of('/'));
  return io;
}
