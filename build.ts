#!/usr/bin/env bun
// Production build: bundles src/index.html into ./dist (static files, ready for any static host).
//   bun run build            -> dist/
//   bun run build.ts --outdir=out
import plugin from "bun-plugin-tailwind";
import { rm } from "fs/promises";
import path from "path";

const outArg = process.argv.find((a) => a.startsWith("--outdir="));
const outdir = path.resolve(outArg ? outArg.slice("--outdir=".length) : "dist");

await rm(outdir, { recursive: true, force: true });

const start = performance.now();
const result = await Bun.build({
  entrypoints: ["src/index.html"],
  outdir,
  plugins: [plugin],
  minify: true,
  splitting: true, // lazy-loaded apps become separate chunks
  target: "browser",
  sourcemap: "linked",
  publicPath: "/", // absolute asset URLs so deep links like /exec/... still load them
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
console.table(
  result.outputs.map((o) => ({ file: path.relative(process.cwd(), o.path), kind: o.kind, size: kb(o.size) })),
);
console.log(`Built in ${(performance.now() - start).toFixed(0)}ms -> ${path.relative(process.cwd(), outdir) || "."}`);
