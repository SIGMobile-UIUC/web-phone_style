import { expect, test } from "bun:test";
import { getTerm } from "../../content/terms";
import { getRoster, listTerms } from "./api";
import { rarityOf, roleStyle, standingHp } from "./roles";

test("role keywords pick the card style; the first match wins", () => {
  expect(roleStyle("Development").type.name).toBe("Grass");
  expect(roleStyle("Software Developer").type.name).toBe("Grass");
  expect(roleStyle("Infra & Dev").type.name).toBe("Metal"); // infra comes before dev
  expect(roleStyle("President").type.name).toBe("Dragon");
  expect(roleStyle("Member").type.name).toBe("Colorless");
  expect(roleStyle("Development").rarity).toBe("rare holo"); // no louder than the default foil
});

test("roster comes back in the file's order with the term's role", async () => {
  const roster = await getRoster("2026-fall");
  expect(roster.map((m) => m.id)).toEqual(getTerm("2026-fall")!.members.map((m) => m.id)); // not a hard-coded list: adding a member must not break this
  expect(roster[0]).toMatchObject({ name: "Ari", role: "President", standing: "Sophomore" });
});

test("unknown term has an empty roster", async () => {
  expect(await getRoster("1999-spring")).toEqual([]);
});

test("term summaries carry the member count", async () => {
  expect(await listTerms()).toEqual([{ id: "2026-fall", year: 2026, semester: "fall", memberCount: getTerm("2026-fall")!.members.length }]);
});

test("rarity: explicit override > past term > role default", async () => {
  const [ari, , maple] = await getRoster("2026-fall");
  expect(rarityOf(ari, true)).toBe("rare rainbow");
  expect(rarityOf(maple, true)).toBe("rare secret");
  expect(rarityOf(ari, false)).toBe("reverse holo");
  expect(rarityOf({ ...ari, rarity: "rare holo" }, false)).toBe("rare holo");
});

test("HP follows class standing, unknown standing has none", () => {
  expect(standingHp("Senior")).toBe(150);
  expect(standingHp("sophomore")).toBe(90);
  expect(standingHp("Alum")).toBeUndefined();
});
