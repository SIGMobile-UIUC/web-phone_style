import { expect, test } from "bun:test";
import { resources, type Resource } from "../content/resources";
import { domainOf, filterResources, groupByCategory } from "./resources";
import { parseDate } from "./time";

const sample: Resource[] = [
  { category: "A", title: "Alpha docs", url: "https://a.example/x", addedAt: "2026-09-01" },
  { category: "B", title: "Beta", url: "https://b.example", note: "About Flask", addedAt: "2026-09-10" },
  { category: "A", title: "Gamma", url: "https://www.c.example", addedAt: "2026-09-15" },
];

test("search matches title, note and category, ignoring case", () => {
  expect(filterResources(sample, "flask").map((r) => r.title)).toEqual(["Beta"]);
  expect(filterResources(sample, "ALPHA").map((r) => r.title)).toEqual(["Alpha docs"]);
  expect(filterResources(sample, "  ").length).toBe(3);
  expect(filterResources(sample, "b").map((r) => r.category)).toContain("B");
  expect(filterResources(sample, "zzz")).toEqual([]);
});

test("groups keep category order; newest first inside a group", () => {
  const groups = groupByCategory(sample);
  expect(groups.map((g) => g.category)).toEqual(["A", "B"]);
  expect(groups[0].items.map((r) => r.title)).toEqual(["Gamma", "Alpha docs"]);
});

test("domain drops www", () => {
  expect(domainOf("https://www.c.example/path")).toBe("c.example");
});

test("every resource in content/resources.ts is well-formed", () => {
  const urls = new Set<string>();
  for (const r of resources) {
    expect(r.url.startsWith("https://"), `${r.title}: url must be https`).toBe(true);
    expect(() => new URL(r.url)).not.toThrow();
    expect(r.title.trim(), "title").not.toBe("");
    expect(r.category.trim(), "category").not.toBe("");
    expect(() => parseDate(r.addedAt), `${r.title}: addedAt must be a real YYYY-MM-DD date`).not.toThrow();
    expect(urls.has(r.url), `duplicate link: ${r.url}`).toBe(false);
    urls.add(r.url);
  }
});
