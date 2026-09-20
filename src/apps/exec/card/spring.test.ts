import { expect, test } from "bun:test";
import { createSpring } from "./spring";

const run = (s: ReturnType<typeof createSpring>, ticks: number) => {
  let moving = true;
  for (let i = 0; i < ticks && moving; i++) moving = s.tick(1);
  return moving;
};

test("settles exactly on the target", () => {
  const s = createSpring([0, 50], { stiffness: 0.066, damping: 0.25 });
  s.set([30, 10]);
  expect(run(s, 2000)).toBe(false);
  expect(s.value).toEqual([30, 10]);
});

test("hard set jumps immediately", () => {
  const s = createSpring([0], { stiffness: 0.066, damping: 0.25 });
  s.set([7], { hard: true });
  expect(s.value).toEqual([7]);
  expect(s.tick(1)).toBe(false);
});

test("soft set eases in slower than a normal set", () => {
  const normal = createSpring([0], { stiffness: 0.066, damping: 0.25 });
  const soft = createSpring([0], { stiffness: 0.066, damping: 0.25 });
  normal.set([100]);
  soft.set([100], { soft: true });
  normal.tick(1);
  soft.tick(1);
  expect(soft.value[0]).toBeLessThan(normal.value[0]);
});
