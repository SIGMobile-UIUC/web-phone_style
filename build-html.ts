// Used by build.ts. With `splitting: true`, some Bun versions (seen on Vercel's) point index.html's <script> at a shared
// chunk instead of the real entry chunk. The build still "succeeds", but no code mounts the app: a blank page, no errors.
// Bun's own build report knows the right file, so build.ts uses this to repoint the script (or fail the build).

const MODULE_SCRIPT = /(<script\b[^>]*\btype="module"[^>]*\bsrc=")([^"]+)(")/g;

/** `entryFile` is a bare file name like "chunk-abc.js". Throws unless the page has exactly one module <script>. */
export function pointHtmlAtEntry(html: string, entryFile: string, publicPath: string): { html: string; changed: boolean; was: string } {
  const scripts = [...html.matchAll(MODULE_SCRIPT)];
  if (scripts.length !== 1) throw new Error(`index.html: expected exactly one module <script>, found ${scripts.length}`);
  const wanted = publicPath + entryFile;
  const was = scripts[0][2];
  if (was === wanted) return { html, changed: false, was };
  return { html: html.replace(MODULE_SCRIPT, (_all, open: string, _src: string, close: string) => open + wanted + close), changed: true, was };
}
