# Architecture

How the code is organised and why. Read this before changing anything under `src/system/`, `src/apps/` or `src/lib/`.
If you only update content, you don't need it — see [CONTENT_GUIDE.md](CONTENT_GUIDE.md).

## Principles

1. **Content is data.** Everything an exec edits lives in `src/content/` as typed objects, validated by tests. UI code
   never contains member names, times, links or copy that changes per semester.
2. **No backend, no database.** The site builds to static files. Data can move to Firestore/Postgres later because
   records use stable slug ids (`"2026-fall"`, `"ari"`) and are read through a small async layer (`src/apps/exec/api.ts`).
3. **Pure logic is separated from UI** (`src/lib/`, `calc.ts`, `controlCenterState.ts`, `prefs.ts`) so it can be unit-tested
   without a browser. Components stay thin.
4. **Every app is a lazy chunk.** The home screen loads first; an app's code downloads when it opens.

## Layers

```
index.html → frontend.tsx → App.tsx → react-router  (route "*" → <Phone/>)
  Phone.tsx  = providers + PhoneShell
    PrefsProvider        dark mode, wallpaper, reduce-motion (saved via lib/storage.ts)
    SystemProvider       locked?, lock↔home `progress` motion value, status-bar style, app open origin
    MusicProvider        YouTube IFrame player, playlist state (keeps playing while apps close)
    ControlCenterProvider  Control Center toggles/open state
    PhoneShell           frame + screen + LockScreen / HomeScreen / AppHost / DynamicIsland / ControlCenter / SidePanels
```

| Folder | Responsibility |
|---|---|
| `src/content/` | Editable data + `content.test.ts` validating it |
| `src/lib/` | Pure functions: `time.ts` (time zones, DST), `schedule.ts` (meeting rules → dates), `calendar.ts`, `format.ts`, `maps.ts`, `resources.ts`, `faq.ts`, `music.ts`, `storage.ts` |
| `src/system/` | The phone OS: lock/home/app host, Dynamic Island, Control Center, side panels, wallpaper, 3D lock logo (`lock/`) |
| `src/apps/` | One folder per app + `registry.tsx` (definitions and home layout) and `routes.ts` (id ↔ URL) |
| `src/ui/` | Shared app chrome: `AppFrame`, `Toggle`, `VSlider` |

## Ideas worth knowing

- **Sizing unit `--u`.** Inside `.phone-screen`, `1 --u = 1px on a 390px-wide screen` (`100cqw/390`). Use
  `calc(N * var(--u))` instead of px so the phone scales as one piece. `.phone-screen` uses `contain: layout paint` so
  `position: fixed` children stay inside the phone.
- **Theme tokens** (`--ink`, `--brand`, `--bg`, `--surface`, `--glass` …) are defined on `.phone-ui`; dark mode is
  `.phone-ui[data-theme="dark"]`. `data-status` switches the status bar between light/dark text; `data-motion` disables
  animation. Brand blue is `#3aa7de`.
- **Lock ↔ home** is one motion value, `progress` (0 locked … 1 home), in `SystemProvider`. The wallpaper, clock,
  home icons and the particle logo (`setUnlockProgress`) are all derived from it, so gesture and animation cannot disagree.
- **Apps are routes.** `/exec`, `/calendar` … resolve through `appIdFromPath`. Opening an app grows a `clip-path` from the
  icon's rectangle (stored as % insets, so it survives resizing); closing is Esc / bottom-bar swipe / browser back.
  A deep link skips the lock screen.
- **Time.** Meeting times are wall-clock in `America/Chicago` (`site.timeZone`). `lib/time.ts` converts wall-clock ↔
  instant with `Intl` (`zonedTimeToInstant`), so DST changes are correct — Fall 2026 contains the Nov 1 change and is tested.
  Never build a meeting time with `new Date(y, m, d, h)`; that uses the visitor's zone.
- **Meeting rules.** A term has `meetings` (rules with optional `from`; from a date on only the newest rule applies) and
  `meetingExceptions` (cancel/move one date). `lib/schedule.ts` expands them; Calendar, Clock, Maps, Messages,
  Dynamic Island and side panels all consume that one function.
- **Trading cards** (`apps/exec/card/*`): CSS foil layers from pokemon-cards-css (GPL-3.0) driven by `useCardTilt`
  (pointer/gyro → CSS variables through springs). Card style comes from the member's role (`roles.ts`).
- **Music.** `MusicProvider` owns one hidden YouTube player (youtube-nocookie). It lives above the app layer, so music
  survives closing the Music app and feeds the Dynamic Island and Control Center. Embed errors skip to the next song.

## Adding an app

1. `src/apps/<id>/<Name>App.tsx`, wrapped in `<AppFrame title="…">`.
2. Add it to `apps` in `src/apps/registry.tsx` (icon, colours, `component: lazy(() => import(...))`).
3. Add its id to `homeLayout` (page grid or dock). Its route (`/<id>`) works automatically; use `href` instead of `component` for an external link.
4. `bun run check` — a test verifies ids, layout and that every app has a screen.

Put app-specific CSS next to the app (`<id>.css`) and prefix classes with the app name (`notes-…`, `exec-…`).

## Testing

`bun test` (files `*.test.ts` next to the code). We test **logic and data**, not pixels:
time/DST, schedule expansion, calculator, control-center state, prefs, resources, FAQ, playlist, registry, content validity.
When you add logic to `src/lib/`, add a test beside it. UI feel (gestures, animation) is checked by hand — please check on
a real phone if you touch `LockScreen`, `AppWindow` or the card tilt.

## Conventions

- TypeScript strict; no `any`. Prefer small pure functions over hooks with hidden state.
- Comments explain *why*, not *what*. Public data types carry a one-line doc comment.
- Keep dependencies minimal — talk to the team before adding one.
- English UI text only. Accessible names on icon-only buttons; respect `prefers-reduced-motion` (`data-motion`).
