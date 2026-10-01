import { expect, test } from "bun:test";
import { addTile, canMove, move, newBoard, slideLine } from "./game2048";

/** A fixed sequence of "random" numbers. */
const seq = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

test("a line slides toward its start and equal neighbours merge once", () => {
  expect(slideLine([0, 2, 0, 2]).line).toEqual([4, 0, 0, 0]);
  expect(slideLine([2, 2, 2, 2]).line).toEqual([4, 4, 0, 0]);
  expect(slideLine([4, 4, 8, 0]).line).toEqual([8, 8, 0, 0]); // the new 8 does not merge again
  expect(slideLine([2, 2, 2, 0]).line).toEqual([4, 2, 0, 0]); // the pair nearest the edge merges first
  expect(slideLine([2, 4, 8, 16]).line).toEqual([2, 4, 8, 16]);
  expect(slideLine([2, 2, 4, 4])).toEqual({ line: [4, 8, 0, 0], gained: 12, merged: [0, 1] });
});

test("moves in all four directions", () => {
  // prettier-ignore
  const board = [
    2, 0, 0, 2,
    0, 4, 0, 0,
    0, 4, 0, 0,
    8, 0, 0, 0,
  ];
  expect(move(board, "left").board.slice(0, 4)).toEqual([4, 0, 0, 0]);
  expect(move(board, "right").board.slice(0, 4)).toEqual([0, 0, 0, 4]);
  const up = move(board, "up");
  expect([up.board[0], up.board[4], up.board[1], up.board[5]]).toEqual([2, 8, 8, 0]);
  expect(up.merged).toEqual([1]);
  expect(up.gained).toBe(8);
  const down = move(board, "down");
  expect([down.board[13], down.board[9], down.board[12], down.board[8]]).toEqual([8, 0, 8, 2]);
});

test("a move that changes nothing is not a move", () => {
  const board = [2, 4, 8, 16, ...Array(12).fill(0)];
  expect(move(board, "left").moved).toBe(false);
  expect(move(board, "up").moved).toBe(false);
  expect(move(board, "down").moved).toBe(true);
});

test("new tiles go on empty cells: usually a 2, sometimes a 4", () => {
  const board = [2, 0, 2, 2, ...Array(12).fill(2)];
  expect(addTile(board, seq(0, 0.5))).toEqual({ board: [2, 2, ...board.slice(2)], index: 1 });
  expect(addTile(board, seq(0, 0.95))?.board[1]).toBe(4);
  expect(addTile(Array(16).fill(2), seq(0))).toBeNull();

  const { board: start, fresh } = newBoard(seq(0, 0));
  expect(start.filter((v) => v !== 0)).toEqual([2, 2]);
  expect(fresh).toEqual([0, 1]);
});

test("the game is over when the board is full and no neighbours match", () => {
  // prettier-ignore
  const stuck = [
    2, 4, 2, 4,
    4, 2, 4, 2,
    2, 4, 2, 4,
    4, 2, 4, 2,
  ];
  expect(canMove(stuck)).toBe(false);
  expect(canMove(stuck.map((v, i) => (i === 15 ? 4 : v)))).toBe(true); // 4 next to 4 at the bottom right
  expect(canMove(stuck.map((v, i) => (i === 3 ? 0 : v)))).toBe(true);
  // A match that wraps around the edge of a row is not a neighbour.
  expect(canMove([2, 4, 2, 8, 8, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2])).toBe(false);
});
