// FALL 2026 — everything that changes per semester lives in this one file.
//
//   members   : the executive board, in the order the cards are shown
//   meetings  : the weekly meeting (day, time, place). To change it mid-semester, ADD another rule with `from`.
//   events    : one-off dates on the calendar (the weekly meetings are generated automatically)
//   projects  : what the club is building this semester
//
// Starting a new semester? Copy _template.ts, fill it in, and register it in ./index.ts (see docs/HANDOVER.md).
// Member photos: 800x500 jpg in src/content/photos, imported below.

import ari from "../photos/ari.jpg";
import kevin from "../photos/kevin.jpg";
import maple from "../photos/maple.jpg";
import mariia from "../photos/mariia.jpg";
import riley from "../photos/riley.jpg";
import shubh from "../photos/shubh.jpg";
import { tba } from "../places";
import type { Term } from "../types";

// Source: SIGMobile Information Session slides (Fall 2026).
export default {
  id: "2026-fall",
  year: 2026,
  semester: "fall",
  start: "2026-09-14",
  end: "2026-12-02",

  meetings: [
    // Wednesdays 6-8pm Central. First regular meeting is week 2 (9/23); week 1 (9/14) was the kickoff.
    { from: "2026-09-23", weekday: "wed", start: "18:00", end: "20:00", place: tba },
  ],
  // { date: "2026-11-25", cancelled: true, note: "Thanksgiving week" }
  meetingExceptions: [],

  // The 12-week plan from the info-session timeline slides (week 1 = 9/14).
  events: [
    { date: "2026-09-14", title: "Creating project groups", kind: "milestone", note: "Week 1" },
    { date: "2026-09-23", title: "Meet your project group", kind: "milestone", note: "Week 2 · Create an MVP plan and divide the work while learning your stack" },
    { date: "2026-09-30", title: "Start development", kind: "milestone", note: "Week 3 · Dig deeper into your chosen stack" },
    { date: "2026-10-07", title: "Quick progress check", kind: "milestone", note: "Week 4 · How close are we to MVP?" },
    { date: "2026-10-14", title: "More development", kind: "milestone", note: "Week 5 · Ideally close to MVP" },
    { date: "2026-10-21", title: "Progress check", kind: "milestone", note: "Week 6 · Are we close to MVP?" },
    { date: "2026-10-28", title: "Polish features, part I", kind: "milestone", note: "Week 7 · Comfort features. Recognize blockers and plan how to overcome them" },
    { date: "2026-11-04", title: "Polish features, part II", kind: "milestone", note: "Week 8 · Working towards deployment. Explore tech stacks for faster development" },
    { date: "2026-11-11", title: "Beta testing", kind: "milestone", note: "Week 9 · Test apps with other students. Close to MVP? Polish features for the showcase, otherwise keep developing" },
    { date: "2026-11-18", title: "Project Showcase", kind: "showcase", note: "Week 10 · Plus development time and stack workshops" },
    { date: "2026-11-25", title: "More dev time", kind: "milestone", note: "Week 11 · Approaching MVP" },
    { date: "2026-12-02", title: "Roll out MVP + deployment", kind: "deploy", note: "Week 12" },
  ],

  projects: [
    {
      name: "Virtual Pet App",
      tagline: "Adopt a pet and see it in AR.",
      stack: ["React Native", "Express"],
    },
    {
      name: "Language Learning App",
      tagline: "Creates language-learning content from corpus data and grades your answers by similarity score.",
      stack: ["React Native", "Flask", "PostgreSQL"],
    },
    {
      name: "Plant Companion App & Device",
      tagline: "An app plus a custom soil-probe device that reports how your plant is doing.",
      stack: ["React Native", "Expo", "SQLite", "ESP32 (C++)"],
    },
  ],

  members: [
    {
      id: "ari",
      photo: ari,
      name: "Ari",
      pronouns: "he/him",
      role: "President",
      standing: "Sophomore",
      major: "Information Sciences + Data Science (minor: CS)",
      interests: ["Linguistics", "Music (singing, reviewing, producing)"],
      favLang: "C++",
      funFact: "Taking Intro Japanese, but one of two people in the class who don't watch anime.",
    },
    {
      id: "mariia",
      photo: mariia,
      name: "Mariia",
      pronouns: "they/them",
      role: "Infra & Dev",
      standing: "Junior",
      major: "Computer Science (minor: Statistics)",
      interests: ["CS in medical applications", "ML interpretability", "Math", "Fine arts", "Puzzles"],
      favLang: "Python",
      funFact: "Loves horror movies and video games. Favorites: Signalis and Silent Hill 2.",
    },
    {
      id: "maple",
      photo: maple,
      name: "Maple",
      pronouns: "she/her",
      role: "Design/Social",
      standing: "Sophomore",
      major: "Computer Science + Philosophy",
      interests: ["Medical tech", "Orchestration", "Violin", "Photography"],
      favLang: "C++",
      funFact: "Owns a Chinese Evergreen named Confucius.",
    },
    {
      id: "riley",
      photo: riley,
      name: "Riley",
      pronouns: "he/him",
      role: "Infrastructure",
      standing: "Junior",
      major: "Computer Science",
      interests: ["Embedded systems", "Renewable energy & sustainability", "All of science", "Insects"],
      favLang: "C/C++",
      funFact: "Couldn't think of anything about himself, only insects.",
    },
    {
      id: "kevin",
      photo: kevin,
      name: "Kevin",
      pronouns: "he/him",
      role: "Infrastructure",
      standing: "Senior",
      major: "Computer Science + Economics",
      interests: ["AI", "Data", "NLP", "Food"],
      favLang: "Python",
      funFact: "Dual U.S.-Korean citizen who served near the DMZ in the Korean army.",
    },
    {
      id: "shubh",
      photo: shubh,
      name: "Shubh Jain",
      role: "Member",
      standing: "Sophomore",
      major: "Computer Science",
      interests: ["Badminton", "Cooking", "Hiking", "Music"],
      favLang: "Python",
      funFact: "Spent 100s of dollars' worth of Fable 5 on just one PR merge.",
    },
  ],
} satisfies Term;
