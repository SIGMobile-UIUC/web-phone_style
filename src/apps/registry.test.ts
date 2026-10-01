import { expect, test } from "bun:test";
import { layoutProblems } from "./layout";
import { appIdFromPath } from "./routes";
import { apps, folders, homeLayout, internalAppIds } from "./registry";

test("every app and folder on the home screen exists, and no app is placed twice", () => {
  expect(layoutProblems(Object.keys(apps), folders, homeLayout)).toEqual([]);
});

test("app ids match their keys; external apps are https links, internal apps have a screen", () => {
  for (const [key, app] of Object.entries(apps)) {
    expect(app.id).toBe(key);
    if (app.href) expect(app.href.startsWith("https://")).toBe(true);
    else expect(app.component, `internal app "${key}" needs a component`).toBeDefined();
  }
});

test("URL paths map to app ids", () => {
  expect(appIdFromPath("/exec", internalAppIds)).toBe("exec");
  expect(appIdFromPath("/exec/", internalAppIds)).toBe("exec");
  expect(appIdFromPath("/", internalAppIds)).toBeNull();
  expect(appIdFromPath("/discord", internalAppIds)).toBeNull(); // external apps have no route
  expect(appIdFromPath("/nope", internalAppIds)).toBeNull();
});
