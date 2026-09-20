// Guards for hand-edited content. If one of these fails, the message says which file/entry to fix.
// See docs/HANDOVER.md for the editing recipes.

import { expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import path from "node:path";
import { meetingsOf } from "../lib/schedule";
import { parseDate, parseTime } from "../lib/time";
import { isTba } from "./places";
import { site } from "./site";
import { byNewest, terms } from "./terms";

const isHttps = (u: string) => u.startsWith("https://");

test("byNewest: later year first, fall before spring", () => {
  const list = [
    { year: 2025, semester: "fall" },
    { year: 2026, semester: "spring" },
    { year: 2026, semester: "fall" },
    { year: 2025, semester: "spring" },
  ] as const;
  expect([...list].sort(byNewest).map((t) => `${t.year}-${t.semester}`)).toEqual([
    "2026-fall",
    "2026-spring",
    "2025-fall",
    "2025-spring",
  ]);
});

test("every term file in src/content/terms is registered in index.ts (and vice versa)", () => {
  const dir = path.join(import.meta.dir, "terms");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".ts") && f !== "index.ts" && !f.startsWith("_"))
    .map((f) => f.replace(/\.ts$/, ""))
    .sort();
  expect(terms.map((t) => t.id).sort()).toEqual(files);
});

test("term ids match '<year>-<semester>' and are unique", () => {
  const ids = terms.map((t) => t.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const t of terms) expect(t.id).toBe(`${t.year}-${t.semester}`);
});

for (const term of terms) {
  test(`${term.id}: dates, meetings and events are valid`, () => {
    parseDate(term.start);
    parseDate(term.end);
    expect(term.start <= term.end).toBe(true);

    for (const rule of term.meetings) {
      const start = parseTime(rule.start);
      const end = parseTime(rule.end);
      expect(end.h * 60 + end.min).toBeGreaterThan(start.h * 60 + start.min);
      if (rule.from) {
        parseDate(rule.from);
        expect(rule.from >= term.start && rule.from <= term.end).toBe(true);
      }
      expect(rule.place.name.trim()).not.toBe("");
      if (rule.place.mapsUrl) expect(isHttps(rule.place.mapsUrl)).toBe(true);
    }

    // Exceptions must point at a real meeting day (catches typos in dates).
    const meetingDates = new Set(meetingsOf(term).map((m) => m.date));
    const cancelled = new Set((term.meetingExceptions ?? []).filter((e) => e.cancelled).map((e) => e.date));
    for (const ex of term.meetingExceptions ?? []) {
      parseDate(ex.date);
      if (ex.start) parseTime(ex.start);
      if (ex.end) parseTime(ex.end);
      if (!cancelled.has(ex.date)) {
        expect(meetingDates.has(ex.date), `exception ${ex.date} is not on a meeting day`).toBe(true);
      }
    }

    for (const ev of term.events) {
      parseDate(ev.date);
      expect(ev.date >= term.start && ev.date <= term.end, `event "${ev.title}" is outside the term`).toBe(true);
      expect(ev.title.trim()).not.toBe("");
    }
  });

  test(`${term.id}: members and projects are well-formed`, () => {
    const ids = term.members.map((m) => m.id);
    expect(new Set(ids).size, "duplicate member id").toBe(ids.length);
    for (const m of term.members) {
      expect(m.id, `member id "${m.id}" must be a lowercase slug`).toMatch(/^[a-z0-9-]+$/);
      expect(m.name.trim()).not.toBe("");
      expect(m.role.trim()).not.toBe("");
      expect(m.standing.trim()).not.toBe("");
      if (m.email) expect(m.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
      if (m.photo) expect(m.photo.length).toBeGreaterThan(0);
    }
    for (const p of term.projects) {
      expect(p.stack.length).toBeGreaterThan(0);
      if (p.repoUrl) expect(isHttps(p.repoUrl)).toBe(true);
    }
  });
}

test("a member id always refers to the same person across terms", () => {
  const names = new Map<string, string>();
  for (const t of terms) {
    for (const m of t.members) {
      const seen = names.get(m.id);
      expect(seen === undefined || seen === m.name, `id "${m.id}" is used for both "${seen}" and "${m.name}"`).toBe(true);
      names.set(m.id, m.name);
    }
  }
});

test("site links are https", () => {
  for (const url of Object.values(site.links)) expect(isHttps(url)).toBe(true);
});

test("heads-up: the newest term's meeting place is still TBA", () => {
  const stillTba = terms[0].meetings.some((r) => isTba(r.place));
  if (stillTba) console.warn(`[content] ${terms[0].id}: meeting place is TBA — set it in the term file when decided.`);
  expect(true).toBe(true);
});
