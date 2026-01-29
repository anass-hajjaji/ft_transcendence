// src/socket.ts
import { Server } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { setupPongNamespace } from './game/socket';
import { setupTicTacToeNamespace } from './tictactoe/socket';
import { setupChatNamespace } from './chat/socket';


export function setupUnifiedSocket(fastify: FastifyInstance) {
  const allowedOrigin = process.env.FRONTEND_URL!;
  const io = new Server(fastify.server, {
    cors: {
      origin: allowedOrigin,
      methods: ["GET", "POST"],
      credentials: true
    },
    path: "/socket.io",
    pingTimeout: 10000,        
    pingInterval: 5000,        
    connectTimeout: 45000,     
    transports: ['websocket', 'polling'],
    allowUpgrades: true,
  });

  console.log('Unified WebSocket server initialized');
  setIO(io);


  const pongNamespace = io.of('/pong');
  const tictactoeNamespace = io.of('/tictactoe');
  const chatNamespace = io.of('/chat');
  console.log('Setting up Pong namespace at /pong');
  setupPongNamespace(pongNamespace);

  console.log('Setting up TicTacToe namespace at /tictactoe');
  setupTicTacToeNamespace(tictactoeNamespace);

  console.log('Setting up Chat namespace at /chat');
  setupChatNamespace(chatNamespace);

  console.log('All game namespaces ready');

  return io;
}

let io: Server;

export const setIO = (server: Server) => {
  io = server;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
