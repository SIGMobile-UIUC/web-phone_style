import { expect, test } from "bun:test";
import {
  BALL_R,
  brickPoints,
  COLS,
  H,
  launchSpeed,
  LIVES,
  MAX_ROWS,
  movePaddle,
  newBreakout,
  nextLevel,
  PADDLE_W,
  PADDLE_Y,
  ROWS,
  rowsFor,
  serve,
  stepBreakout,
  W,
  type Ball,
  type Breakout,
} from "./breakout";

/** A game in play with no bricks in the way (except those given) and the ball where we want it. */
const playing = (ball: Ball, over: Partial<Breakout> = {}): Breakout => ({
  ...newBreakout(),
  bricks: [{ x: 0, y: 0, w: 1, h: 1, row: 0, alive: true }], // far corner, never hit
  status: "playing",
  ball,
  ...over,
});

test("a new game has a full wall of bricks and the ball resting on the paddle", () => {
  const g = newBreakout();
  expect(g.bricks).toHaveLength(ROWS * COLS);
  expect(g.status).toBe("serve");
  expect(g.lives).toBe(LIVES);
  expect(g.ball).toEqual({ x: W / 2, y: PADDLE_Y - BALL_R, vx: 0, vy: 0 });
  const last = g.bricks.at(-1)!;
  expect(last.x + last.w).toBeCloseTo(W - 12);
});

test("the paddle stays on the field, and carries the ball before the serve", () => {
  expect(movePaddle(newBreakout(), -50).paddle).toBe(PADDLE_W / 2);
  expect(movePaddle(newBreakout(), 9999).paddle).toBe(W - PADDLE_W / 2);
  expect(movePaddle(newBreakout(), 100).ball.x).toBe(100);
  const inPlay = playing({ x: 50, y: 50, vx: 0, vy: 100 });
  expect(movePaddle(inPlay, 100).ball).toBe(inPlay.ball);
});

test("serving launches the ball upward", () => {
  const g = serve(newBreakout());
  expect(g.status).toBe("playing");
  expect(g.ball.vx).toBeCloseTo(0);
  expect(g.ball.vy).toBeLessThan(0);
  expect(serve(g)).toBe(g);
});

test("the ball bounces off the side and top walls", () => {
  const left = stepBreakout(playing({ x: BALL_R + 1, y: 200, vx: -200, vy: 0 }), 0.02);
  expect(left.ball.vx).toBeGreaterThan(0);
  const top = stepBreakout(playing({ x: 300, y: BALL_R + 1, vx: 0, vy: -200 }), 0.02);
  expect(top.ball.vy).toBeGreaterThan(0);
});

test("the paddle sends the ball back up, angled by where it hits", () => {
  const ball = (x: number): Ball => ({ x, y: PADDLE_Y - BALL_R - 1, vx: 0, vy: 200 });
  const centre = stepBreakout(playing(ball(W / 2)), 0.02).ball;
  expect(centre.vy).toBeLessThan(0);
  expect(centre.vx).toBeCloseTo(0);
  const rightEdge = stepBreakout(playing(ball(W / 2 + PADDLE_W / 2 - 2)), 0.02).ball;
  expect(rightEdge.vx).toBeGreaterThan(0);
  expect(rightEdge.vy).toBeLessThan(0);
  expect(Math.hypot(rightEdge.vx, rightEdge.vy)).toBeCloseTo(200); // aiming doesn't change the speed
});

test("hitting a brick breaks it, scores, and bounces the ball", () => {
  const brick = { x: 100, y: 100, w: 40, h: 14, row: 2, alive: true };
  const other = { x: 0, y: 0, w: 1, h: 1, row: 0, alive: true };
  const g = stepBreakout(playing({ x: 120, y: 125, vx: 0, vy: -200 }, { bricks: [brick, other] }), 0.05);
  expect(g.bricks[0].alive).toBe(false);
  expect(g.score).toBe(brickPoints(2));
  expect(g.ball.vy).toBeGreaterThan(0);
  expect(Math.hypot(g.ball.vx, g.ball.vy)).toBeGreaterThan(200); // a little faster after every brick
  expect(brickPoints(0)).toBeGreaterThan(brickPoints(ROWS - 1));
});

test("breaking the last brick wins", () => {
  const brick = { x: 100, y: 100, w: 40, h: 14, row: 5, alive: true };
  const g = stepBreakout(playing({ x: 120, y: 125, vx: 0, vy: -200 }, { bricks: [brick] }), 0.05);
  expect(g.status).toBe("won");
});

test("clearing the wall opens the next level: bigger wall, faster ball, score and lives kept", () => {
  const cleared: Breakout = { ...newBreakout(), bricks: [], status: "won", score: 120, lives: 2 };
  const next = nextLevel(cleared);
  expect(next).toMatchObject({ level: 2, status: "serve", score: 120, lives: 2 });
  expect(next.bricks).toHaveLength(rowsFor(2) * COLS);
  expect(next.bricks.every((b) => b.alive)).toBe(true);
  expect(Math.abs(serve(next).ball.vy)).toBeGreaterThan(Math.abs(serve(newBreakout()).ball.vy));
  expect(nextLevel(newBreakout())).toEqual(newBreakout()); // only after winning
});

test("levels get harder up to a cap", () => {
  expect(rowsFor(1)).toBe(ROWS);
  expect(rowsFor(99)).toBe(MAX_ROWS);
  expect(launchSpeed(2)).toBeGreaterThan(launchSpeed(1));
  expect(launchSpeed(99)).toBe(launchSpeed(50));
  expect(brickPoints(MAX_ROWS - 1)).toBeGreaterThan(0); // the extra rows still score
});

test("missing the ball costs a life; the last one ends the game", () => {
  const miss = (lives: number) => stepBreakout(playing({ x: 20, y: H - 2, vx: 0, vy: 300 }, { lives, paddle: 300 }), 0.05);
  const g = miss(3);
  expect(g.lives).toBe(2);
  expect(g.status).toBe("serve");
  expect(g.ball.x).toBe(300); // back on the paddle
  expect(miss(1).status).toBe("over");
  expect(stepBreakout(miss(1), 1)).toEqual(miss(1)); // nothing moves after game over
});
