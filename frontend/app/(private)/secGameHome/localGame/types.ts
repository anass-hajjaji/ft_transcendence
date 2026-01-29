export type Player = "X" | "O" | null;
export type Board = Player[];

export interface GameState {
  board: Board;
  xIsNext: boolean;
}

export interface PlayerInfo {
  name: string;
  symbol: Player;
  label: string;
}
