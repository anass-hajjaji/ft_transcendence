export type MapType = "default" | "inverted";
export type GameStep = "map" | "customize" | "connect" | "play";

export interface PaddleColors {
  left: string;
  right: string;
}

export interface PlayerNames {
  p1: string;
  p2: string;
}

export interface ServerGameState {
  ball: { x: number; y: number };
  p1: { y: number; score: number };
  p2: { y: number; score: number };
  playerNames?: PlayerNames;
}
