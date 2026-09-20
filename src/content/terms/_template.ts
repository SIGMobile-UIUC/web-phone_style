// TEMPLATE for a new semester. NOT registered anywhere — copy it:
//   1. Copy this file to  src/content/terms/<year>-<spring|fall>.ts   (e.g. 2027-spring.ts)
//   2. Fill in every field (set `id` to the same string as the file name).
//   3. Register it in src/content/terms/index.ts  (import + add to the list, newest first).
//   4. Run `bun run check`. Fix anything the content tests complain about.
// Full walkthrough: docs/HANDOVER.md

import { tba } from "../places";
import type { Term } from "../types";

export default {
  id: "2027-spring", // must be "<year>-<spring|fall>"
  year: 2027,
  semester: "spring",
  start: "2027-01-18", // first day of programming (YYYY-MM-DD)
  end: "2027-05-05", // last day; meetings are generated only inside start..end

  meetings: [
    // weekday: sun mon tue wed thu fri sat — time is 24h "HH:mm" in the club time zone (src/content/site.ts)
    // Use a place from src/content/places.ts, or `tba` until it is decided.
    { weekday: "wed", start: "18:00", end: "20:00", place: tba },
  ],
  meetingExceptions: [
    // { date: "2027-03-10", cancelled: true, note: "Spring break" },
    // { date: "2027-04-14", start: "17:00", end: "19:00", note: "Moved earlier for the showcase" },
  ],

  events: [
    // { date: "2027-04-28", title: "Project Showcase", kind: "showcase" },   // kind: milestone | showcase | deploy | social
  ],

  projects: [
    // { name: "My App", tagline: "One sentence.", stack: ["React Native"], repoUrl: "https://github.com/..." },
  ],

  members: [
    // Copy a member from the previous term if they returned (keep the same `id`!), then update role/standing.
    // {
    //   id: "firstname", name: "First", pronouns: "they/them", role: "President", standing: "Junior",
    //   major: "Computer Science", interests: ["..."], favLang: "TypeScript", funFact: "...",
    //   photo: firstname,        // import firstname from "../photos/firstname.jpg" (800x500)
    //   email: "netid@illinois.edu",   // optional — only with the member's consent
    // },
  ],
} satisfies Term;
