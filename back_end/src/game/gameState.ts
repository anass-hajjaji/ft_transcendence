export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 720;
export const PADDLE_WIDTH = 15;
export const PADDLE_HEIGHT = 100;
export const BALL_RADIUS = 10;
export const INITIAL_SPEED = 600;
export const PADDLE_SPEED = 700;
export const MAX_BOUNCE_ANGLE = Math.PI / 4;
export const SPEED_INCREASE = 1.05;
export const MAX_SPEED = 1200;

export interface GameState {
  ball: { x: number; y: number; dx: number; dy: number };
  p1: { y: number; score: number };
  p2: { y: number; score: number };
}

export function createInitialState(): GameState {
  return {
    ball: { 
      x: CANVAS_WIDTH / 2, 
      y: CANVAS_HEIGHT / 2, 
      dx: 0, 
      dy: 0 
    },
    p1: { y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, score: 0 },
    p2: { y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, score: 0 },
  };
}

export function resetBall(ball: GameState['ball'], direction: 'left' | 'right') {
  ball.x = CANVAS_WIDTH / 2;
  ball.y = CANVAS_HEIGHT / 2;
  const dir = direction === 'left' ? -1 : 1;
  ball.dx = dir * INITIAL_SPEED;
  ball.dy = (Math.random() - 0.5) * (INITIAL_SPEED / 2);
}