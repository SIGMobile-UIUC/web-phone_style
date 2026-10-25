// Links shown in the Notes app ("Resources"). To add one, copy a line and edit it — that's all.
//   title    : what the link is
//   url      : must start with https://
//   note     : optional one-liner
//   category : groups links in the app (pick an existing one, or invent a new one)
//   addedAt  : YYYY-MM-DD — newest first inside a category (for meeting slides, use the meeting's date)
//
// Meeting slides come first; below them, a starter list of official docs for the stacks in the Fall 2026 projects. Keep adding.

import type { DateString } from "./types";

export type Resource = { title: string; url: string; note?: string; category: string; addedAt: DateString };

export const resources: Resource[] = [
  { category: "Meeting slides", title: "Meeting 4 slides", url: "https://docs.google.com/presentation/d/1u2Flq0KCr9eb6Iz88Nmu4ejbKeManEMSm9qQHnsS2fE/edit?usp=sharing", note: "October 14, 2026", addedAt: "2026-10-14" },
  { category: "Meeting slides", title: "Meeting 3 slides", url: "https://docs.google.com/presentation/d/1PYubxFFw5t7lDaW9e7e3hx1RXk6SPw9txDtR05pOD-0/edit?usp=sharing", note: "October 7, 2026", addedAt: "2026-10-07" },
  { category: "Meeting slides", title: "Meeting 2 slides", url: "https://docs.google.com/presentation/d/1rjqInUUzexKBx6v2uKg7ZRHT_kX0DTGVGqUEfhklfSU/edit?usp=sharing", note: "September 30, 2026", addedAt: "2026-09-30" },
  { category: "Meeting slides", title: "Meeting 1 slides", url: "https://docs.google.com/presentation/d/1ii8lTW8pZmXrgfnkxzdOiKaCNUHCWIau-l0o5GoxScM/edit?usp=sharing", note: "September 23, 2026", addedAt: "2026-09-23" },
  { category: "Mobile", title: "React Native docs", url: "https://reactnative.dev/docs/getting-started", note: "Components, APIs and guides", addedAt: "2026-09-19" },
  { category: "Mobile", title: "Expo docs", url: "https://docs.expo.dev/", note: "Build and ship React Native apps faster", addedAt: "2026-09-19" },
  { category: "Backend", title: "Express", url: "https://expressjs.com/", note: "Minimal Node.js web framework", addedAt: "2026-09-19" },
  { category: "Backend", title: "Flask", url: "https://flask.palletsprojects.com/", note: "Lightweight Python web framework", addedAt: "2026-09-19" },
  { category: "Databases", title: "PostgreSQL documentation", url: "https://www.postgresql.org/docs/", addedAt: "2026-09-19" },
  { category: "Databases", title: "SQLite documentation", url: "https://www.sqlite.org/docs.html", note: "The database that lives inside your app", addedAt: "2026-09-19" },
  { category: "Hardware", title: "ESP32 (ESP-IDF) programming guide", url: "https://docs.espressif.com/projects/esp-idf/en/latest/esp32/", note: "For the Plant Companion device", addedAt: "2026-09-19" },
];
