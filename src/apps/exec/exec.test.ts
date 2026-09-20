import { expect, test } from "bun:test";
import { getRoster, listTerms } from "./api";
import { rarityOf, standingHp } from "./roles";

test("roster comes back in the file's order with the term's role", async () => {
  const roster = await getRoster("2026-fall");
  expect(roster.map((m) => m.id)).toEqual(["ari", "mariia", "maple", "riley", "kevin"]);
  expect(roster[0]).toMatchObject({ name: "Ari", role: "President", standing: "Sophomore" });
});

test("unknown term has an empty roster", async () => {
  expect(await getRoster("1999-spring")).toEqual([]);
});

test("term summaries carry the member count", async () => {
  expect(await listTerms()).toEqual([{ id: "2026-fall", year: 2026, semester: "fall", memberCount: 5 }]);
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
