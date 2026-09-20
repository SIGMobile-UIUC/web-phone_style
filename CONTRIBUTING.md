# Contributing

Thanks for helping with the SIGMobile site. Two kinds of changes:

- **Content** (members, projects, notes, meetings, events, FAQ): see [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md).
  You never need to touch UI code for these.
- **Code** (new app, bug fix, design change): see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Workflow

1. Branch from `main`: `git switch -c short-description`. Don't push to `main` directly.
2. Make the change. Run `bun dev` and look at it in the browser (and on a phone if it's about gestures/animation).
3. `bun run check` must pass — it is exactly what CI runs (typecheck + tests + production build).
4. Open a pull request using the template. One topic per PR; screenshots for anything visual.
5. Another exec reviews and merges. Content-only PRs can be merged by any exec once CI is green.

Commit messages: short, imperative, English — `Add Spring 2027 term`, `Fix calendar week start`.

## Rules

- UI text is **English only**.
- Don't commit secrets, `node_modules/`, `dist/`, or member data without consent (photos, emails).
- New logic in `src/lib/` comes with a test next to it. Fix root causes rather than patching symptoms.
- Don't add a dependency without discussing it — the site is intentionally small.
- Keep the GPL attribution headers in `src/apps/exec/card/*.css` and `useCardTilt.ts`.
- If you change how something works, update the matching page in `docs/`.
