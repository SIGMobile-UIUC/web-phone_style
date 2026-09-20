// Types for everything editable in src/content. Ids are stable slugs ("2026-fall", "ari") so they can be
// reused as-is if this data ever moves to Firestore/Postgres.

/** Foil style of an executive-board trading card. */
export type Rarity = "rare holo" | "rare holo cosmos" | "rare rainbow" | "rare secret" | "reverse holo";

/** "YYYY-MM-DD" — a calendar date, no time zone. */
export type DateString = string;
/** "HH:mm", 24-hour, in the club's time zone (see site.ts). */
export type TimeString = string;

export type Weekday = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type Place = {
  name: string;
  room?: string;
  address?: string;
  /** Link that opens directions (Google/Apple/OSM maps). */
  mapsUrl?: string;
};

/** A recurring weekly meeting. Add another rule with a later `from` to change it mid-semester. */
export type MeetingRule = {
  /** First date this rule applies (default: the term's start). */
  from?: DateString;
  weekday: Weekday;
  start: TimeString;
  end: TimeString;
  place: Place;
};

/** A one-off change to the recurring meeting: cancel it, or move/rename just that day. */
export type MeetingException = {
  date: DateString;
  cancelled?: boolean;
  start?: TimeString;
  end?: TimeString;
  place?: Place;
  note?: string;
};

export type EventKind = "milestone" | "showcase" | "deploy" | "social";

/** An all-day item on the calendar (the weekly meetings are generated, don't list them here). */
export type CalendarEvent = {
  date: DateString;
  title: string;
  kind: EventKind;
  note?: string;
};

export type Project = {
  name: string;
  tagline: string;
  stack: string[];
  repoUrl?: string;
};

/** A member as they appeared in one term (role/standing/bio are per-term snapshots). */
export type TermMember = {
  id: string;
  name: string;
  pronouns?: string;
  email?: string;
  /** Image URL — import the jpg in the term file (800x500 in src/content/photos). */
  photo?: string;
  major: string;
  interests: string[];
  favLang?: string;
  funFact?: string;
  role: string;
  /** "Freshman" | "Sophomore" | "Junior" | "Senior" (drives the card's HP). */
  standing: string;
  /** Overrides the role's default foil. */
  rarity?: Rarity;
};

export type Term = {
  id: string; // "2026-fall"
  year: number;
  semester: "spring" | "fall";
  /** First and last day of the semester's programming. Meetings are only generated inside this range. */
  start: DateString;
  end: DateString;
  meetings: MeetingRule[];
  meetingExceptions?: MeetingException[];
  events: CalendarEvent[];
  projects: Project[];
  /** Display order = array order. */
  members: TermMember[];
};

export type TermSummary = Pick<Term, "id" | "year" | "semester"> & { memberCount: number };
