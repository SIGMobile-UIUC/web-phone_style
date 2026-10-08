import { expect, test } from "bun:test";
import { pointHtmlAtEntry } from "./build-html";

const page = (src: string) => `<head><link rel="stylesheet" crossorigin href="/a.css"><script type="module" crossorigin src="${src}"></script></head><body></body>`;

test("a page that already loads the entry chunk is left alone", () => {
  const html = page("/chunk-entry.js");
  expect(pointHtmlAtEntry(html, "chunk-entry.js", "/")).toEqual({ html, changed: false, was: "/chunk-entry.js" });
});

test("a script pointing at another (shared) chunk is repointed at the entry chunk", () => {
  const r = pointHtmlAtEntry(page("/chunk-shared.js"), "chunk-entry.js", "/");
  expect(r).toEqual({ html: page("/chunk-entry.js"), changed: true, was: "/chunk-shared.js" });
});

test("the public path is part of the URL", () => {
  expect(pointHtmlAtEntry(page("/x.js"), "chunk-entry.js", "/site/").html).toBe(page("/site/chunk-entry.js"));
});

test("no module script, or more than one, fails the build instead of guessing", () => {
  expect(() => pointHtmlAtEntry("<body></body>", "e.js", "/")).toThrow("found 0");
  expect(() => pointHtmlAtEntry(page("/a.js") + page("/b.js"), "e.js", "/")).toThrow("found 2");
});
