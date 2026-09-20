import { expect, test } from "bun:test";
import { clockParts, formatInViewerZone, formatLongDate, formatMeetingWhen, formatPlace, formatTermLabel, formatTimeRange, formatWeekdayPlural } from "./format";

const CT = "America/Chicago";

test("clock parts are 12-hour English", () => {
  expect(clockParts(new Date("2026-09-19T21:42:00Z"), CT)).toEqual({ time: "4:42", period: "PM" });
  expect(clockParts(new Date("2026-09-19T14:05:00Z"), CT)).toEqual({ time: "9:05", period: "AM" });
});

test("long date is English", () => {
  expect(formatLongDate(new Date("2026-09-19T21:42:00Z"), CT)).toBe("Saturday, September 19");
});

test("meeting time reads in Chicago time, across DST", () => {
  // 6pm CDT and 6pm CST
  const cdt = { start: new Date("2026-09-23T23:00:00Z"), end: new Date("2026-09-24T01:00:00Z") };
  const cst = { start: new Date("2026-11-05T00:00:00Z"), end: new Date("2026-11-05T02:00:00Z") };
  expect(formatMeetingWhen(cdt)).toBe("Wed, Sep 23 · 6:00–8:00 PM CT");
  expect(formatMeetingWhen(cst)).toBe("Wed, Nov 4 · 6:00–8:00 PM CT");
});

test("a range that crosses noon shows both periods", () => {
  const o = { start: new Date("2026-09-23T16:00:00Z"), end: new Date("2026-09-23T19:00:00Z") };
  expect(formatMeetingWhen(o)).toBe("Wed, Sep 23 · 11:00 AM–2:00 PM CT");
});

test("term label and place read as English", () => {
  expect(formatTermLabel({ year: 2026, semester: "fall" })).toBe("Fall 2026");
  expect(formatTermLabel({ year: 2027, semester: "spring" })).toBe("Spring 2027");
  expect(formatPlace({ name: "Location TBA" })).toBe("Location TBA");
  expect(formatPlace({ name: "Example Hall", room: "101" })).toBe("Example Hall, Room 101");
});

test("time range and weekday for the side panel", () => {
  const o = { start: new Date("2026-09-23T23:00:00Z"), end: new Date("2026-09-24T01:00:00Z") };
  expect(formatTimeRange(o)).toBe("6:00–8:00 PM CT");
  expect(formatWeekdayPlural(o.start)).toBe("Wednesdays");
});

test("the viewer's own clock is shown only when it differs from Chicago's", () => {
  const start = new Date("2026-09-23T23:00:00Z"); // Wed 6pm CDT
  expect(formatInViewerZone(start, "Asia/Seoul")).toBe("Thu, Sep 24 · 8:00 AM GMT+9");
  expect(formatInViewerZone(start, "America/Chicago")).toBeNull();
});