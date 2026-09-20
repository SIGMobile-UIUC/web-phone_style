// All user-facing date/time text is English (en-US) no matter what language the visitor's browser uses.

import { site } from "../content/site";
import type { Place, Term } from "../content/types";
import type { Occurrence } from "./schedule";

const LOCALE = "en-US";

/** "4:42" and "PM" for a phone-style clock (viewer's own time zone unless `timeZone` is given). */
export function clockParts(date: Date, timeZone?: string): { time: string; period: string } {
  const parts = new Intl.DateTimeFormat(LOCALE, { hour: "numeric", minute: "2-digit", hour12: true, timeZone }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { time: `${get("hour")}:${get("minute")}`, period: get("dayPeriod") };
}

/** "Saturday, September 19" */
export function formatLongDate(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat(LOCALE, { weekday: "long", month: "long", day: "numeric", timeZone }).format(date);
}

/** "6:00–8:00 PM CT" — in the club's time zone. */
export function formatTimeRange(o: Pick<Occurrence, "start" | "end">, timeZone: string = site.timeZone): string {
  const start = clockParts(o.start, timeZone);
  const end = clockParts(o.end, timeZone);
  const range = start.period === end.period ? `${start.time}–${end.time} ${end.period}` : `${start.time} ${start.period}–${end.time} ${end.period}`;
  return `${range} CT`;
}

/** "Wed, Sep 23 · 6:00–8:00 PM CT" — always in the club's time zone, so it reads the same everywhere. */
export function formatMeetingWhen(o: Pick<Occurrence, "start" | "end">, timeZone: string = site.timeZone): string {
  const day = new Intl.DateTimeFormat(LOCALE, { weekday: "short", month: "short", day: "numeric", timeZone }).format(o.start);
  return `${day} · ${formatTimeRange(o, timeZone)}`;
}

/** "Wednesdays" — the weekday the given moment falls on in the club's zone, pluralised. */
export const formatWeekdayPlural = (d: Date, timeZone: string = site.timeZone): string =>
  `${new Intl.DateTimeFormat(LOCALE, { weekday: "long", timeZone }).format(d)}s`;

/**
 * The same moment on the viewer's own clock, e.g. "Thu, Sep 24 · 8:00 AM GMT+9" — or null when it reads the
 * same as in the club's zone (nothing to add).
 */
export function formatInViewerZone(d: Date, viewerZone?: string, clubZone: string = site.timeZone): string | null {
  const render = (timeZone?: string) => {
    const day = new Intl.DateTimeFormat(LOCALE, { weekday: "short", month: "short", day: "numeric", timeZone }).format(d);
    const time = new Intl.DateTimeFormat(LOCALE, { hour: "numeric", minute: "2-digit", timeZoneName: "short", timeZone }).format(d);
    return { day, time, text: `${day} · ${time}` };
  };
  const mine = render(viewerZone);
  const club = render(clubZone);
  // Compare the wall-clock reading (ignoring the zone label), so equal offsets under different names don't repeat.
  return mine.day === club.day && mine.time.replace(/\s\S+$/, "") === club.time.replace(/\s\S+$/, "") ? null : mine.text;
}

/** "Fall 2026" */
export const formatTermLabel = (t: Pick<Term, "year" | "semester">): string =>
  `${t.semester === "fall" ? "Fall" : "Spring"} ${t.year}`;

/** "Location TBA" or "Siebel Center, Room 1404" */
export const formatPlace = (p: Place): string => (p.room ? `${p.name}, Room ${p.room}` : p.name);

/** "Wednesday, September 23" for a calendar date ("YYYY-MM-DD"), independent of any time zone. */
export const formatDateLabel = (date: string): string =>
  new Intl.DateTimeFormat(LOCALE, { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));

export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
