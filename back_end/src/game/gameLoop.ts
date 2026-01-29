
import { Namespace } from 'socket.io';
import { GameSession } from './types';
import {
  resetBall, CANVAS_HEIGHT, CANVAS_WIDTH, PADDLE_HEIGHT, PADDLE_WIDTH,
  BALL_RADIUS, PADDLE_SPEED, MAX_BOUNCE_ANGLE, SPEED_INCREASE
} from './gameState';
import { saveGameResult } from './database';

const OBSTACLES = [
  { x: CANVAS_WIDTH / 2 - 25, y: 150, width: 50, height: 50 },
  { x: CANVAS_WIDTH / 2 - 25, y: CANVAS_HEIGHT - 200, width: 50, height: 50 },
];

export function gameLoop(
  roomId: string,
  namespace: Namespace,
  game: GameSession,
  socketRooms: Record<string, string>,
  socketRoles: Record<string, 'p1' | 'p2'>,
  socketToUserId: Record<string, number>
) {
  if (!game) return;

  if (game.countdown > 0) {
    return;
  }

  const dt = 1 / 120;
  const b = game.state.ball;

  // 1. Update Paddles
  const move = PADDLE_SPEED * dt;
  if (game.inputs.p1 === 'up') game.state.p1.y = Math.max(0, game.state.p1.y - move);
  if (game.inputs.p1 === 'down') game.state.p1.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, game.state.p1.y + move);
  if (game.inputs.p2 === 'up') game.state.p2.y = Math.max(0, game.state.p2.y - move);
  if (game.inputs.p2 === 'down') game.state.p2.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, game.state.p2.y + move);

  // 2. Update Ball Position
  b.x += b.dx * dt;
  b.y += b.dy * dt;

  // 3. Wall Collision
  if (b.y - BALL_RADIUS <= 0) {
    b.y = BALL_RADIUS;
    b.dy *= -1;
  } else if (b.y + BALL_RADIUS >= CANVAS_HEIGHT) {
    b.y = CANVAS_HEIGHT - BALL_RADIUS;
    b.dy *= -1;
  }

  // 4. Left Paddle Collision
  if (b.dx < 0 && b.x - BALL_RADIUS <= PADDLE_WIDTH &&
    b.y >= game.state.p1.y && b.y <= game.state.p1.y + PADDLE_HEIGHT) {

    b.x = PADDLE_WIDTH + BALL_RADIUS;

    const relativeIntersectY = b.y - (game.state.p1.y + PADDLE_HEIGHT / 2);
    const normalized = relativeIntersectY / (PADDLE_HEIGHT / 2);
    const bounceAngle = normalized * MAX_BOUNCE_ANGLE;

    const currentSpeed = Math.sqrt(b.dx ** 2 + b.dy ** 2) * SPEED_INCREASE;

    b.dx = Math.abs(currentSpeed * Math.cos(bounceAngle));
    b.dy = currentSpeed * Math.sin(bounceAngle);
  }

  // 5. Right Paddle Collision
  if (b.dx > 0 && b.x + BALL_RADIUS >= CANVAS_WIDTH - PADDLE_WIDTH &&
    b.y >= game.state.p2.y && b.y <= game.state.p2.y + PADDLE_HEIGHT) {

    b.x = CANVAS_WIDTH - PADDLE_WIDTH - BALL_RADIUS;

    const relativeIntersectY = b.y - (game.state.p2.y + PADDLE_HEIGHT / 2);
    const normalized = relativeIntersectY / (PADDLE_HEIGHT / 2);
    const bounceAngle = normalized * MAX_BOUNCE_ANGLE;

    const currentSpeed = Math.sqrt(b.dx ** 2 + b.dy ** 2) * SPEED_INCREASE;

    b.dx = -Math.abs(currentSpeed * Math.cos(bounceAngle));
    b.dy = currentSpeed * Math.sin(bounceAngle);
  }

  // 6. Obstacle Collision (For inverted map)
  if (game.mapType === 'inverted') {
    OBSTACLES.forEach((obstacle) => {
      const closestX = Math.max(obstacle.x, Math.min(b.x, obstacle.x + obstacle.width));
      const closestY = Math.max(obstacle.y, Math.min(b.y, obstacle.y + obstacle.height));
      const distanceX = b.x - closestX;
      const distanceY = b.y - closestY;
      const distanceSquared = distanceX * distanceX + distanceY * distanceY;

      // Check collision
      if (distanceSquared < BALL_RADIUS * BALL_RADIUS) {
        if (distanceSquared < 0.0001) {
          const distToLeft = b.x - obstacle.x;
          const distToRight = (obstacle.x + obstacle.width) - b.x;
          const distToTop = b.y - obstacle.y;
          const distToBottom = (obstacle.y + obstacle.height) - b.y;

          const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

          if (minDist === distToLeft) {
            b.x = obstacle.x - BALL_RADIUS;
            b.dx = -Math.abs(b.dx);
          } else if (minDist === distToRight) {
            b.x = obstacle.x + obstacle.width + BALL_RADIUS;
            b.dx = Math.abs(b.dx);
          } else if (minDist === distToTop) {
            b.y = obstacle.y - BALL_RADIUS;
            b.dy = -Math.abs(b.dy);
          } else {
            b.y = obstacle.y + obstacle.height + BALL_RADIUS;
            b.dy = Math.abs(b.dy);
          }
        } else {

          const distance = Math.sqrt(distanceSquared);
          const overlap = BALL_RADIUS - distance;
          const normX = distanceX / distance;
          const normY = distanceY / distance;

          b.x += normX * (overlap + 1.0);
          b.y += normY * (overlap + 1.0);

          if (Math.abs(distanceX) > Math.abs(distanceY)) {
            b.dx *= -1;
          } else {
            b.dy *= -1;
          }
        }
      }
    });
  }

  // 7. Scoring
  if (b.x + BALL_RADIUS < 0) {
    game.state.p2.score++;
    resetBall(b, 'right');
  } else if (b.x - BALL_RADIUS > CANVAS_WIDTH) {
    game.state.p1.score++;
    resetBall(b, 'left');
  }

  // 8. Game Over
  if (game.state.p1.score >= 5 || game.state.p2.score >= 5) {
    clearInterval(game.interval);

    if (!game.gameSaved) {
      const isP1Winner = game.state.p1.score >= 5;
      const winner = isP1Winner ? game.playerNames.p1 : game.playerNames.p2;

      const playerSockets = Object.keys(socketRooms).filter(sid => socketRooms[sid] === roomId);
      const p1Socket = playerSockets.find(sid => socketRoles[sid] === 'p1');
      const p2Socket = playerSockets.find(sid => socketRoles[sid] === 'p2');

      if (p1Socket && p2Socket) {
        const p1UserId = socketToUserId[p1Socket];
        const p2UserId = socketToUserId[p2Socket];

        if (p1UserId && p2UserId) {
          const winnerId = isP1Winner ? p1UserId : p2UserId;
          const loserId = isP1Winner ? p2UserId : p1UserId;
          const winScore = isP1Winner ? game.state.p1.score : game.state.p2.score;
          const loseScore = isP1Winner ? game.state.p2.score : game.state.p1.score;

          saveGameResult(winnerId, loserId, winScore, loseScore);
          game.gameSaved = true;
          console.log(`Saved completed game: Winner(${winnerId}) vs Loser(${loserId})`);
        }
      }

      namespace.to(roomId).emit('game_over', {
        winner,
        finalScores: {
          p1: game.state.p1.score,
          p2: game.state.p2.score
        },
        playerNames: game.playerNames
      });
    }
  } else {
    namespace.to(roomId).emit('game_state', {
      ...game.state,
      playerNames: game.playerNames
    });
  }
}
