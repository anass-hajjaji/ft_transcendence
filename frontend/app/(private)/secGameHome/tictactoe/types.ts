export type PlayerSymbol = "X" | "O" | "+" | "-";
export type MapSize = "3x3" | "4x4";
export type SymbolSet = "XO" | "+-";

export type GameStatus =
  | "SETTINGS"
  | "SEARCHING"
  | "PLAYING"
  | "GAME_OVER"
  | "QUEUE_ERROR";

export interface UserInfo {
  username: string;
  fullName?: string;
}

export interface GameSettings {
  mapSize: MapSize;
  symbolSet: SymbolSet;
}

export interface GameState {
  status: GameStatus;
  board: (PlayerSymbol | null)[];
  mySymbol: PlayerSymbol | null;
  isMyTurn: boolean;
  winner: PlayerSymbol | "DRAW" | null;
  opponentName: string;
  disconnectReason: string | null;
  gameCount: number;
  queueErrorMessage: string;
  roomId: string | null;
}


export interface Player {
  socketId: string;
  dbId: number;
  symbol: PlayerSymbol;
  username: string;
}

export interface GameStartPayload {
  roomId: string;
  players: Player[];
  currentTurn: PlayerSymbol;
  settings?: GameSettings;
  isRematch?: boolean;
}

export interface UpdateBoardPayload {
  board: (PlayerSymbol | null)[];
  currentTurn: PlayerSymbol;
}

export interface GameOverPayload {
  board: (PlayerSymbol | null)[];
  winner: PlayerSymbol | null;
  isDraw: boolean;
  reason?: string;
}

export interface ErrorPayload {
  message: string;
}

export interface QueuePayload {
  message: string;
}
