import { useState, useEffect } from "react";
import { Board, GameState } from "../types";

const STORAGE_KEY = "tic-tac-toe-local-game";

export function useLocalGame() {
  const emptyBoard: Board = Array(9).fill(null);
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [xIsNext, setXIsNext] = useState(true);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GameState;
        if (Array.isArray(parsed?.board) && typeof parsed?.xIsNext === "boolean") {
          setBoard(parsed.board);
          setXIsNext(parsed.xIsNext);
        }
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ board, xIsNext }));
    } catch {
    }
  }, [board, xIsNext]);

  const handleClick = (i: number, winner: "X" | "O" | "DRAW" | null) => {
    if (board[i] || winner) return;
    const newBoard = board.slice();
    newBoard[i] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const reset = () => {
    setBoard(emptyBoard);
    setXIsNext(true);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
    }
  };

  return { board, xIsNext, handleClick, reset };
}
