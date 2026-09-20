// Month grids and the per-day agenda for the Calendar app.

import { site } from "../content/site";
import type { DateString, EventKind, Place, Term } from "../content/types";
import { meetingsOf } from "./schedule";
import { addDays, formatDate, instantToZoned, parseDate } from "./time";

export type YearMonth = { y: number; m: number }; // m = 1..12
export type GridDay = { date: DateString; inMonth: boolean };

/** The weeks (Sunday first) that cover a month; days from the neighbouring months are flagged `inMonth: false`. */
export function monthGrid({ y, m }: YearMonth): GridDay[][] {
  const first = formatDate({ y, m, d: 1 });
  const lead = new Date(Date.UTC(y, m - 1, 1)).getUTCDay(); // 0 = Sunday
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = Math.ceil((lead + days) / 7) * 7;
  const start = addDays(first, -lead);
  const weeks: GridDay[][] = [];
  for (let i = 0; i < cells; i += 7) {
    weeks.push(
      Array.from({ length: 7 }, (_, j) => {
        const date = addDays(start, i + j);
        return { date, inMonth: parseDate(date).m === m };
      }),
    );
  }
  return weeks;
}

export const addMonths = ({ y, m }: YearMonth, n: number): YearMonth => {
  const index = y * 12 + (m - 1) + n;
  return { y: Math.floor(index / 12), m: (index % 12) + 1 };
};

export const monthOf = (date: DateString): YearMonth => {
  const { y, m } = parseDate(date);
  return { y, m };
};

/** Today's date on the club's clock (a visitor in Seoul at 8am Thursday still sees Wednesday's meeting as "today"). */
export const todayInClubZone = (now: Date, timeZone: string = site.timeZone): DateString => instantToZoned(now, timeZone).date;

export type AgendaItem = {
  kind: "meeting" | EventKind;
  title: string;
  /** Meetings only. */
  start?: Date;
  end?: Date;
  place?: Place;
  note?: string;
};

/** Everything on the calendar, by date: all-day events first, then the (timed) meetings. */
export function agendaByDate(terms: Term[], timeZone: string = site.timeZone): Map<DateString, AgendaItem[]> {
  const byDate = new Map<DateString, AgendaItem[]>();
  const add = (date: DateString, item: AgendaItem) => byDate.set(date, [...(byDate.get(date) ?? []), item]);

  for (const term of terms) {
    for (const ev of term.events) add(ev.date, { kind: ev.kind, title: ev.title, note: ev.note });
    for (const m of meetingsOf(term, timeZone)) {
      add(m.date, { kind: "meeting", title: "Weekly meeting", start: m.start, end: m.end, place: m.place, note: m.note });
    }
  }
  for (const [date, items] of byDate) {
    byDate.set(date, [...items].sort((a, b) => Number(a.kind === "meeting") - Number(b.kind === "meeting")));
  }
  return byDate;
}
