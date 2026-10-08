// Breakout rules, free of React and the canvas. Everything happens on a fixed 360×480 field (y grows downward);
// the screen scales it to fit.

export const W = 360;
export const H = 480;
export const BALL_R = 6;
export const PADDLE_W = 64;
export const PADDLE_H = 10;
export const PADDLE_Y = 446;
export const ROWS = 6; // rows of bricks on level 1
export const MAX_ROWS = 9;
export const COLS = 8;
export const LIVES = 3;
const SPEED = 290; // launch speed on level 1, field units per second
const MAX_SPEED = 520;
const MAX_BOUNCE = (60 * Math.PI) / 180; // off the very end of the paddle

export type Brick = { x: number; y: number; w: number; h: number; row: number; alive: boolean };
export type Ball = { x: number; y: number; vx: number; vy: number };

export type Breakout = {
  /** Centre of the paddle. */
  paddle: number;
  ball: Ball;
  bricks: Brick[];
  score: number;
  lives: number;
  /** 1 on a new game. Clearing the wall ("won") lets the player start the next, tougher level. */
  level: number;
  /** serve = the ball rests on the paddle until launched. */
  status: "serve" | "playing" | "won" | "over";
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const onPaddle = (paddle: number): Ball => ({ x: paddle, y: PADDLE_Y - BALL_R, vx: 0, vy: 0 });

/** Points for a brick: the higher the row, the more it is worth (the extra rows of later levels are worth the least). */
export const brickPoints = (row: number) => Math.max(1, ROWS - row) * 10;

/** Each level adds a row of bricks (up to MAX_ROWS) and launches the ball faster (capped below the in-play top speed). */
export const rowsFor = (level: number) => Math.min(ROWS + level - 1, MAX_ROWS);
export const launchSpeed = (level: number) => Math.min(SPEED + 30 * (level - 1), MAX_SPEED - 100);

export function newBricks(rows = ROWS): Brick[] {
  const side = 12;
  const gap = 4;
  const w = (W - side * 2 - gap * (COLS - 1)) / COLS;
  const h = 14;
  return Array.from({ length: rows * COLS }, (_, i) => {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    return { x: side + col * (w + gap), y: 56 + row * (h + gap), w, h, row, alive: true };
  });
}

export function newBreakout(): Breakout {
  const paddle = W / 2;
  return { paddle, ball: onPaddle(paddle), bricks: newBricks(), score: 0, lives: LIVES, level: 1, status: "serve" };
}

/** After a cleared wall: a fresh, bigger wall and a faster ball. Score and lives carry over. */
export function nextLevel(s: Breakout): Breakout {
  if (s.status !== "won") return s;
  const level = s.level + 1;
  return { ...s, level, bricks: newBricks(rowsFor(level)), ball: onPaddle(s.paddle), status: "serve" };
}

/** Moves the paddle (centre) to `x`, kept on the field. A served ball rides along. */
export function movePaddle(s: Breakout, x: number): Breakout {
  const paddle = clamp(x, PADDLE_W / 2, W - PADDLE_W / 2);
  return { ...s, paddle, ball: s.status === "serve" ? onPaddle(paddle) : s.ball };
}

/** Launches the ball upward, `angle` radians off vertical (negative = to the left). */
export function serve(s: Breakout, angle = 0): Breakout {
  if (s.status !== "serve") return s;
  return { ...s, status: "playing", ball: { ...s.ball, vx: launchSpeed(s.level) * Math.sin(angle), vy: -launchSpeed(s.level) * Math.cos(angle) } };
}

function hits(b: Ball, r: { x: number; y: number; w: number; h: number }): boolean {
  const cx = clamp(b.x, r.x, r.x + r.w);
  const cy = clamp(b.y, r.y, r.y + r.h);
  return (b.x - cx) ** 2 + (b.y - cy) ** 2 <= BALL_R ** 2;
}

/** One small time step (short enough that the ball can't pass through a brick). */
function substep(s: Breakout, dt: number): Breakout {
  const b = { ...s.ball, x: s.ball.x + s.ball.vx * dt, y: s.ball.y + s.ball.vy * dt };

  // Walls (left, right, top)
  if (b.x < BALL_R) [b.x, b.vx] = [BALL_R, Math.abs(b.vx)];
  if (b.x > W - BALL_R) [b.x, b.vx] = [W - BALL_R, -Math.abs(b.vx)];
  if (b.y < BALL_R) [b.y, b.vy] = [BALL_R, Math.abs(b.vy)];

  // Paddle: where the ball lands sets the new angle, so the player can aim.
  const paddle = { x: s.paddle - PADDLE_W / 2, y: PADDLE_Y, w: PADDLE_W, h: PADDLE_H };
  if (b.vy > 0 && hits(b, paddle)) {
    const angle = clamp((b.x - s.paddle) / (PADDLE_W / 2), -1, 1) * MAX_BOUNCE;
    const speed = Math.hypot(b.vx, b.vy);
    [b.vx, b.vy, b.y] = [speed * Math.sin(angle), -speed * Math.cos(angle), PADDLE_Y - BALL_R];
  }

  // Bricks: bounce off the side the ball came through (the axis with the smaller overlap), then speed up a little.
  let { bricks, score } = s;
  const hit = bricks.findIndex((br) => br.alive && hits(b, br));
  if (hit >= 0) {
    const br = bricks[hit];
    const overlapX = Math.min(b.x + BALL_R - br.x, br.x + br.w - (b.x - BALL_R));
    const overlapY = Math.min(b.y + BALL_R - br.y, br.y + br.h - (b.y - BALL_R));
    if (overlapX < overlapY) b.vx = b.x < br.x + br.w / 2 ? -Math.abs(b.vx) : Math.abs(b.vx);
    else b.vy = b.y < br.y + br.h / 2 ? -Math.abs(b.vy) : Math.abs(b.vy);
    const speed = Math.hypot(b.vx, b.vy);
    const faster = Math.min(MAX_SPEED, speed * 1.015) / speed;
    [b.vx, b.vy] = [b.vx * faster, b.vy * faster];
    bricks = bricks.map((x, i) => (i === hit ? { ...x, alive: false } : x));
    score += brickPoints(br.row);
    if (!bricks.some((x) => x.alive)) return { ...s, ball: b, bricks, score, status: "won" };
  }

  // Fell past the paddle: lose a life.
  if (b.y - BALL_R > H) {
    const lives = s.lives - 1;
    return { ...s, bricks, score, lives, ball: onPaddle(s.paddle), status: lives > 0 ? "serve" : "over" };
  }
  return { ...s, ball: b, bricks, score };
}

/** Advances the game by `dt` seconds (capped, so a paused tab doesn't jump). */
export function stepBreakout(s: Breakout, dt: number): Breakout {
  let left = Math.min(dt, 0.05);
  while (left > 0 && s.status === "playing") {
    const h = Math.min(left, 1 / 240);
    s = substep(s, h);
    left -= h;
  }
  return s;
}
