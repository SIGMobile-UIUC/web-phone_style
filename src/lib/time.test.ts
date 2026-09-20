import { expect, test } from "bun:test";
import { addDays, countdown, formatCountdown, instantToZoned, parseDate, weekdayOf, zonedTimeToInstant } from "./time";

const CT = "America/Chicago";
const at = (date: string, time: string) => zonedTimeToInstant(date, time, CT).toISOString();

test("parseDate rejects malformed and non-existent dates", () => {
  expect(() => parseDate("2026-9-1")).toThrow();
  expect(() => parseDate("2026-02-30")).toThrow();
  expect(() => parseDate("2026-13-01")).toThrow();
  expect(parseDate("2026-09-23")).toEqual({ y: 2026, m: 9, d: 23 });
});

test("weekday and day arithmetic are calendar-based", () => {
  expect(weekdayOf("2026-09-14")).toBe("mon");
  expect(weekdayOf("2026-09-23")).toBe("wed");
  expect(addDays("2026-11-01", 1)).toBe("2026-11-02"); // across the DST change, still one calendar day
  expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
});

test("6pm Central is UTC-5 in CDT and UTC-6 in CST (DST ends 2026-11-01)", () => {
  expect(at("2026-10-28", "18:00")).toBe("2026-10-28T23:00:00.000Z"); // CDT
  expect(at("2026-11-04", "18:00")).toBe("2026-11-05T00:00:00.000Z"); // CST
  expect(at("2026-12-02", "18:00")).toBe("2026-12-03T00:00:00.000Z"); // CST
  expect(at("2027-03-10", "18:00")).toBe("2027-03-11T00:00:00.000Z"); // CST, before DST starts 2027-03-14
  expect(at("2027-03-17", "18:00")).toBe("2027-03-17T23:00:00.000Z"); // CDT
});

test("works for other zones too", () => {
  expect(zonedTimeToInstant("2026-09-23", "18:00", "Asia/Seoul").toISOString()).toBe("2026-09-23T09:00:00.000Z");
});

test("instantToZoned is the inverse", () => {
  expect(instantToZoned(new Date("2026-11-05T00:00:00Z"), CT)).toEqual({ date: "2026-11-04", time: "18:00", weekday: "wed" });
  expect(instantToZoned(new Date("2026-09-23T23:00:00Z"), CT)).toEqual({ date: "2026-09-23", time: "18:00", weekday: "wed" });
});

test("countdown splits and formats durations", () => {
  const ms = ((3 * 24 + 4) * 3600 + 12 * 60 + 30) * 1000;
  expect(countdown(ms)).toEqual({ days: 3, hours: 4, minutes: 12, seconds: 30 });
  expect(formatCountdown(ms)).toBe("3d 4h");
  expect(formatCountdown(4 * 3600_000 + 12 * 60_000)).toBe("4h 12m");
  expect(formatCountdown(12 * 60_000 + 30_000)).toBe("12m 30s");
  expect(formatCountdown(-5)).toBe("0s");
});
