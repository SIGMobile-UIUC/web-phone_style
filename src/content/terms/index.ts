// Registry of all semesters. To add one: import its file and add it to `all` (order doesn't matter —
// `terms` is sorted newest first automatically). A test fails if a term file exists but isn't listed here.

import type { Term } from "../types";
import fall2026 from "./2026-fall";

const all: Term[] = [fall2026];

/** Newest first: later year first, and fall before spring within a year. */
export const byNewest = (a: Pick<Term, "year" | "semester">, b: Pick<Term, "year" | "semester">) =>
  b.year - a.year || (a.semester === b.semester ? 0 : a.semester === "fall" ? -1 : 1);

export const terms: Term[] = [...all].sort(byNewest);

export const getTerm = (id: string): Term | undefined => terms.find((t) => t.id === id);
