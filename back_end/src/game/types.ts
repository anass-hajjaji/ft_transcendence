import { GameState } from './gameState';

export interface GameSession {
  state: GameState;
  inputs: { p1: string; p2: string };
  interval: NodeJS.Timeout;
  countdown: number;
  gameSaved: boolean;
  playerNames: { p1: string; p2: string };
  p1Id?: number;
  p2Id?: number;
  mapType: string;
}

export interface GameMaps {
  games: Record<string, GameSession>;
  socketRooms: Record<string, string>;
  socketRoles: Record<string, 'p1' | 'p2'>;
  socketToUserId: Record<string, number>;
  waitingPlayer: string | null;
}
