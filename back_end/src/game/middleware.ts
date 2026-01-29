
import { Socket } from 'socket.io';

import jsonwebtoken from 'jsonwebtoken'; 

export const authenticateSocket = async (socket: Socket, next: (err?: Error) => void) => {
  try {

    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      console.error("Pong Auth: No token provided");
      return next(new Error('Authentication required. Please login first.'));
    }

    const secret = process.env.JWT_SECRET || 'my_secret_key';


    const decoded = jsonwebtoken.verify(token, secret) as { id: number };


    (socket as any).userId = decoded.id;
    console.log(`Pong Socket authenticated for User ID: ${decoded.id}`);

    next();
  } catch (error: unknown) {

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Pong JWT Verification Failed:", errorMessage);
    next(new Error('Invalid token. Please login again.'));
  }
};