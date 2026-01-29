
import { Socket, Namespace } from 'socket.io';
import { GameSession } from './types';
import { createInitialState, resetBall } from './gameState';
import { fetchUsername, saveGameResult } from './database';
import { dbGet } from '../db/db-utils';
import { gameLoop } from './gameLoop';
import { JoinQueueSchema, JoinPrivateGameSchema, GameInputSchema, safeParse } from './schemas';

export function createGameHandlers(
  games: Record<string, GameSession>,
  socketRooms: Record<string, string>,
  socketRoles: Record<string, 'p1' | 'p2'>,
  socketToUserId: Record<string, number>,
  waitingPlayerRef: { current: { socketId: string; mapType: string } | null }
) {
  return {
    handleJoinQueue: (socket: Socket, namespace: Namespace) => async (payload?: { mapType?: string }) => {
      const validated = safeParse(JoinQueueSchema, payload || {}, 'join_queue');
      if (!validated) {
        socket.emit('error', 'Invalid join queue data');
        return;
      }

      const currentUserId = socketToUserId[socket.id];
      const requestedMapType = validated.mapType || 'default';

      if (waitingPlayerRef.current && waitingPlayerRef.current.socketId !== socket.id) {
        const waitingUserId = socketToUserId[waitingPlayerRef.current.socketId];

        if (currentUserId && waitingUserId && currentUserId === waitingUserId) {
          socket.emit('error', 'Cannot play with yourself! Please use a different account.');
          console.log(`User ${currentUserId} tried to play with themselves`);
          return;
        }

        if (waitingPlayerRef.current.mapType !== requestedMapType) {
          console.log(`Map mismatch: waiting player wants ${waitingPlayerRef.current.mapType}, new player wants ${requestedMapType}`);
          waitingPlayerRef.current = { socketId: socket.id, mapType: requestedMapType || 'default' };
          socket.emit('waiting', 'Waiting for opponent with same map preference...');
          return;
        }

        const roomId = `pong_room_${waitingPlayerRef.current.socketId}_${socket.id}`;
        const opponentSocket = namespace.sockets.get(waitingPlayerRef.current.socketId);

        if (opponentSocket) {
          socket.join(roomId);
          opponentSocket.join(roomId);

          const p1UserId = socketToUserId[waitingPlayerRef.current.socketId];
          const p2UserId = socketToUserId[socket.id];

          let p1Name = 'Player 1';
          let p2Name = 'Player 2';

          try {
            if (p1UserId) p1Name = (await fetchUsername(p1UserId)) || 'Player 1';
            if (p2UserId) p2Name = (await fetchUsername(p2UserId)) || 'Player 2';
          } catch (error) {
          }

          const state = createInitialState();
          resetBall(state.ball, Math.random() > 0.5 ? 'left' : 'right');

          games[roomId] = {
            state,
            inputs: { p1: 'stop', p2: 'stop' },
            interval: setInterval(() => gameLoop(roomId, namespace, games[roomId], socketRooms, socketRoles, socketToUserId), 1000 / 120),
            countdown: 5,
            gameSaved: false,
            playerNames: { p1: p1Name, p2: p2Name },
            mapType: requestedMapType
          };

          socketRooms[socket.id] = roomId;
          socketRooms[opponentSocket.id] = roomId;
          socketRoles[socket.id] = 'p2';
          socketRoles[opponentSocket.id] = 'p1';

          namespace.to(roomId).emit('match_found', {
            roomId,
            playerNames: { p1: p1Name, p2: p2Name },
            mapType: requestedMapType,
            countdown: 5
          });
          socket.emit('role', 'p2');
          opponentSocket.emit('role', 'p1');

          const countdownInterval = setInterval(() => {
            const game = games[roomId];
            if (!game) {
              clearInterval(countdownInterval);
              return;
            }

            game.countdown--;

            if (game.countdown > 0) {
              namespace.to(roomId).emit('countdown', game.countdown);
            } else {
              clearInterval(countdownInterval);
              namespace.to(roomId).emit('game_start');
              console.log(`🎮 Game started in room: ${roomId}`);
            }
          }, 1000);

          waitingPlayerRef.current = null;
        } else {
          waitingPlayerRef.current = { socketId: socket.id, mapType: requestedMapType };
        }
      } else {
        waitingPlayerRef.current = { socketId: socket.id, mapType: requestedMapType || 'default' };
        socket.emit('waiting', 'Waiting for opponent...');
      }
    },

    handleJoinPrivateGame: (socket: Socket, namespace: Namespace) => async (payload: { roomId: string; mapType?: string }) => {
      const validated = safeParse(JoinPrivateGameSchema, payload, 'join_private_game');
      if (!validated) {
        socket.emit('error', 'Invalid join private game data');
        return;
      }
      const { roomId, mapType } = validated as { roomId: string; mapType?: string };
      const safeMapType = mapType || 'default';
      console.log(`Join Private Request: ${socket.id} -> ${roomId} (Map: ${safeMapType})`);
      const currentUserId = socketToUserId[socket.id];

      socket.join(roomId);
      if (games[roomId]) {
        console.log(`User ${currentUserId} reconnecting to existing game: ${roomId}`);
        const game = games[roomId];

        if (game.p1Id === currentUserId) {
          socketRoles[socket.id] = 'p1';
          socketRooms[socket.id] = roomId;
          socket.emit('role', 'p1');
        } else if (game.p2Id === currentUserId) {
          socketRoles[socket.id] = 'p2';
          socketRooms[socket.id] = roomId;
          socket.emit('role', 'p2');
        } else {
          console.log(`User ${currentUserId} is not a player in this game.`);
        }

        socket.emit('game_state', {
          ...game.state,
          playerNames: game.playerNames,
          mapType: game.mapType
        });
        return;
      }
      const roomSockets = await namespace.in(roomId).fetchSockets();

      if (roomSockets.length === 1) {
        socket.emit('waiting', 'Waiting for opponent to join private room...');
      } else if (roomSockets.length === 2) {
        const p1Socket = roomSockets[0];
        const p2Socket = roomSockets[1];

        const p1UserId = socketToUserId[p1Socket.id];
        const p2UserId = socketToUserId[p2Socket.id];

        let p1Name = 'Player 1';
        let p2Name = 'Player 2';

        try {
          if (p1UserId) {
            const res: { username: string } | undefined = await dbGet('SELECT username FROM users WHERE id_user = ?', [p1UserId]);
            if (res) p1Name = res.username || 'Player 1';
          }
          if (p2UserId) {
            const res: { username: string } | undefined = await dbGet('SELECT username FROM users WHERE id_user = ?', [p2UserId]);
            if (res) p2Name = res.username || 'Player 2';
          }
        } catch (e) {
        }

        const state = createInitialState();
        resetBall(state.ball, Math.random() > 0.5 ? 'left' : 'right');

        games[roomId] = {
          state,
          inputs: { p1: 'stop', p2: 'stop' },
          interval: setInterval(() => gameLoop(roomId, namespace, games[roomId], socketRooms, socketRoles, socketToUserId), 1000 / 120),
          countdown: 3,
          gameSaved: false,
          playerNames: { p1: p1Name, p2: p2Name },
          p1Id: p1UserId,
          p2Id: p2UserId,
          mapType: safeMapType
        };

        socketRooms[p1Socket.id] = roomId;
        socketRooms[p2Socket.id] = roomId;
        socketRoles[p1Socket.id] = 'p1';
        socketRoles[p2Socket.id] = 'p2';

        namespace.to(roomId).emit('match_found', {
          roomId,
          playerNames: { p1: p1Name, p2: p2Name },
          countdown: 3
        });
        p1Socket.emit('role', 'p1');
        p2Socket.emit('role', 'p2');

        p1Socket.emit('match_found', {
          playerNames: { p1: p1Name, p2: p2Name },
          mapType: safeMapType,
          countdown: 3
        });

        p2Socket.emit('match_found', {
          playerNames: { p1: p1Name, p2: p2Name },
          mapType: safeMapType,
          countdown: 3
        });
        const countdownInterval = setInterval(() => {
          const game = games[roomId];
          if (!game) {
            clearInterval(countdownInterval);
            return;
          }
          game.countdown--;
          if (game.countdown > 0) {
            namespace.to(roomId).emit('countdown', game.countdown);
          } else {
            clearInterval(countdownInterval);
            namespace.to(roomId).emit('game_start');
          }
        }, 1000);
      }
    },

    handleLeaveQueue: (socket: Socket, waitingPlayerRef: { current: { socketId: string; mapType: string } | null }) => () => {
      if (waitingPlayerRef.current?.socketId === socket.id) {
        waitingPlayerRef.current = null;
        console.log('Player left queue:', socket.id);
        socket.emit('left_queue');
      }
    },

    handleInput: (socket: Socket) => (dir: unknown) => {

      if (typeof dir !== 'string' || (dir !== 'up' && dir !== 'down' && dir !== 'stop')) {
        return;
      }

      const roomId = socketRooms[socket.id];
      const role = socketRoles[socket.id];

      if (!role || !roomId) {
        return;
      }

      const game = games[roomId];
      if (!game) {
        return;
      }

      if (game.countdown > 0) {
        return;
      }
      if (roomId && games[roomId] && role) {
        games[roomId].inputs[role] = dir;
      }
    },

    handleDisconnect: (socket: Socket, namespace: Namespace, waitingPlayerRef: { current: { socketId: string; mapType: string } | null }) => (reason: string) => {
      console.log(`Socket disconnected: ${socket.id} (Reason: ${reason})`);
      const roomId = socketRooms[socket.id];
      if (roomId && games[roomId]) {
        const game = games[roomId];
        const disconnectedRole = socketRoles[socket.id];

        if (disconnectedRole && !game.gameSaved) {
          const disconnectedUserId = socketToUserId[socket.id];

          const opponentSocket = Object.keys(socketRooms).find(
            sid => socketRooms[sid] === roomId && sid !== socket.id
          );

          if (opponentSocket && disconnectedUserId) {
            const opponentUserId = socketToUserId[opponentSocket];

            if (opponentUserId) {
              const winScore = disconnectedRole === 'p1' ? game.state.p2.score : game.state.p1.score;
              const loseScore = disconnectedRole === 'p1' ? game.state.p1.score : game.state.p2.score;

              saveGameResult(opponentUserId, disconnectedUserId, winScore, loseScore);
              game.gameSaved = true;
              console.log(`Saved forfeit game: Winner(${opponentUserId}) vs Loser(${disconnectedUserId})`);
            }
          }
        }

        clearInterval(games[roomId].interval);
        delete games[roomId];
        namespace.to(roomId).emit('opponent_disconnected');
        console.log('Cleaned up pong game room:', roomId);
      }
      if (waitingPlayerRef.current?.socketId === socket.id) {
        waitingPlayerRef.current = null;
        console.log('Removed from pong waiting queue');
      }
      delete socketRooms[socket.id];
      delete socketRoles[socket.id];
      delete socketToUserId[socket.id];
    }
  };
}
