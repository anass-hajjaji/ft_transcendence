import { MapSize, SymbolSet, PlayerSymbol } from "../types";

export function getBoardSize(mapSize: MapSize): number {
  return mapSize === "3x3" ? 9 : 16;
}

export function getGridCols(mapSize: MapSize): number {
  return mapSize === "3x3" ? 3 : 4;
}

export function getSymbols(symbolSet: SymbolSet): [PlayerSymbol, PlayerSymbol] {
  return symbolSet === "XO" ? ["X", "O"] : ["+", "-"];
}

export function getSymbolColor(
  symbol: PlayerSymbol | null,
  symbols: [PlayerSymbol, PlayerSymbol]
): string {
  if (!symbol) return "";
  return symbol === symbols[0] ? "text-emerald-400" : "text-blue-400";
}
