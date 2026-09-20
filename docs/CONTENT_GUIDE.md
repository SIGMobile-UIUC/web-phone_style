# Content guide — updating Projects, Executive Board, Notes and more

For exec members who need to change what the site says. **You don't need to know React.** Everything below is a
plain-text data file; copy an existing line, change the words, open a pull request. CI tells you if you broke something.

## How editing works (two ways)

**A. On GitHub, no install (best for a one-line change)**
1. Open the file on GitHub → click the pencil ✏️ (Edit).
2. Change it → *Commit changes* → choose **Create a new branch and start a pull request**.
3. Wait for the green ✔ (CI runs `bun run check`). If it's red, click *Details* — the message names the entry to fix.
4. Ask another exec to review and merge.

**B. On your computer (best for photos and new semesters)**
```bash
git clone https://github.com/SIGMobile-UIUC/web-test-build.git
cd web-test-build && bun install
git switch -c update-fall-members
bun dev                 # http://localhost:3000 — see your change live
bun run check           # must pass
git add -A && git commit -m "Update Fall 2026 members" && git push -u origin HEAD   # then open a PR
```

Rules of thumb: **English only**, links start with `https://`, dates are `YYYY-MM-DD`, times are 24-hour `HH:mm`
Central time. Keep the commas and quotes exactly as in the lines around your change.

## Where everything lives

| What | File | Section |
|---|---|---|
| Projects app | `src/content/terms/<term>.ts` | [Projects](#projects) |
| Executive Board app | `src/content/terms/<term>.ts` + `src/content/photos/` | [Executive Board](#executive-board) |
| Notes app | `src/content/resources.ts` | [Notes](#notes-learning-resources) |
| Meeting time / place, calendar events | `src/content/terms/<term>.ts`, `places.ts` | [Meetings](#meetings-and-calendar) |
| Messages ("Join us" chat) | `src/content/faq.ts` | [Messages](#messages-faq) |
| About | `src/content/about.ts` | edit the text in quotes |
| Music | `src/content/music.ts` | [Music](#music) |
| Discord / Instagram links | `src/content/site.ts` | change the URL |
| A whole new semester | copy `terms/_template.ts` | [New semester](#new-semester) |

`<term>` is the semester file, e.g. `2026-fall.ts`. Editing an **old** semester's file changes history — only do that to
fix mistakes.

## Projects

The Projects app lists `projects` of the **newest** semester. Each project is one block:

```ts
projects: [
  {
    name: "Virtual Pet App",                        // required
    tagline: "Adopt a pet and see it in AR.",       // required, one sentence
    stack: ["React Native", "Express"],             // required, list of tech (can be [])
    repoUrl: "https://github.com/SIGMobile-UIUC/virtual-pet", // optional, must be https
  },
  // add the next project here
],
```

- **Add**: copy a block, paste it below, edit. **Remove**: delete the block (the comma goes with it).
- Order in the file = order in the app.

## Executive Board

The cards show the **newest** semester first and open; older semesters sit under a "Past boards" heading as collapsed rows (tap a semester to open it).
One person = one block in `members` of that semester's file:

```ts
{
  id: "ari",                       // lowercase, stable forever (same person => same id in every term)
  name: "Ari",
  pronouns: "she/her",             // optional
  role: "President",               // free text; decides the card style (see below)
  standing: "Senior",              // Freshman | Sophomore | Junior | Senior
  major: "Computer Science",
  interests: ["Mobile", "Design"],
  favLang: "TypeScript",           // optional
  funFact: "…",                    // optional
  photo: ari,                      // imported at the top of the file (see below)
  email: "netid@illinois.edu",     // optional — ONLY with the member's written consent
},
```

- **Order** of the array = order of the cards. Put the president first.
- **Card style comes from `role`**: contains "president" → rainbow/Dragon, "design" → Fairy, "infra" → Metal, anything else →
  basic holo. To force a look add `rarity: "rare secret"` (options: `rare holo`, `rare holo cosmos`, `rare rainbow`,
  `rare secret`, `reverse holo`). Roles/colors live in `src/apps/exec/roles.ts`.
- **Photo**: crop to **800×500 px** (landscape, ~1.6:1), save as `firstname.jpg` (~50–150 KB) in `src/content/photos/`,
  then at the top of the term file add `import firstname from "../photos/firstname.jpg";` and write `photo: firstname`.
  Only use photos the member agreed to share. No photo? Leave `photo` out.
- **Returning members**: copy their block from last term, **keep the same `id`**, update `role` and `standing`.
- **Someone left**: just don't include them in the new term. Never delete them from old terms.

## Notes (learning resources)

The Notes app shows `resources` grouped by category. One link = one line in `src/content/resources.ts`:

```ts
{ category: "Mobile", title: "React Native docs", url: "https://reactnative.dev/docs/getting-started",
  note: "Components, APIs and guides", addedAt: "2026-09-19" },
```

- `category`: reuse an existing one (Mobile, Backend, Databases, Hardware) or type a new name — a new group appears automatically.
- `note` is optional. `addedAt` is today's date; links from the last 14 days get a **New** badge.
- Prefer official docs and free material. Remove dead links by deleting the line.

## Meetings and calendar

- **Weekly meeting**: `meetings` in the term file. `weekday` is `sun…sat`, times are 24-hour Central time.
- **Set the place**: add it to `src/content/places.ts`, then use it in `meetings` instead of `tba`.
- **Mid-semester change / cancel one week / two meetings a week / add a calendar event**: recipes with examples are in
  [HANDOVER §4](HANDOVER.md#4-recipes).
- Changing the meeting also updates the Clock countdown, Calendar, Maps, Messages answer and the panels beside the
  phone — you only edit it once.

## Messages (FAQ)

`src/content/faq.ts`: each entry is a question button and its answer. `{{meeting}}`, `{{term}}` and `{{projects}}` are
filled in automatically, so don't hard-code the meeting time in an answer. `cta: "discord"` adds a Discord button.

## Music

`src/content/music.ts`: one line per song; `videoId` is the part after `?v=` in the YouTube URL. Use the **artist's
official upload**. A test checks the ids look right; a song that can't be embedded is skipped automatically.

## New semester

Follow [HANDOVER §3](HANDOVER.md#3-new-semester-checklist): copy `terms/_template.ts` → `terms/2027-spring.ts`, fill it in,
register it in `terms/index.ts`, run `bun run check`. The site automatically treats the newest term as current and folds
the older ones.

## When CI is red

`bun run check` runs three things; the message tells you which:

| Message contains | Meaning | Fix |
|---|---|---|
| a failing test in `content.test.ts`, `resources.test.ts`, `music.test.ts` or `faq.test.ts` | A data mistake (bad date, duplicate `id`/link, non-https link, term not registered) | The message names the entry — fix that line |
| `error TS…` | A typo/wrong field name in a `.ts` file | Compare with the line above/below it; check quotes and commas |
| build error mentioning a `../photos/…` file | Photo file name doesn't match the `import` | Match the file name (case-sensitive) |

Stuck? Ask in the exec Discord channel and link the failing PR.

## Do not

- Don't put secrets, passwords or personal phone numbers anywhere in this repo — assume it can become public.
- Don't delete old terms or old members.
- Don't add new dependencies for a content change.
