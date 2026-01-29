import { FastifyInstance } from 'fastify';
import { Server, Socket, Namespace } from 'socket.io';
import { db } from '../db';
import { z } from 'zod';
import jsonwebtoken from 'jsonwebtoken';

const TicTacToeSettingsSchema = z.object({
  mapSize: z.enum(['3x3', '4x4']).default('3x3'),
  symbolSet: z.enum(['XO', '+-']).default('XO')
}).optional();

const TicTacToeMoveSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  index: z.number().min(0).max(15, "Invalid board index")
});


function safeParse<T>(schema: z.ZodSchema<T>, data: unknown, eventName: string): T | false {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`TicTacToe Validation failed for "${eventName}":`, result.error.format());
    return false;
  }
  return result.data;
}


type PlayerSymbol = 'X' | 'O' | '+' | '-';
type MapSize = '3x3' | '4x4';
type SymbolSet = 'XO' | '+-';

interface GameSettings {
  mapSize: MapSize;
  symbolSet: SymbolSet;
}

interface GameState {
  roomId: string;
  board: (PlayerSymbol | null)[];
  players: { socketId: string; dbId: number; symbol: PlayerSymbol; username: string }[];
  turnIndex: 0 | 1;
  isFinished: boolean;
  settings: GameSettings;
}

interface QueuePlayer {
  socketId: string;
  dbId: number;
  username: string;
  wins: number;
  losses: number;
  skill: number;
  settings: GameSettings;
}


const activeGames = new Map<string, GameState>();
const matchmakingQueue: QueuePlayer[] = [];

const BATCH_SIZE = 4;
const BATCH_TIMEOUT_MS = 5000;
let batchTimer: NodeJS.Timeout | null = null;


const getAuthenticatedUser = (userId: number): Promise<{ id: number, username: string, wins: number, losses: number }> => {
    return new Promise((resolve, reject) => {
        db.get('SELECT id_user, username, wins, losses FROM users WHERE id_user = ?', [userId], (err, row: any) => {
            if (err) return reject(err);
            if (row) {
                resolve({
                    id: row.id_user, 
                    username: row.username,
                    wins: row.wins || 0, 
                    losses: row.losses || 0 
                });
            } else {
                reject(new Error('User not found. Please login first.'));
            }
        });
    });
};

const saveGameResult = (winnerId: number, loserId: number, type: string, scoreW: number, scoreL: number) => {
    db.run(`
        INSERT INTO game (winner_id, loser_id, win_score, lose_score, game_type)
        VALUES (?, ?, ?, ?, ?)
    `, [winnerId, loserId, scoreW, scoreL, type], (err: any) => {
        if (err) console.error("DB Save Error:", err);
    });

    db.run('UPDATE users SET wins = wins + 1 WHERE id_user = ?', [winnerId]);
    db.run('UPDATE users SET losses = losses + 1 WHERE id_user = ?', [loserId]);
};

const saveDrawResult = (player1Id: number, player2Id: number, type: string) => {
    db.run(`
        INSERT INTO game (winner_id, loser_id, win_score, lose_score, game_type)
        VALUES (?, ?, ?, ?, ?)
    `, [player1Id, player2Id, 0, 0, type], (err: any) => {
        if (err) console.error("DB Save Draw Error:", err);
    });

    db.run('UPDATE users SET draws = draws + 1 WHERE id_user IN (?, ?)', [player1Id, player2Id]);
};


const createGameMatch = (namespace: Namespace, p1: QueuePlayer, p2: QueuePlayer) => {
    const roomId = `tictactoe_room_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const s1 = namespace.sockets.get(p1.socketId);
    const s2 = namespace.sockets.get(p2.socketId);

    if (!s1 || !s2) return;

    s1.join(roomId);
    s2.join(roomId);

    const gameSettings = p1.settings;
    const boardSize = gameSettings.mapSize === '4x4' ? 16 : 9;
    const [symbol1, symbol2] = gameSettings.symbolSet === 'XO' ? ['X', 'O'] : ['+', '-'];

    const newGame: GameState = {
        roomId,
        board: Array(boardSize).fill(null),
        players: [
            { socketId: p1.socketId, dbId: p1.dbId, symbol: symbol1 as PlayerSymbol, username: p1.username },
            { socketId: p2.socketId, dbId: p2.dbId, symbol: symbol2 as PlayerSymbol, username: p2.username }
        ],
        turnIndex: 0,
        isFinished: false,
        settings: gameSettings
    };

    activeGames.set(roomId, newGame);

    namespace.to(roomId).emit('game_start', {
        roomId,
        players: newGame.players,
        currentTurn: symbol1,
        settings: gameSettings
    });

    console.log(`MATCH MADE: ${p1.username} vs ${p2.username} (${gameSettings.mapSize}, ${gameSettings.symbolSet})`);
};

const processMatchmakingBatch = (namespace: Namespace) => {
    console.log(`Processing Batch... Queue Size: ${matchmakingQueue.length}`);

    if (matchmakingQueue.length < 2) {
        if (matchmakingQueue.length === 1 && !batchTimer) {
            startBatchTimer(namespace);
        }
        return;
    }

    const settingsGroups = new Map<string, QueuePlayer[]>();
    
    for (const player of matchmakingQueue) {
        const key = `${player.settings.mapSize}-${player.settings.symbolSet}`;
        if (!settingsGroups.has(key)) {
            settingsGroups.set(key, []);
        }
        settingsGroups.get(key)!.push(player);
    }

    matchmakingQueue.length = 0;

    for (const [key, players] of settingsGroups) {
        players.sort((a, b) => a.skill - b.skill);
        
        while (players.length >= 2) {
            const p1 = players.shift()!;
            const p2 = players.shift()!;
            createGameMatch(namespace, p1, p2);
        }

        matchmakingQueue.push(...players);
    }

    if (matchmakingQueue.length > 0) {
        for (const leftover of matchmakingQueue) {
            const socket = namespace.sockets.get(leftover.socketId);
            if (socket) {
                socket.emit('waiting_in_queue', { 
                    message: `Finding opponent with ${leftover.settings.mapSize} ${leftover.settings.symbolSet} settings...` 
                });
            }
        }
        if (!batchTimer) startBatchTimer(namespace);
    } else {
        if (batchTimer) {
            clearTimeout(batchTimer);
            batchTimer = null;
        }
    }
};

const startBatchTimer = (namespace: Namespace) => {
    if (batchTimer) return;
    
    batchTimer = setTimeout(() => {
        batchTimer = null;
        processMatchmakingBatch(namespace);
    }, BATCH_TIMEOUT_MS);
};

const authenticateSocket = async (socket: Socket, next: (err?: Error) => void) => {
    try {
        const token = socket.handshake.auth?.token;
        
        if (!token) {
            console.error("No token provided in handshake");
            return next(new Error('Authentication required. Please login first.'));
        }

        const secret = process.env.JWT_SECRET || 'secret';
        const decoded = jsonwebtoken.verify(token, secret) as { id: number };
        
        (socket as any).userId = decoded.id;
        console.log(`Socket authenticated for user ID: ${decoded.id}`);
        next();
    } catch (error: any) {
        console.error("JWT Verification Failed:", error.message);
        next(new Error('Invalid token. Please login again.'));
    }
};

export const setupTicTacToeNamespace = (namespace: Namespace) => {
    namespace.use(authenticateSocket as any);

    namespace.on('connection', (socket) => {
        (socket as any).userData = null;

        socket.on('join_queue', async (data: unknown) => {
            const userId = (socket as any).userId;
            const validated = safeParse(TicTacToeSettingsSchema, data, 'join_queue');
            if (!validated) return; // Reject if invalid

            if (!userId) {
                socket.emit('error', { message: 'Authentication required' });
                return;
            }

            const gameSettings: GameSettings = {
                mapSize: validated?.mapSize === '4x4' ? '4x4' : '3x3',
                symbolSet: validated?.symbolSet === '+-' ? '+-' : 'XO'
            };

            const existingQueueEntry = matchmakingQueue.find(p => p.dbId === userId);
            if (existingQueueEntry && existingQueueEntry.socketId !== socket.id) {
                socket.emit('already_in_queue', { 
                    message: 'You are already in the matchmaking queue from another tab/window.' 
                });
                socket.disconnect(true);
                return;
            }

            const activeGame = [...activeGames.values()].find(g => 
                !g.isFinished && g.players.some(p => p.dbId === userId)
            );
            if (activeGame) {
                socket.emit('already_in_game', { 
                    message: 'You are already in an active game.' 
                });
                socket.disconnect(true);
                return;
            }

            try {
                const user = await getAuthenticatedUser(userId);
                const skill = user.wins - user.losses;

                (socket as any).userData = {
                    dbId: user.id,
                    username: user.username,
                    settings: gameSettings
                };

                const player: QueuePlayer = {
                    socketId: socket.id,
                    dbId: user.id,
                    username: user.username,
                    wins: user.wins,
                    losses: user.losses,
                    skill,
                    settings: gameSettings
                };

                matchmakingQueue.push(player);
                console.log(`${user.username} joined queue (${gameSettings.mapSize}, ${gameSettings.symbolSet})`);

                socket.emit('waiting_in_queue', { 
                    message: `Joined Queue (${gameSettings.mapSize} ${gameSettings.symbolSet}). Waiting...` 
                });

                if (matchmakingQueue.length >= BATCH_SIZE) {
                    if (batchTimer) {
                        clearTimeout(batchTimer);
                        batchTimer = null;
                    }
                    processMatchmakingBatch(namespace);
                } else {
                    startBatchTimer(namespace);
                }

            } catch (err: any) {
                console.error("Queue Error:", err);
                socket.emit('error', { message: err.message || 'Failed to join queue' });
            }
        });

        socket.on('make_move', (data: unknown) => {
            const validated = safeParse(TicTacToeMoveSchema, data, 'make_move');
            if (!validated) return;

            const game = activeGames.get(validated.roomId);
            const targetGame = game || [...activeGames.values()].find(g => 
                g.players.some(p => p.socketId === socket.id)
            );
            
            if (!targetGame) return;
            if (targetGame.isFinished) return;

            if (validated.index >= targetGame.board.length) {
                console.warn(`Move out of bounds: Index ${validated.index} for ${targetGame.settings.mapSize} map.`);
                socket.emit('error', { message: 'Invalid move for this map size.' });
                return;
            }

            const pIdx = targetGame.players.findIndex(p => p.socketId === socket.id);
            if (pIdx === -1 || pIdx !== targetGame.turnIndex || targetGame.board[validated.index]) return;

            targetGame.board[validated.index] = targetGame.players[pIdx].symbol;
            
            const winner = checkWinner(targetGame.board, targetGame.settings.mapSize);
            const isDraw = !winner && targetGame.board.every(Boolean);

            if (winner || isDraw) {
                targetGame.isFinished = true;
                const p1 = targetGame.players[0];
                const p2 = targetGame.players[1];

                namespace.to(targetGame.roomId).emit('game_over', {
                    board: targetGame.board,
                    winner: winner,
                    isDraw
                });
                
                if (winner) {
                    const wObj = targetGame.players[pIdx];
                    const lObj = targetGame.players[pIdx === 0 ? 1 : 0];
                    saveGameResult(wObj.dbId, lObj.dbId, 'tic-tac-toe', 1, 0);
                } else if (isDraw) {
                    saveDrawResult(p1.dbId, p2.dbId, 'tic-tac-toe');
                }
            } else {
                targetGame.turnIndex = targetGame.turnIndex === 0 ? 1 : 0;
                namespace.to(targetGame.roomId).emit('update_board', {
                    board: targetGame.board,
                    currentTurn: targetGame.players[targetGame.turnIndex].symbol
                });
            }
        });

        socket.on('disconnect', () => {
            const userId = (socket as any).userId;
            const disconnectedSocketId = socket.id;
            
            if (userId) {
                const qIdx = matchmakingQueue.findIndex(p => p.socketId === disconnectedSocketId);
                if (qIdx > -1) {
                    matchmakingQueue.splice(qIdx, 1);
                    if (matchmakingQueue.length === 0 && batchTimer) {
                        clearTimeout(batchTimer);
                        batchTimer = null;
                    }
                }
            }

            for (const [id, game] of activeGames) {
                if (game.isFinished) continue;

                const player = game.players.find(p => p.socketId === disconnectedSocketId);
                if (player) {
                    game.isFinished = true;
                    const opponent = game.players.find(p => p.socketId !== disconnectedSocketId);
                    if (opponent) {
                        namespace.to(opponent.socketId).emit('game_over', {
                            board: game.board,
                            winner: opponent.symbol,
                            isDraw: false,
                            reason: 'opponent_disconnect'
                        });
                        saveGameResult(opponent.dbId, player.dbId, 'tic-tac-toe', 1, 0);
                    }
                    activeGames.delete(id);
                    break;
                }
            }
        });
    });
};

export const setupTicTacToeSocket = (server: FastifyInstance) => {
    const allowedOrigin = process.env.FRONTEND_URL!;
    const io = new Server(server.server, {
        cors: { 
            origin: allowedOrigin,
            methods: ["GET", "POST"],
            credentials: true
        }
    });
    setupTicTacToeNamespace(io.of('/'));
    return io;
};

function checkWinner(squares: (PlayerSymbol | null)[], mapSize: MapSize): PlayerSymbol | null {
    const lines = mapSize === '3x3' 
        ? [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]]
        : [[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15], [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15], [0,5,10,15], [3,6,9,12]];

    for (const line of lines) {
        if (line.every(idx => squares[idx] && squares[idx] === squares[line[0]])) {
            return squares[line[0]];
        }
    }
    return null;
}