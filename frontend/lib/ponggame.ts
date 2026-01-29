export interface PongOptions {
  canvas: HTMLCanvasElement;
  leftPlayer: string;
  rightPlayer: string;
  handleMatchEnd: (winner: string | null, finalScores: { left: number; right: number }) => void;
  winScore?: number;
  map: "default" | "inverted";
  onScoreUpdate: (scores: { left: number; right: number }) => void;
  leftPaddleColor?: string;
  rightPaddleColor?: string;
}

let animationFrame: number | null = null;
let countdownInterval: NodeJS.Timeout | null = null;
let lastTime = 0;

let activeGameId = 0;

export function startPong({
  canvas,
  leftPlayer,
  rightPlayer,
  handleMatchEnd,
  winScore = 5,
  map = "default",
  onScoreUpdate,
  leftPaddleColor,
  rightPaddleColor,
}: PongOptions) {
  activeGameId++;
  const currentGameId = activeGameId;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const colors = {
    default: {
      background: "#000000",
      paddle: "#10b981",
      ball: "#10b981",
      text: "#10b981",
    },
    inverted: {
      background: "#020617",
      paddle: "#ffffff",
      ball: "#ffffff",
      text: "#ffffff",
    },
  };

  const colorScheme = colors[map];

  const finalLeftPaddleColor = leftPaddleColor || colorScheme.paddle;
  const finalRightPaddleColor = rightPaddleColor || colorScheme.paddle;

  const paddleWidth = 15;
  const paddleHeight = 100;

  const paddleSpeed = 700;
  const ballRadius = 10;
  const initialSpeed = 600;

  const leftPaddle = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    dy: 0,
  };

  const rightPaddle = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    dy: 0,
  };

  const obstacles =
    map === "inverted"
      ? [
        { x: canvas.width / 2 - 25, y: 150, width: 50, height: 50 },
        { x: canvas.width / 2 - 25, y: canvas.height - 200, width: 50, height: 50 },
      ]
      : [];


  const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 0,
    dy: 0,
  };

  let leftScore = 0;
  let rightScore = 0;
  let gameOver = false;

  let countdown: number | null = 3;
  let isPausedForCountdown = true;


  const keys: Record<string, boolean> = {};
  function keyDown(e: KeyboardEvent) {
    if (e.key === "w" || e.key === "s" || e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
    }
    keys[e.key] = true;
  }
  function keyUp(e: KeyboardEvent) {
    if (e.key === "w" || e.key === "s" || e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
    }
    keys[e.key] = false;
  }
  document.addEventListener("keydown", keyDown);
  document.addEventListener("keyup", keyUp);

  function update(deltaTime: number) {
    if (gameOver || isPausedForCountdown) return;

    const framePaddleSpeed = paddleSpeed * deltaTime;

    // Move paddles
    if (keys["w"]) leftPaddle.y -= framePaddleSpeed;
    if (keys["s"]) leftPaddle.y += framePaddleSpeed;
    if (keys["ArrowUp"]) rightPaddle.y -= framePaddleSpeed;
    if (keys["ArrowDown"]) rightPaddle.y += framePaddleSpeed;

    leftPaddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, leftPaddle.y));
    rightPaddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, rightPaddle.y));

    // Move ball
    ball.x += ball.dx * deltaTime;
    ball.y += ball.dy * deltaTime;

    if (ball.y - ballRadius <= 0) {
      ball.y = ballRadius;
      ball.dy *= -1;
    } else if (ball.y + ballRadius >= canvas.height) {
      ball.y = canvas.height - ballRadius;
      ball.dy *= -1;
    }

    // Left paddle
    if (
      ball.dx < 0 &&
      ball.x - ballRadius <= leftPaddle.x + paddleWidth &&
      ball.y >= leftPaddle.y &&
      ball.y <= leftPaddle.y + paddleHeight
    ) {
      ball.x = leftPaddle.x + paddleWidth + ballRadius; // reposition
      const relativeIntersectY = ball.y - (leftPaddle.y + paddleHeight / 2);
      const normalized = relativeIntersectY / (paddleHeight / 2);
      const maxBounceAngle = Math.PI / 4; // 45°
      const bounceAngle = normalized * maxBounceAngle;

      // Speed increase
      const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      const newSpeed = currentSpeed * 1.05;

      ball.dx = Math.abs(newSpeed * Math.cos(bounceAngle));
      ball.dy = newSpeed * Math.sin(bounceAngle);
    }

    // Right paddle
    if (
      ball.dx > 0 &&
      ball.x + ballRadius >= rightPaddle.x &&
      ball.y >= rightPaddle.y &&
      ball.y <= rightPaddle.y + paddleHeight
    ) {
      ball.x = rightPaddle.x - ballRadius; // reposition
      const relativeIntersectY = ball.y - (rightPaddle.y + paddleHeight / 2);
      const normalized = relativeIntersectY / (paddleHeight / 2);
      const maxBounceAngle = Math.PI / 4;
      const bounceAngle = normalized * maxBounceAngle;

      // Speed increase
      const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      const newSpeed = currentSpeed * 1.05;

      ball.dx = -Math.abs(newSpeed * Math.cos(bounceAngle));
      ball.dy = newSpeed * Math.sin(bounceAngle);
    }

    obstacles.forEach((obstacle) => {
      const closestX = Math.max(obstacle.x, Math.min(ball.x, obstacle.x + obstacle.width));
      const closestY = Math.max(obstacle.y, Math.min(ball.y, obstacle.y + obstacle.height));
      const distanceX = ball.x - closestX;
      const distanceY = ball.y - closestY;
      const distanceSquared = distanceX * distanceX + distanceY * distanceY;

      // Check collision
      if (distanceSquared < ballRadius * ballRadius) {
        if (distanceSquared < 0.0001) {
          const distToLeft = ball.x - obstacle.x;
          const distToRight = (obstacle.x + obstacle.width) - ball.x;
          const distToTop = ball.y - obstacle.y;
          const distToBottom = (obstacle.y + obstacle.height) - ball.y;

          const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

          if (minDist === distToLeft) {
            ball.x = obstacle.x - ballRadius;
            ball.dx = -Math.abs(ball.dx);
          } else if (minDist === distToRight) {
            ball.x = obstacle.x + obstacle.width + ballRadius;
            ball.dx = Math.abs(ball.dx);
          } else if (minDist === distToTop) {
            ball.y = obstacle.y - ballRadius;
            ball.dy = -Math.abs(ball.dy);
          } else {
            ball.y = obstacle.y + obstacle.height + ballRadius;
            ball.dy = Math.abs(ball.dy);
          }
        } else {
          const distance = Math.sqrt(distanceSquared);
          const overlap = ballRadius - distance;
          const normX = distanceX / distance;
          const normY = distanceY / distance;

          ball.x += normX * (overlap + 1.0);
          ball.y += normY * (overlap + 1.0);
          if (Math.abs(distanceX) > Math.abs(distanceY)) {
            ball.dx *= -1;
          } else {
            ball.dy *= -1;
          }
        }
      }
    });


    if (ball.x + ballRadius < 0) {
      rightScore++;
      onScoreUpdate({ left: leftScore, right: rightScore });
      resetRound("right");
    } else if (ball.x - ballRadius > canvas.width) {
      leftScore++;
      onScoreUpdate({ left: leftScore, right: rightScore });
      resetRound("left");
    }

    if (leftScore >= winScore) {
      endGame(leftPlayer);
    } else if (rightScore >= winScore) {
      endGame(rightPlayer);
    }
  }

  function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    isPausedForCountdown = true;
    countdown = 3;
    countdownInterval = setInterval(() => {
      countdown!--;
      if (countdown! <= 0) {
        clearInterval(countdownInterval!);
        countdownInterval = null;
        countdown = null;
        isPausedForCountdown = false;
      }
    }, 1000);
  }

  function resetRound(direction: "left" | "right") {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    const dir = direction === "left" ? -1 : 1;
    ball.dx = dir * initialSpeed;
    ball.dy = (Math.random() - 0.5) * (initialSpeed / 2);
    startCountdown();
  }

  function endGame(winner: string) {
    gameOver = true;
    if (countdownInterval) clearInterval(countdownInterval);
    cancelAnimationFrame(animationFrame!);
    handleMatchEnd(winner, { left: leftScore, right: rightScore });
  }

  function draw() {
    if (!ctx) return;
    ctx.fillStyle = colorScheme.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.shadowBlur = 20;

    ctx.shadowColor = finalLeftPaddleColor;
    ctx.fillStyle = finalLeftPaddleColor;
    ctx.fillRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight);

    // Right Paddle
    ctx.shadowColor = finalRightPaddleColor;
    ctx.fillStyle = finalRightPaddleColor;
    ctx.fillRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight);

    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";

    if (map === "inverted") {
      ctx.fillStyle = colorScheme.paddle;
      obstacles.forEach((obstacle) => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      });
    }

    if (!isPausedForCountdown) {
      ctx.fillStyle = colorScheme.ball;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (countdown !== null && countdown > 0) {
      ctx.font = "100px Arial";
      ctx.fillStyle = colorScheme.text;
      ctx.textAlign = "center";
      ctx.fillText(String(countdown), canvas.width / 2, canvas.height / 2);
    }
  }

  function loop(currentTime: number) {
    if (currentGameId !== activeGameId) return;

    if (gameOver) return;

    if (lastTime === 0) {
      lastTime = currentTime;
    }

    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    update(deltaTime);
    draw();

    animationFrame = requestAnimationFrame(loop);
  }

  lastTime = 0;
  resetRound(Math.random() > 0.5 ? "left" : "right");
  animationFrame = requestAnimationFrame(loop);

  return () => {
    if (countdownInterval) clearInterval(countdownInterval);
    document.removeEventListener("keydown", keyDown);
    document.removeEventListener("keyup", keyUp);
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  };
}

export function stopPong() {
  activeGameId++;
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  lastTime = 0;
}