import { expect, test } from "bun:test";
import { appIdFromPath } from "./routes";
import { apps, homeLayout, internalAppIds } from "./registry";

test("every app on the home screen exists, and none is placed twice", () => {
  const placed = [...homeLayout.pages.flat(), ...homeLayout.dock];
  for (const id of placed) expect(apps[id], `homeLayout references unknown app "${id}"`).toBeDefined();
  expect(new Set(placed).size).toBe(placed.length);
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
