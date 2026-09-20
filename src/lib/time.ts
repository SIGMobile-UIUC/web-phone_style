// Time-zone-safe date helpers. The club's meetings are wall-clock times ("Wednesdays 6pm") in one IANA zone
// (America/Chicago), so a visitor in Seoul must still see 6pm Central, and DST changes must not shift them.
// Uses only Intl — no date library.

import type { DateString, TimeString, Weekday } from "../content/types";

const WEEKDAYS: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export type Ymd = { y: number; m: number; d: number };

/** Parses "YYYY-MM-DD"; throws if the format is wrong or the date doesn't exist (e.g. 2026-02-30). */
export function parseDate(s: DateString): Ymd {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!match) throw new Error(`Invalid date "${s}" (expected YYYY-MM-DD)`);
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const check = new Date(Date.UTC(y, m - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) {
    throw new Error(`Invalid date "${s}" (no such day)`);
  }
  return { y, m, d };
}

/** Parses "HH:mm" (24-hour); throws on anything else. */
export function parseTime(s: TimeString): { h: number; min: number } {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(s);
  if (!match) throw new Error(`Invalid time "${s}" (expected HH:mm, 24-hour)`);
  return { h: Number(match[1]), min: Number(match[2]) };
}

export const formatDate = ({ y, m, d }: Ymd): DateString =>
  `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/** Adds calendar days (pure calendar math, unaffected by time zones or DST). */
export function addDays(date: DateString, n: number): DateString {
  const { y, m, d } = parseDate(date);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return formatDate({ y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() });
}

export function weekdayOf(date: DateString): Weekday {
  const { y, m, d } = parseDate(date);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

const formatters = new Map<string, Intl.DateTimeFormat>();
function partsFormatter(timeZone: string) {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatters.set(timeZone, f);
  }
  return f;
}

/** Wall-clock parts of an instant in `timeZone`. */
function zonedParts(instant: Date, timeZone: string) {
  const p: Record<string, number> = {};
  for (const { type, value } of partsFormatter(timeZone).formatToParts(instant)) {
    if (type !== "literal") p[type] = Number(value);
  }
  return p as { year: number; month: number; day: number; hour: number; minute: number; second: number };
}

/** (wall-clock time in the zone) minus (UTC), in minutes, at that instant. Chicago: -300 in summer, -360 in winter. */
function offsetMinutes(instant: Date, timeZone: string): number {
  const p = zonedParts(instant, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  const truncated = Math.floor(instant.getTime() / 1000) * 1000;
  return (asUtc - truncated) / 60000;
}

/** The exact instant at which the wall clock in `timeZone` reads `date` `time`. */
export function zonedTimeToInstant(date: DateString, time: TimeString, timeZone: string): Date {
  const { y, m, d } = parseDate(date);
  const { h, min } = parseTime(time);
  const guess = Date.UTC(y, m - 1, d, h, min);
  const first = guess - offsetMinutes(new Date(guess), timeZone) * 60000;
  // If the offset differs at the first result we crossed a DST change; use the offset that applies there.
  const second = guess - offsetMinutes(new Date(first), timeZone) * 60000;
  return new Date(second);
}

/** Calendar date, time and weekday that `instant` has on the clock in `timeZone`. */
export function instantToZoned(instant: Date, timeZone: string) {
  const p = zonedParts(instant, timeZone);
  const date = formatDate({ y: p.year, m: p.month, d: p.day });
  const time = `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
  return { date, time, weekday: weekdayOf(date) };
}

export type Countdown = { days: number; hours: number; minutes: number; seconds: number };

/** Splits a duration in ms (clamped at 0) into days/hours/minutes/seconds. */
export function countdown(ms: number): Countdown {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

/** "3d 4h", "4h 12m", "12m 30s", "30s" — the two largest non-zero units. */
export function formatCountdown(ms: number): string {
  const { days, hours, minutes, seconds } = countdown(ms);
  if (days) return `${days}d ${hours}h`;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
