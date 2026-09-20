import { expect, test } from "bun:test";
import { terms } from "../content/terms";
import { addMonths, agendaByDate, monthGrid, monthOf, todayInClubZone } from "./calendar";

test("September 2026 grid: Sunday-first, 5 weeks, starts Aug 30 and ends Oct 3", () => {
  const grid = monthGrid({ y: 2026, m: 9 });
  expect(grid).toHaveLength(5);
  expect(grid.every((w) => w.length === 7)).toBe(true);
  expect(grid[0][0]).toEqual({ date: "2026-08-30", inMonth: false });
  expect(grid[0][2]).toEqual({ date: "2026-09-01", inMonth: true }); // a Tuesday
  expect(grid.at(-1)!.at(-1)).toEqual({ date: "2026-10-03", inMonth: false });
  expect(grid.flat().filter((d) => d.inMonth)).toHaveLength(30);
});

test("month with 6 weeks, and leap-year February", () => {
  expect(monthGrid({ y: 2026, m: 8 })).toHaveLength(6); // Aug 2026 starts on a Saturday
  expect(monthGrid({ y: 2028, m: 2 }).flat().filter((d) => d.inMonth)).toHaveLength(29);
  expect(monthGrid({ y: 2026, m: 2 })).toHaveLength(4); // Feb 2026 starts on a Sunday and has 28 days
});

test("addMonths wraps across years", () => {
  expect(addMonths({ y: 2026, m: 12 }, 1)).toEqual({ y: 2027, m: 1 });
  expect(addMonths({ y: 2026, m: 1 }, -1)).toEqual({ y: 2025, m: 12 });
  expect(addMonths({ y: 2026, m: 9 }, 0)).toEqual({ y: 2026, m: 9 });
  expect(monthOf("2026-11-18")).toEqual({ y: 2026, m: 11 });
});

test("agenda: events first, then the meeting", () => {
  const agenda = agendaByDate(terms);
  const showcase = agenda.get("2026-11-18")!;
  expect(showcase.map((i) => i.kind)).toEqual(["showcase", "meeting"]);
  expect(agenda.get("2026-09-23")!.at(-1)!.kind).toBe("meeting");
  expect(agenda.get("2026-09-14")!.map((i) => i.kind)).toEqual(["milestone"]); // week 1 is a Monday: no weekly meeting
  expect(agenda.get("2026-09-16")).toBeUndefined();
});

test("today is the date on the club's clock", () => {
  // 8am Thursday in Seoul is still Wednesday evening in Chicago
  expect(todayInClubZone(new Date("2026-09-23T23:30:00Z"))).toBe("2026-09-23");
  expect(todayInClubZone(new Date("2026-09-24T05:30:00Z"))).toBe("2026-09-24");
});
