# Deployment

> **Status: hosting is not decided.** This page records what any host must do and a Firebase Hosting example.
> Nothing here has been run against a real project yet — test on a preview channel first.

## What gets deployed

```bash
bun run build     # writes a static site to dist/
```

`dist/` is plain HTML/JS/CSS/images. There is no server code to run in production.

## Requirements for any host

1. Serve `dist/` as the site root.
2. **Rewrite every unknown path to `/index.html`.** The site is a single-page app: `/exec` and `/calendar` are not files.
   Without this, reloading or sharing a deep link gives a 404.
3. **HTTPS.** Required for the phone-tilt effect on the trading cards (device-orientation permission) and expected by browsers.
4. Long cache for hashed files (`chunk-*.js`, `*.css`, images) and no/short cache for `index.html`.
   Build output is content-hashed, so new deploys never serve stale code.

## Example: Firebase Hosting

One-time setup (by whoever owns the club's Firebase/Google account):

```bash
bun add -g firebase-tools     # or: npm i -g firebase-tools
firebase login
firebase init hosting          # public directory: dist · single-page app: Yes · GitHub auto-deploys: optional
```

`firebase.json`:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**", "**/*.map"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }],
    "headers": [
      { "source": "/index.html", "headers": [{ "key": "Cache-Control", "value": "no-cache" }] },
      { "source": "**/*.@(js|css|jpg|png)", "headers": [{ "key": "Cache-Control", "value": "public,max-age=31536000,immutable" }] }
    ]
  }
}
```

Deploy:

```bash
bun run check
firebase hosting:channel:deploy preview     # temporary preview URL to review first
firebase deploy --only hosting              # production
```

The project can also deploy from CI (`firebase init hosting:github` adds a workflow that builds and deploys on merge to `main`
and posts preview URLs on PRs). Store the service-account key only in GitHub *Secrets*, never in the repo.

Other hosts (GitHub Pages, Netlify, Cloudflare Pages, Vercel) work the same way: publish `dist/` and add the SPA rewrite
(GitHub Pages needs a copy of `index.html` named `404.html`).

## Custom domain

Point the domain at the host per its instructions, then confirm HTTPS works and `/exec` opens directly.

## Checklist before going live

- [ ] `bun run check` is green
- [ ] Preview URL: lock screen → home → each app opens; reload on `/exec` works
- [ ] Meeting place is no longer TBA (or intentionally so)
- [ ] Member photos/emails are used with consent
- [ ] Someone on the next exec team has access to the hosting account
