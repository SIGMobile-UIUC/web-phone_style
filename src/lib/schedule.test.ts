import { expect, test } from "bun:test";
import { terms } from "../content/terms";
import type { Term } from "../content/types";
import { eventMoment, meetingsOf, nextMeeting, upcomingEvents } from "./schedule";

const place = { name: "Room A" };
const base = (over: Partial<Term>): Term => ({
  id: "2030-fall",
  year: 2030,
  semester: "fall",
  start: "2030-09-02",
  end: "2030-09-30",
  meetings: [{ weekday: "wed", start: "18:00", end: "20:00", place }],
  events: [],
  projects: [],
  members: [],
  ...over,
});

test("Fall 2026: 11 Wednesday meetings, 9/23 through 12/2, with DST handled", () => {
  const list = meetingsOf(terms[0]);
  expect(list).toHaveLength(11);
  expect(list[0].date).toBe("2026-09-23");
  expect(list[0].start.toISOString()).toBe("2026-09-23T23:00:00.000Z"); // 6pm CDT
  expect(list.find((m) => m.date === "2026-11-04")!.start.toISOString()).toBe("2026-11-05T00:00:00.000Z"); // 6pm CST
  expect(list.at(-1)!.date).toBe("2026-12-02");
  expect(list.at(-1)!.end.toISOString()).toBe("2026-12-03T02:00:00.000Z"); // 8pm CST
});

test("nextMeeting: upcoming, live, then the following week, then none", () => {
  expect(nextMeeting(terms, new Date("2026-09-19T12:00:00Z"))).toMatchObject({ state: "upcoming", occurrence: { date: "2026-09-23" } });
  expect(nextMeeting(terms, new Date("2026-09-23T23:30:00Z"))).toMatchObject({ state: "live", occurrence: { date: "2026-09-23" } });
  expect(nextMeeting(terms, new Date("2026-09-24T01:00:00Z"))).toMatchObject({ state: "upcoming", occurrence: { date: "2026-09-30" } });
  expect(nextMeeting(terms, new Date("2026-12-03T02:00:00Z"))).toBeNull();
});

test("exceptions: cancel a day, or move just that day", () => {
  const t = base({
    meetingExceptions: [
      { date: "2030-09-11", cancelled: true },
      { date: "2030-09-18", start: "17:00", end: "19:00", note: "Earlier" },
    ],
  });
  const list = meetingsOf(t);
  expect(list.map((m) => m.date)).toEqual(["2030-09-04", "2030-09-18", "2030-09-25"]);
  expect(list[1]).toMatchObject({ note: "Earlier" });
  expect(list[1].start.toISOString()).toBe("2030-09-18T22:00:00.000Z"); // 5pm CDT
});

test("a rule with a later `from` replaces the schedule from that date", () => {
  const t = base({
    meetings: [
      { weekday: "wed", start: "18:00", end: "20:00", place },
      { from: "2030-09-16", weekday: "thu", start: "17:00", end: "19:00", place },
    ],
  });
  expect(meetingsOf(t).map((m) => m.date)).toEqual(["2030-09-04", "2030-09-11", "2030-09-19", "2030-09-26"]);
});

test("two rules with the same `from` give two meetings a week", () => {
  const t = base({
    meetings: [
      { weekday: "mon", start: "18:00", end: "19:00", place },
      { weekday: "wed", start: "18:00", end: "20:00", place },
    ],
    end: "2030-09-08",
  });
  expect(meetingsOf(t).map((m) => m.date)).toEqual(["2030-09-02", "2030-09-04"]);
});

test("event moments: the meeting's start on meeting days, midnight (Chicago) otherwise", () => {
  const term = terms[0];
  const at = (title: string) => eventMoment(term, term.events.find((e) => e.title === title)!).toISOString();
  expect(at("Project Showcase")).toBe("2026-11-19T00:00:00.000Z"); // Wed 11/18, 6pm CST
  expect(at("Creating project groups")).toBe("2026-09-14T05:00:00.000Z"); // Mon 9/14, no meeting: 00:00 CDT
});

test("upcomingEvents gives the next showcase and deploy, soonest first, skipping the past", () => {
  const list = upcomingEvents(terms, new Date("2026-10-01T00:00:00Z"), ["deploy", "showcase"]);
  expect(list.map((e) => e.event.kind)).toEqual(["showcase", "deploy"]);
  expect(upcomingEvents(terms, new Date("2026-11-20T00:00:00Z"), ["deploy", "showcase"]).map((e) => e.event.kind)).toEqual(["deploy"]);
  expect(upcomingEvents(terms, new Date("2027-01-01T00:00:00Z"), ["deploy", "showcase"])).toEqual([]);
});