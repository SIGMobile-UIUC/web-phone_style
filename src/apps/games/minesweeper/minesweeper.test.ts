import { expect, test } from "bun:test";
import { chord, flagsLeft, layMines, LEVELS, neighbours, newField, reveal, toggleFlag, type Minefield } from "./minesweeper";

/** A field with mines exactly where the map has "*" (rows of equal length), already in play. */
function field(map: string[]): Minefield {
  const w = map[0].length;
  const f = newField(w, map.length, 0);
  const mines = map.join("").split("").flatMap((ch, i) => (ch === "*" ? [i] : []));
  const cells = f.cells.map((c, i) => ({ ...c, mine: mines.includes(i) }));
  cells.forEach((c, i) => (c.near = neighbours(f, i).filter((n) => cells[n].mine).length));
  return { ...f, mines: mines.length, cells, status: "playing" };
}
const opened = (f: Minefield) => f.cells.flatMap((c, i) => (c.open ? [i] : []));

test("every level leaves room to keep the first tap's area clear, and each is denser than the last", () => {
  const density = Object.values(LEVELS).map((l) => {
    expect(l.mines).toBeLessThanOrEqual(l.w * l.h - 9);
    return l.mines / (l.w * l.h);
  });
  expect(density).toEqual([...density].sort((a, b) => a - b));
});

test("neighbours stay on the board", () => {
  const f = { w: 3, h: 3 };
  expect(neighbours(f, 0)).toEqual([1, 3, 4]);
  expect(neighbours(f, 4)).toHaveLength(8);
  expect(neighbours(f, 5)).toEqual([1, 2, 4, 7, 8]); // no wrap to the next row
});

test("the first tap is always safe and opens an area", () => {
  for (const r of [0, 0.37, 0.999]) {
    const f = reveal(newField(9, 9, 10), 40, () => r);
    expect(f.status).not.toBe("lost"); // (with r = 0 the mines all land in the top rows and one tap wins)
    expect(f.cells.filter((c) => c.mine)).toHaveLength(10);
    for (const i of [40, ...neighbours(f, 40)]) expect(f.cells[i].mine).toBe(false);
    expect(f.cells[40].near).toBe(0);
    expect(opened(f).length).toBeGreaterThan(1);
  }
  // A board too small to keep the neighbours clear still keeps the tapped cell clear.
  const tiny = layMines(newField(2, 2, 3), 0, () => 0);
  expect(tiny.cells.map((c) => c.mine)).toEqual([false, true, true, true]);
});

test("opening a 0 opens its whole empty area and its numbered border", () => {
  const f = reveal(field(["....", "....", "...*", "...."]), 0);
  // Everything except the mine and the cells around it that only border the mine.
  expect(opened(f)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14]);
  expect(f.cells[7].near).toBe(1);
  expect(f.status).toBe("playing");
});

test("stepping on a mine loses and shows every unflagged mine", () => {
  let f = field(["*..", "...", "..*"]);
  f = toggleFlag(f, 8);
  f = reveal(f, 0);
  expect(f.status).toBe("lost");
  expect(f.exploded).toBe(0);
  expect(f.cells[0].open).toBe(true);
  expect(f.cells[8].open).toBe(false); // it was flagged
  expect(reveal(f, 4)).toBe(f); // nothing more happens
});

test("opening every safe cell wins and flags the mines", () => {
  let f = field(["*.", ".."]);
  for (const i of [1, 2, 3]) f = reveal(f, i);
  expect(f.status).toBe("won");
  expect(f.cells[0].flagged).toBe(true);
  expect(flagsLeft(f)).toBe(0);
});

test("flags: toggled on closed cells only, protect from reveal, and count down", () => {
  let f = field(["*..", "...", "..."]);
  f = toggleFlag(f, 0);
  expect(flagsLeft(f)).toBe(0);
  expect(reveal(f, 0).status).toBe("playing");
  f = toggleFlag(f, 0);
  expect(flagsLeft(f)).toBe(1);
  f = reveal(f, 1);
  expect(toggleFlag(f, 1)).toBe(f); // open cells can't be flagged
});

test("chording on a satisfied number opens its other neighbours", () => {
  let f = field(["*..", "...", "..."]);
  f = reveal(f, 4); // a 1
  expect(chord(f, 4)).toBe(f); // no flag yet: nothing happens
  f = chord(toggleFlag(f, 0), 4);
  expect(f.status).toBe("won");

  // A wrong flag makes the chord open the real mine.
  let g = field(["*..", "...", "..."]);
  g = chord(toggleFlag(reveal(g, 4), 1), 4);
  expect(g.status).toBe("lost");
});
