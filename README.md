# SIGMobile Website

The website of **SIGMobile**, the mobile app development Special Interest Group at UIUC (ACM) — presented as a phone.
Open the site, slide the lock screen up, and every part of the club (About, Projects, Executive Board, Calendar …)
is an app on the home screen.

## What's inside

| App | What it shows | Edited in |
|---|---|---|
| **About** | What the club is and does | `src/content/about.ts` |
| **Projects** | This semester's projects | `projects` in the term file |
| **Executive Board** | Trading-card style member profiles, past terms folded away | `members` in the term file |
| **Calendar** | Weekly meetings (generated) + events | `meetings`, `events` in the term file |
| **Clock** | Central-time clock, countdown to the next meeting / showcase / deploy | term file |
| **Maps** | Where we meet, with a directions button | `src/content/places.ts` |
| **Messages** | A scripted "Join us" chat (FAQ) | `src/content/faq.ts` |
| **Notes** | Learning resources | `src/content/resources.ts` |
| **Music** | An "Internet Classics" playlist (streams from YouTube) | `src/content/music.ts` |
| **Calculator**, **Settings** | Calculator; dark mode, wallpaper, reduce motion | — |
| **Discord**, **Instagram** | Links | `src/content/site.ts` |

System features: lock screen with the particle logo, Dynamic Island (music + live meeting), Control Center,
app open/close animation, deep links (`/exec`, `/calendar` … open the app directly), side panels with the meeting time
on wide screens. The UI is English only.

## Quick start

You need [Bun](https://bun.sh) (Windows: `winget install Oven-sh.Bun`, then open a **new** terminal).

```bash
bun install        # install dependencies
bun dev            # dev server with hot reload -> http://localhost:3000
bun run check      # typecheck + tests + production build (run before every PR; CI runs the same)
bun run build      # static site -> dist/
```

## Documentation

| If you want to … | Read |
|---|---|
| **Update content** (members, projects, notes, meetings, events) — most people | [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md) |
| Take over the site (everything in one place, new-semester checklist) | [docs/HANDOVER.md](docs/HANDOVER.md) |
| Understand how the code is organised, add an app | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Put the site online | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| Open a pull request | [CONTRIBUTING.md](CONTRIBUTING.md) |

## Tech stack

[Bun](https://bun.sh) (runtime, bundler, test runner) · React 19 · TypeScript · react-router 7 · Tailwind CSS 4 ·
[motion](https://motion.dev) (animation) · three.js (lock-screen logo, lazy-loaded). No backend and no database:
all content is typed data in `src/content/`, validated by tests. Times are stored as wall-clock time in
`America/Chicago` and shown that way to every visitor.

## Project layout

```
src/content/   all editable data (one file per semester in terms/) + content.test.ts
src/apps/      one folder per phone app; registry.tsx lists them
src/system/    the phone itself: lock screen, home screen, Control Center, Dynamic Island, providers
src/lib/       pure logic (time zones, meeting schedule, calendar) + tests
src/ui/        shared app chrome (AppFrame, Toggle, sliders)
docs/          guides for successors
```
