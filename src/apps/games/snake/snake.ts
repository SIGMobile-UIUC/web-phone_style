// Snake rules, free of React. The board is `size`×`size` cells; the snake is a list of cells, head first.

import type { Dir } from "../shared";

export type Point = { x: number; y: number };
export type Rand = () => number;

export type Snake = {
  size: number;
  body: Point[];
  dir: Dir;
  /** Turns pressed since the last step, applied one per step (so two quick turns aren't lost). */
  queued: Dir[];
  food: Point | null;
  score: number;
  over: boolean;
};

const DELTA: Record<Dir, Point> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
const OPPOSITE: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };

const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y;

/** A random free cell for the food, or null if the snake fills the board. */
export function placeFood(size: number, body: readonly Point[], rand: Rand = Math.random): Point | null {
  const free: Point[] = [];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!body.some((p) => p.x === x && p.y === y)) free.push({ x, y });
  return free.length ? free[Math.floor(rand() * free.length)] : null;
}

/** A 3-long snake in the middle of the board, heading right. */
export function newSnake(size = 16, rand: Rand = Math.random): Snake {
  const y = Math.floor(size / 2);
  const x = Math.floor(size / 3);
  const body = [{ x, y }, { x: x - 1, y }, { x: x - 2, y }];
  return { size, body, dir: "right", queued: [], food: placeFood(size, body, rand), score: 0, over: false };
}

/** Queues a turn. Reversing into yourself or repeating the current heading is ignored. */
export function turn(s: Snake, dir: Dir): Snake {
  const last = s.queued.at(-1) ?? s.dir;
  if (dir === last || dir === OPPOSITE[last] || s.queued.length >= 2) return s;
  return { ...s, queued: [...s.queued, dir] };
}

/** Moves one cell. Hitting a wall or the body ends the game; eating grows the snake by one and scores a point. */
export function step(s: Snake, rand: Rand = Math.random): Snake {
  if (s.over) return s;
  const [dir = s.dir, ...queued] = s.queued;
  const head = { x: s.body[0].x + DELTA[dir].x, y: s.body[0].y + DELTA[dir].y };
  const eats = s.food !== null && same(head, s.food);
  // The tail moves out of the way this step unless the snake is growing, so the head may enter its cell.
  const body = eats ? s.body : s.body.slice(0, -1);
  const outside = head.x < 0 || head.y < 0 || head.x >= s.size || head.y >= s.size;
  if (outside || body.some((p) => same(p, head))) return { ...s, dir, queued, over: true };

  const next = [head, ...body];
  if (!eats) return { ...s, body: next, dir, queued };
  const food = placeFood(s.size, next, rand);
  return { ...s, body: next, dir, queued, food, score: s.score + 1, over: food === null };
}

/** Milliseconds between steps: starts relaxed and speeds up as the snake grows. */
export const stepMs = (score: number) => Math.max(65, 150 - score * 4);
