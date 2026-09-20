// Dev/production server: serves the single-page app for every URL (so /exec, /calendar … work on reload).
// For real hosting the site is built to static files instead (`bun run build`) — see docs/DEPLOYMENT.md.
import { serve } from "bun";
import index from "./index.html";

serve({
  routes: {
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});
