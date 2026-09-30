import { expect, test } from "bun:test";
import { layoutProblems, type FolderManifest } from "./layout";

const apps = ["about", "notes", "clock", "music"];
const games: FolderManifest = { id: "games", name: "Games", apps: ["clock", "notes"] };

test("a valid layout with a folder has no problems", () => {
  expect(layoutProblems(apps, { games }, { pages: [["about", "games"]], dock: ["music"] })).toEqual([]);
});

test("unknown ids on the home screen and in folders are reported", () => {
  expect(layoutProblems(apps, {}, { pages: [["about", "nope"]], dock: [] })).toEqual([`page 1 references unknown app or folder "nope"`]);
  const bad: FolderManifest = { id: "bad", name: "Bad", apps: ["ghost"] };
  expect(layoutProblems(apps, { bad }, { pages: [["bad"]], dock: [] })).toEqual([`folder "bad" references unknown app "ghost"`]);
});

test("an app may appear only once, counting the apps inside folders", () => {
  expect(layoutProblems(apps, { games }, { pages: [["games", "clock"]], dock: [] })).toEqual([`"clock" is placed more than once (again in page 1)`]);
  expect(layoutProblems(apps, {}, { pages: [["music"]], dock: ["music"] })).toEqual([`"music" is placed more than once (again in the dock)`]);
});

test("folders must be non-empty, flat, keyed by their id and not share an id with an app", () => {
  const empty: FolderManifest = { id: "empty", name: "Empty", apps: [] };
  expect(layoutProblems(apps, { empty }, { pages: [], dock: [] })).toEqual([`folder "empty" is empty`]);

  const outer: FolderManifest = { id: "outer", name: "Outer", apps: ["games"] };
  expect(layoutProblems(apps, { games, outer }, { pages: [["outer"]], dock: [] })).toEqual([`folder "outer" contains another folder "games"`]);

  expect(layoutProblems(apps, { x: games }, { pages: [], dock: [] })).toEqual([`folder "x" has id "games"`]);
  const clash: FolderManifest = { id: "about", name: "About", apps: ["notes"] };
  expect(layoutProblems(apps, { about: clash }, { pages: [], dock: [] })).toEqual([`"about" is both an app and a folder`]);
});
