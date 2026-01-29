export interface NewGamePayload {
  winnerName: string;
  loserName: string; 
  winScore: number;
  loseScore: number;
  gameType: 'pong' | 'xo';
  tournamentId?: number;
}