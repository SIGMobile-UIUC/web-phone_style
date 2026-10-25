import type { Resource } from "../content/resources";

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

/** "reactnative.dev" — shown under each link so people know where it goes. */
export const domainOf = (url: string): string => new URL(url).hostname.replace(/^www\./, "");
