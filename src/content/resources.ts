// Links shown in the Notes app ("Resources"). To add one, copy a line and edit it — that's all.
//   title    : what the link is
//   url      : must start with https://
//   note     : optional one-liner
//   category : groups links in the app (pick an existing one, or invent a new one)
//   addedAt  : YYYY-MM-DD — links added in the last two weeks get a "New" tag
//
// This starter list covers the stacks from the Fall 2026 project slides (official docs). Keep adding.

import type { DateString } from "./types";

export type Resource = { title: string; url: string; note?: string; category: string; addedAt: DateString };

export const resources: Resource[] = [
  { category: "Mobile", title: "React Native docs", url: "https://reactnative.dev/docs/getting-started", note: "Components, APIs and guides", addedAt: "2026-09-19" },
  { category: "Mobile", title: "Expo docs", url: "https://docs.expo.dev/", note: "Build and ship React Native apps faster", addedAt: "2026-09-19" },
  { category: "Backend", title: "Express", url: "https://expressjs.com/", note: "Minimal Node.js web framework", addedAt: "2026-09-19" },
  { category: "Backend", title: "Flask", url: "https://flask.palletsprojects.com/", note: "Lightweight Python web framework", addedAt: "2026-09-19" },
  { category: "Databases", title: "PostgreSQL documentation", url: "https://www.postgresql.org/docs/", addedAt: "2026-09-19" },
  { category: "Databases", title: "SQLite documentation", url: "https://www.sqlite.org/docs.html", note: "The database that lives inside your app", addedAt: "2026-09-19" },
  { category: "Hardware", title: "ESP32 (ESP-IDF) programming guide", url: "https://docs.espressif.com/projects/esp-idf/en/latest/esp32/", note: "For the Plant Companion device", addedAt: "2026-09-19" },
];
