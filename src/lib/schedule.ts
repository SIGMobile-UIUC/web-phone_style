// Turns a term's meeting rules + exceptions into concrete meetings, and finds the next one.
// Used by Calendar, Clock, the home widget, the Dynamic Island and the desktop side panel.

import { site } from "../content/site";
import type { CalendarEvent, DateString, EventKind, MeetingRule, Place, Term } from "../content/types";
import { addDays, weekdayOf, zonedTimeToInstant } from "./time";

export type Occurrence = {
  termId: string;
  date: DateString;
  start: Date;
  end: Date;
  place: Place;
  note?: string;
};

/**
 * Every meeting in a term, in order.
 *
 * Rules: on a given date, only the rules with the LATEST `from` (<= that date) are active — so adding a rule
 * with a later `from` replaces the earlier schedule from that day on. Exceptions then cancel or tweak a day.
 */
export function meetingsOf(term: Term, timeZone: string = site.timeZone): Occurrence[] {
  const fromOf = (r: MeetingRule) => r.from ?? term.start;
  const exceptions = new Map((term.meetingExceptions ?? []).map((e) => [e.date, e]));
  const out: Occurrence[] = [];

  for (let date = term.start; date <= term.end; date = addDays(date, 1)) {
    const weekday = weekdayOf(date);
    const started = term.meetings.filter((r) => fromOf(r) <= date);
    if (!started.length) continue;
    const latest = started.reduce((max, r) => (fromOf(r) > max ? fromOf(r) : max), "");
    for (const rule of started.filter((r) => fromOf(r) === latest && r.weekday === weekday)) {
      const ex = exceptions.get(date);
      if (ex?.cancelled) continue;
      out.push({
        termId: term.id,
        date,
        start: zonedTimeToInstant(date, ex?.start ?? rule.start, timeZone),
        end: zonedTimeToInstant(date, ex?.end ?? rule.end, timeZone),
        place: ex?.place ?? rule.place,
        note: ex?.note,
      });
    }
  }
  return out;
}

export type NextMeeting = { occurrence: Occurrence; state: "live" | "upcoming" };

/** The meeting happening now ("live") or the next one, across all terms; null if none is scheduled. */
export function nextMeeting(terms: Term[], now: Date, timeZone: string = site.timeZone): NextMeeting | null {
  const all = terms.flatMap((t) => meetingsOf(t, timeZone)).sort((a, b) => a.start.getTime() - b.start.getTime());
  const found = all.find((o) => o.end.getTime() > now.getTime());
  if (!found) return null;
  return { occurrence: found, state: found.start.getTime() <= now.getTime() ? "live" : "upcoming" };
}

/**
 * When an all-day event "happens" for countdown purposes: the start of that day's meeting if there is one
 * (the showcase is a Wednesday night), otherwise midnight in the club's zone.
 */
export function eventMoment(term: Term, ev: CalendarEvent, timeZone: string = site.timeZone): Date {
  const meeting = meetingsOf(term, timeZone).find((m) => m.date === ev.date);
  return meeting ? meeting.start : zonedTimeToInstant(ev.date, "00:00", timeZone);
}

export type UpcomingEvent = { term: Term; event: CalendarEvent; at: Date };

/** The soonest still-to-come event of each requested kind (at most one per kind), soonest first. */
export function upcomingEvents(terms: Term[], now: Date, kinds: EventKind[], timeZone: string = site.timeZone): UpcomingEvent[] {
  const all = terms
    .flatMap((term) => term.events.map((event) => ({ term, event, at: eventMoment(term, event, timeZone) })))
    .filter((e) => e.at.getTime() > now.getTime())
    .sort((a, b) => a.at.getTime() - b.at.getTime());
  return kinds.flatMap((kind) => all.find((e) => e.event.kind === kind) ?? []).sort((a, b) => a.at.getTime() - b.at.getTime());
}