# Handover guide

Read this first if you are taking over the SIGMobile website. It is meant to be kept up to date — if you
change how something works, change it here too.

Other docs: [CONTENT_GUIDE.md](CONTENT_GUIDE.md) (step-by-step content edits: Projects, Executive Board, Notes …),
[ARCHITECTURE.md](ARCHITECTURE.md) (how the code fits together), [DEPLOYMENT.md](DEPLOYMENT.md) (hosting),
[../CONTRIBUTING.md](../CONTRIBUTING.md) (PR workflow).

## 1. Run it

You need [Bun](https://bun.sh) (Windows: `winget install Oven-sh.Bun`, then open a new terminal).

```bash
bun install
bun dev            # http://localhost:3000  (hot reload)
bun run check      # typecheck + tests + production build. CI runs exactly this on every PR.
```

`bun run check` must pass before you merge. If a content test fails, its message says which entry to fix.

## 2. Where do I edit …?

| I want to … | Edit |
|---|---|
| Add / change the executive board | `src/content/terms/<term>.ts` → `members` (order in the array = order of the cards) |
| Add a member's photo | Put an **800x500** jpg in `src/content/photos/`, `import` it in the term file, set `photo:` |
| Change the weekly meeting time | `src/content/terms/<term>.ts` → `meetings` (see recipes below) |
| Set / change the meeting place | Add the place to `src/content/places.ts`, then use it in `meetings` |
| Cancel or move one meeting | `meetingExceptions` in the term file |
| Add a calendar event (showcase, deadline, social) | `events` in the term file |
| Add / change semester projects | `projects` in the term file |
| Discord / Instagram links, club name, time zone | `src/content/site.ts` |
| Add a learning-resource link (Notes app) | `src/content/resources.ts` — copy one line |
| Change the "Join us" chat answers | `src/content/faq.ts` |
| Change the About text | `src/content/about.ts` |
| Add / change songs in the Music playlist | `src/content/music.ts` |
| Start a new semester | Section 3 |

Times are **24-hour wall-clock times in the club time zone** (`America/Chicago`, set in `site.ts`). Visitors in other
time zones still see the Chicago time, and daylight-saving changes are handled automatically.

## 3. New semester checklist

1. Copy `src/content/terms/_template.ts` to `src/content/terms/<year>-<spring|fall>.ts` (e.g. `2027-spring.ts`).
2. Fill it in. `id` must be `<year>-<semester>` and match the file name.
3. Returning members: copy their entry from the previous term and **keep the same `id`**; update `role` and `standing`.
4. New members: add a photo (section 2) and an entry with a new lowercase `id`.
5. Register the file in `src/content/terms/index.ts` (one `import` + add it to the `all` list). Order does not matter;
   the site sorts newest first, and the newest term is treated as the current one.
6. `bun run check`. Fix whatever the content tests report, then open a PR.

Old terms stay in the repo as the historical record — never delete them.

## 4. Recipes

**Change the meeting time for the whole semester** — edit the rule in `meetings`:

```ts
meetings: [{ weekday: "thu", start: "17:30", end: "19:30", place: exampleHall }],
```

**Change it from a certain date on** (e.g. the room changes mid-semester) — keep the old rule and *add* a new one with `from`.
From that date only the newest rule applies:

```ts
meetings: [
  { weekday: "wed", start: "18:00", end: "20:00", place: roomA },
  { from: "2026-10-14", weekday: "wed", start: "18:00", end: "20:00", place: roomB },
],
```

**Cancel or move a single meeting** (`date` must be a day the meeting normally happens — the tests check this):

```ts
meetingExceptions: [
  { date: "2026-11-25", cancelled: true, note: "Thanksgiving week" },
  { date: "2026-11-18", start: "17:00", end: "19:00", note: "Showcase starts early" },
],
```

**Two meetings a week** — add two rules with the same (or no) `from`.

**Add a place** in `src/content/places.ts`:

```ts
// (illustrative values — use the real building, room and address)
export const exampleHall: Place = { name: "Example Hall", room: "101", address: "123 Main St, Urbana, IL",
  mapsUrl: "https://maps.google.com/?q=Example+Hall+Urbana" };
```

Until a place is decided use `tba` (the UI then shows "Location TBA" and hides the directions button).

**Email addresses** on the executive cards are optional — only add one with the member's consent.

## 5. What the tests protect

`bun run check` runs the TypeScript compiler, all `*.test.ts` files, and a production build.
`src/content/content.test.ts` catches the mistakes people actually make when editing data:

- a term file that exists but isn't registered in `terms/index.ts` (or the reverse)
- wrong `id` format, duplicate ids, the same `id` used for two different people
- impossible dates (`2026-02-30`), times that aren't `HH:mm`, a meeting that ends before it starts
- events outside the semester, exceptions that don't fall on a meeting day
- links that aren't `https`
- (warning only) the current term's meeting place is still TBA

`src/lib/time.test.ts` / `schedule.test.ts` cover the time-zone and daylight-saving logic. **Daylight saving ends
inside Fall 2026 (Nov 1)**, so these tests matter — don't remove them.

## 6. Deploying

Full notes in [DEPLOYMENT.md](DEPLOYMENT.md). In short, `bun run build` writes a static site to `dist/`. Hosting is not
decided yet (Firebase Hosting is a candidate). Whatever you use must:

- serve `dist/` as the site root, and
- **rewrite every unknown path to `/index.html`** (this is a single-page app; `/exec` is not a real file).
  On Firebase Hosting that is `"rewrites": [{ "source": "**", "destination": "/index.html" }]` in `firebase.json`.
- use **HTTPS** (needed for the phone-tilt effect on the trading cards).

## 7. Gotchas

- **`bunfig.toml` sets `peer = false` on purpose.** `bun-plugin-tailwind` lists `bun` as a peer dependency; installing
  the npm `bun` package breaks `bun run <script>` on Windows ("bin executable does not exist"). Don't remove it.
- After installing Bun on Windows, open a **new** terminal so `bun` is on PATH.
- Member photos must be 800x500 (the card's picture window is ~1.6:1). Other sizes get cropped.
- The card effect is GPL-3.0 code (ported from simeydotme/pokemon-cards-css). Keep the attribution headers in `src/apps/exec/card/*.css`.

## 8. Code map

```
src/content/      all editable data (terms/, places.ts, site.ts, photos/)   + content.test.ts
src/lib/          time.ts (time zones, countdown), schedule.ts (meetings), format.ts (English date text) + tests
src/system/       the phone: PhoneShell (frame), SidePanels (info beside the phone), LockScreen, HomeScreen,
                  AppHost/AppWindow (open/close animation), StatusBar, DynamicIsland, SystemProvider, lock/ (3D logo)
src/apps/         registry.tsx (the list of apps + home layout) and one folder per app (about/, exec/, projects/ ...)
src/ui/           AppFrame (the shared app chrome: large title + scroll) and small shared pieces
src/assets/       logo
docs/             guides (this one, CONTENT_GUIDE, ARCHITECTURE, DEPLOYMENT)
```

The whole site is a phone-style interface: lock screen → home screen → apps. Everything in the UI is English.

- **Add or reorder home-screen apps:** `src/apps/registry.tsx` (`apps` = definitions, `homeLayout` = order; a test checks the ids).
- **Wallpaper / colors:** `src/system/system.css` (`.wallpaper`, theme variables at the top of `.phone-ui`). The look is
  white & blue like the rest of the site. Sizes there use `--u` (1u = 1px on a 390px-wide screen) so the phone scales as
  one piece — use `calc(N * var(--u))`, not raw px.
- **The lock screen is the site's landing page.** Its centerpiece is the particle logo (`system/lock/particleLogoScene.ts`).
  Sliding the screen up drives the logo's scatter/orbit through `progress` (see `system/LockLogo.tsx`), and the logo
  re-forms if the slide is cancelled. Dragging the logo directly still scatters it, as on the old landing page.
- **Apps are routes.** `/exec`, `/about`, … open that app inside the phone (the URL decides; the browser's back button
  closes it; Esc or swiping the bottom bar up closes it too). Opening the site on an app URL skips the lock screen.
  Each app screen is lazy-loaded, so it is its own small download.
- **Info beside the phone** (windows wider than 1100px): `src/system/SidePanels.tsx`. It reads the meeting schedule from
  `src/content`, so changing the meeting time in the term file updates it — no code change.

### Adding a new app

1. Create `src/apps/<id>/<Name>App.tsx` (wrap your content in `<AppFrame title="...">` from `src/ui/AppFrame`).
2. Add it to `apps` in `src/apps/registry.tsx` (icon, colors, `component: lazy(() => import("./<id>/<Name>App"))`).
3. Put its id in `homeLayout`. `bun run check` verifies the ids and that every app has a screen.

### App status

| App | Status | Still to build |
|---|---|---|
| About | done (text in `src/content/about.ts`) | — |
| Projects | done (reads the newest term's `projects`) | detail sheet per project |
| Executive Board | done (current term open, past terms collapsed) | — |
| Calendar | done (meetings generated from the term schedule; events from the term file) | — |
| Clock | done (Central-time clock, countdowns to the next meeting, showcase, deployment) | — |
| Maps | done (shows the meeting place; directions button appears once the place is not TBA) | real map tiles (currently a drawn map) |
| Messages | done (scripted "Join us" chat; wording in `src/content/faq.ts`) | — |
| Notes | done (links in `src/content/resources.ts`, one line per link) | — |
| Calculator | done (`apps/calculator/calc.ts` + tests) | — |
| Music | done (10-song playlist from `src/content/music.ts`, streams from YouTube after pressing play; next/previous/volume; keeps playing when the app is closed and shows in the Dynamic Island and Control Center; a song that can't be embedded is skipped automatically) | — |
| Settings | done (dark mode, wallpaper, reduce motion; saved in the browser) | — |
| Discord / Instagram | done | external links |
| System | lock, unlock, home, app open/close, Dynamic Island (music + live meeting), **Control Center** done | Not planned: Notification Center, Spotlight, app switcher, home edit mode |

**Control Center** (pull down from the top-right corner, or click the status icons; Esc / drag up / tap outside closes it):
now-playing tile with play/pause/next/previous/seek, volume and brightness sliders, airplane/cellular/Wi-Fi/Bluetooth,
focus, orientation lock, dark mode, flashlight, and shortcuts to Clock, Calculator and Music. Most switches are only
visual; the ones that do something are dark mode, music volume/controls, brightness (dims the screen) and the flashlight
(a glow at the top; also on the lock screen). Code: `src/system/ControlCenter*.tsx` (+ pure logic in `controlCenterState.ts`).

To change the songs, edit `src/content/music.ts` (one line per song; use the artist's official upload — the tests check the ids).

Content you can edit without touching UI code: `about.ts` (About text), `resources.ts` (Notes links), `faq.ts` (Messages
chat; placeholders `{{meeting}}`, `{{term}}`, `{{projects}}` are filled in automatically), `music.ts` (the playlist),
`site.ts` (links, time zone), and the term files. `bun run check` validates them (https links, unique ids, valid dates).
