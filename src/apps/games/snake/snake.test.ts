import { expect, test } from "bun:test";
import { newSnake, placeFood, step, stepMs, turn, type Snake } from "./snake";

const snake = (over: Partial<Snake>): Snake => ({ size: 8, body: [{ x: 3, y: 3 }, { x: 2, y: 3 }, { x: 1, y: 3 }], dir: "right", queued: [], food: { x: 7, y: 7 }, score: 0, over: false, ...over });

test("a new snake is 3 long, heading right, with food off its body", () => {
  const s = newSnake(16, () => 0);
  expect(s.body).toEqual([{ x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }]);
  expect(s.dir).toBe("right");
  expect(s.food).toEqual({ x: 0, y: 0 });
});

test("it moves one cell per step, keeping its length", () => {
  const s = step(snake({}));
  expect(s.body).toEqual([{ x: 4, y: 3 }, { x: 3, y: 3 }, { x: 2, y: 3 }]);
});

test("turns are queued, applied one per step, and it can't reverse into itself", () => {
  let s = turn(snake({}), "left"); // straight back: ignored
  expect(s.queued).toEqual([]);
  s = turn(turn(s, "up"), "left"); // up, then left: both kept
  expect(s.queued).toEqual(["up", "left"]);
  s = step(s);
  expect(s.body[0]).toEqual({ x: 3, y: 2 });
  s = step(s);
  expect(s.body[0]).toEqual({ x: 2, y: 2 });
  expect(s.dir).toBe("left");
});

test("eating grows the snake, scores, and puts new food on a free cell", () => {
  const s = step(snake({ food: { x: 4, y: 3 } }), () => 0);
  expect(s.body).toHaveLength(4);
  expect(s.score).toBe(1);
  expect(s.food).toEqual({ x: 0, y: 0 });
});

test("hitting a wall or its own body ends the game", () => {
  expect(step(snake({ body: [{ x: 7, y: 3 }, { x: 6, y: 3 }] })).over).toBe(true);
  expect(step(snake({ body: [{ x: 3, y: 0 }, { x: 3, y: 1 }], dir: "up" })).over).toBe(true);
  // A loop: head at (2,2) moving down into (2,3), which is part of the body.
  const loop = [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 2, y: 3 }, { x: 1, y: 3 }];
  expect(step(snake({ body: loop, dir: "down" })).over).toBe(true);
});

test("moving into the cell the tail is leaving is allowed", () => {
  const square = [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 2, y: 3 }];
  const s = step(snake({ body: square, dir: "down" }));
  expect(s.over).toBe(false);
  expect(s.body[0]).toEqual({ x: 2, y: 3 });
});

test("food goes only on free cells, and the game ends when the board is full", () => {
  const body = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }];
  expect(placeFood(2, body, () => 0)).toEqual({ x: 0, y: 1 });
  expect(placeFood(2, [...body, { x: 0, y: 1 }])).toBeNull();
  const full = step({ size: 2, body, dir: "left", queued: ["down"], food: { x: 0, y: 1 }, score: 0, over: false });
  expect(full.over).toBe(true);
  expect(full.score).toBe(1);
});

test("the snake speeds up as it grows, down to a floor", () => {
  expect(stepMs(0)).toBe(150);
  expect(stepMs(10)).toBe(110);
  expect(stepMs(100)).toBe(65);
});
