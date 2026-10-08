// 2048 rules, free of React: a 4×4 board as 16 numbers (row by row, 0 = empty).

import type { Dir } from "../shared";

export const SIZE = 4;
export const GOAL = 2048;

export type Board = number[];
export type Rand = () => number;

export type MoveResult = {
  board: Board;
  /** Points scored: the sum of the merged tiles. */
  gained: number;
  /** False if nothing slid or merged (then no new tile appears). */
  moved: boolean;
  /** Board indices of tiles that are the result of a merge. */
  merged: number[];
};

/** Slides one line toward its start, merging equal neighbours (each tile merges at most once per move). */
export function slideLine(line: readonly number[]): { line: number[]; gained: number; merged: number[] } {
  const tiles = line.filter((v) => v !== 0);
  const out: number[] = [];
  const merged: number[] = [];
  let gained = 0;
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === tiles[i + 1]) {
      out.push(tiles[i] * 2);
      gained += tiles[i] * 2;
      merged.push(out.length - 1);
      i++;
    } else {
      out.push(tiles[i]);
    }
  }
  while (out.length < line.length) out.push(0);
  return { line: out, gained, merged };
}

/** The board indices of line `k`, starting at the edge the tiles move toward. */
function lineIndices(dir: Dir, k: number): number[] {
  const steps = Array.from({ length: SIZE }, (_, i) => i);
  switch (dir) {
    case "left":
      return steps.map((i) => k * SIZE + i);
    case "right":
      return steps.map((i) => k * SIZE + (SIZE - 1 - i));
    case "up":
      return steps.map((i) => i * SIZE + k);
    case "down":
      return steps.map((i) => (SIZE - 1 - i) * SIZE + k);
  }
}

export function move(board: Board, dir: Dir): MoveResult {
  const next = [...board];
  const merged: number[] = [];
  let gained = 0;
  for (let k = 0; k < SIZE; k++) {
    const idx = lineIndices(dir, k);
    const r = slideLine(idx.map((i) => board[i]));
    idx.forEach((i, j) => (next[i] = r.line[j]));
    merged.push(...r.merged.map((j) => idx[j]));
    gained += r.gained;
  }
  return { board: next, gained, moved: next.some((v, i) => v !== board[i]), merged };
}

export const emptyCells = (board: Board) => board.flatMap((v, i) => (v === 0 ? [i] : []));

/** Puts a 2 (90%) or a 4 on a random empty cell. Returns null if the board is full. */
export function addTile(board: Board, rand: Rand = Math.random): { board: Board; index: number } | null {
  const empty = emptyCells(board);
  if (empty.length === 0) return null;
  const index = empty[Math.floor(rand() * empty.length)];
  const next = [...board];
  next[index] = rand() < 0.9 ? 2 : 4;
  return { board: next, index };
}

/** Any empty cell, or two equal neighbours, means there is still a move. */
export function canMove(board: Board): boolean {
  return board.some((v, i) => {
    if (v === 0) return true;
    const right = i % SIZE < SIZE - 1 ? board[i + 1] : -1;
    const below = i + SIZE < board.length ? board[i + SIZE] : -1;
    return v === right || v === below;
  });
}

export function newBoard(rand: Rand = Math.random): { board: Board; fresh: number[] } {
  const first = addTile(Array(SIZE * SIZE).fill(0), rand)!;
  const second = addTile(first.board, rand)!;
  return { board: second.board, fresh: [first.index, second.index] };
}
