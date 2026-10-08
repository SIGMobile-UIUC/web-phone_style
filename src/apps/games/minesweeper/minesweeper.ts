// Minesweeper rules, free of React. Cells are stored row by row. Mines are laid on the first reveal, away from the
// tapped cell and its neighbours, so the first tap always opens an area.

export type Rand = () => number;

export type Cell = { mine: boolean; open: boolean; flagged: boolean; /** Mines in the 8 neighbours. */ near: number };

export type Minefield = {
  w: number;
  h: number;
  mines: number;
  cells: Cell[];
  status: "ready" | "playing" | "won" | "lost";
  /** The mine that was stepped on. */
  exploded: number | null;
};

export function newField(w = 9, h = 9, mines = 10): Minefield {
  const cells = Array.from({ length: w * h }, () => ({ mine: false, open: false, flagged: false, near: 0 }));
  return { w, h, mines, cells, status: "ready", exploded: null };
}

export function neighbours(f: Pick<Minefield, "w" | "h">, i: number): number[] {
  const x = i % f.w;
  const y = Math.floor(i / f.w);
  const out: number[] = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if ((dx || dy) && nx >= 0 && ny >= 0 && nx < f.w && ny < f.h) out.push(ny * f.w + nx);
    }
  return out;
}

/** Lays the mines, keeping `safe` and its neighbours clear (when the board is big enough to allow it). */
export function layMines(f: Minefield, safe: number, rand: Rand = Math.random): Minefield {
  const keepClear = new Set([safe, ...neighbours(f, safe)]);
  let spots = f.cells.map((_, i) => i).filter((i) => !keepClear.has(i));
  if (spots.length < f.mines) spots = f.cells.map((_, i) => i).filter((i) => i !== safe);
  // Partial Fisher–Yates shuffle: the first `count` spots become mines.
  const count = Math.min(f.mines, spots.length);
  for (let k = 0; k < count; k++) {
    const j = k + Math.floor(rand() * (spots.length - k));
    [spots[k], spots[j]] = [spots[j], spots[k]];
  }
  const mines = new Set(spots.slice(0, count));
  const cells = f.cells.map((c, i) => ({ ...c, mine: mines.has(i) }));
  cells.forEach((c, i) => (c.near = neighbours(f, i).filter((n) => cells[n].mine).length));
  return { ...f, cells, status: "playing" };
}

const finish = (f: Minefield): Minefield => {
  const cleared = f.cells.every((c) => c.mine || c.open);
  if (!cleared) return f;
  // Won: flag the remaining mines, as the classic game does.
  return { ...f, status: "won", cells: f.cells.map((c) => (c.mine ? { ...c, flagged: true } : c)) };
};

/** Opens a cell. A 0 opens its whole empty area; a mine loses the game and shows every mine. */
export function reveal(f: Minefield, i: number, rand: Rand = Math.random): Minefield {
  if (f.status === "won" || f.status === "lost") return f;
  if (f.status === "ready") f = layMines(f, i, rand);
  if (f.cells[i].open || f.cells[i].flagged) return f;

  const cells = f.cells.map((c) => ({ ...c }));
  if (cells[i].mine) {
    cells.forEach((c) => c.mine && !c.flagged && (c.open = true));
    return { ...f, cells, status: "lost", exploded: i };
  }
  const todo = [i];
  while (todo.length) {
    const j = todo.pop()!;
    if (cells[j].open || cells[j].flagged) continue;
    cells[j].open = true;
    if (cells[j].near === 0) todo.push(...neighbours(f, j));
  }
  return finish({ ...f, cells });
}

/** Tapping an open number whose mines are all flagged opens the rest of its neighbours ("chording"). */
export function chord(f: Minefield, i: number): Minefield {
  const c = f.cells[i];
  if (f.status !== "playing" || !c.open || c.near === 0) return f;
  const around = neighbours(f, i);
  if (around.filter((n) => f.cells[n].flagged).length !== c.near) return f;
  return around.reduce((g, n) => (g.cells[n].open || g.cells[n].flagged ? g : reveal(g, n)), f);
}

export function toggleFlag(f: Minefield, i: number): Minefield {
  if (f.status === "won" || f.status === "lost" || f.cells[i].open) return f;
  const cells = f.cells.map((c, j) => (j === i ? { ...c, flagged: !c.flagged } : c));
  return { ...f, cells };
}

export const flagsLeft = (f: Minefield) => f.mines - f.cells.filter((c) => c.flagged).length;
