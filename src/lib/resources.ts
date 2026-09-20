import type { Resource } from "../content/resources";
import { parseDate } from "./time";

/** Case-insensitive match on title, note and category. An empty query keeps everything. */
export function filterResources(list: Resource[], query: string): Resource[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((r) => [r.title, r.note ?? "", r.category].some((s) => s.toLowerCase().includes(q)));
}

/** Groups by category, keeping the order in which categories first appear; newest links first inside a group. */
export function groupByCategory(list: Resource[]): { category: string; items: Resource[] }[] {
  const groups = new Map<string, Resource[]>();
  for (const r of list) groups.set(r.category, [...(groups.get(r.category) ?? []), r]);
  return [...groups].map(([category, items]) => ({ category, items: [...items].sort((a, b) => b.addedAt.localeCompare(a.addedAt)) }));
}

const DAY = 86_400_000;
const utcMs = (date: string) => {
  const { y, m, d } = parseDate(date);
  return Date.UTC(y, m - 1, d);
};

/** Added within the last `days` days (and not in the future). */
export const isRecent = (addedAt: string, today: string, days = 14): boolean => {
  const age = (utcMs(today) - utcMs(addedAt)) / DAY;
  return age >= 0 && age <= days;
};

/** "reactnative.dev" — shown under each link so people know where it goes. */
export const domainOf = (url: string): string => new URL(url).hostname.replace(/^www\./, "");
