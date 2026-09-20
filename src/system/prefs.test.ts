import { expect, test } from "bun:test";
import { defaultPrefs, sanitizePrefs, withDark } from "./prefs";
import { resolveWallpaper, wallpapers, wallpapersFor } from "./wallpapers";

test("every theme has at least one wallpaper, ids are unique", () => {
  expect(wallpapersFor(false).length).toBeGreaterThan(0);
  expect(wallpapersFor(true).length).toBeGreaterThan(0);
  expect(new Set(wallpapers.map((w) => w.id)).size).toBe(wallpapers.length);
});

test("saved settings are sanitised", () => {
  expect(sanitizePrefs(null)).toEqual(defaultPrefs);
  expect(sanitizePrefs("nope")).toEqual(defaultPrefs);
  expect(sanitizePrefs({ dark: true, wallpaper: "midnight", reduceMotion: true })).toEqual({ dark: true, wallpaper: "midnight", reduceMotion: true });
  expect(sanitizePrefs({ wallpaper: "deleted-one" }).wallpaper).toBe("ocean"); // unknown id -> first light wallpaper
  expect(sanitizePrefs({ dark: true, wallpaper: "sky" }).wallpaper).toBe("night"); // light wallpaper on dark theme -> a dark one
  expect(sanitizePrefs({ reduceMotion: "yes" }).reduceMotion).toBe(false);
});

test("switching theme keeps a suitable wallpaper and swaps an unsuitable one", () => {
  expect(withDark({ ...defaultPrefs, wallpaper: "ocean" }, true).wallpaper).toBe("night");
  expect(withDark({ ...defaultPrefs, dark: true, wallpaper: "midnight" }, true).wallpaper).toBe("midnight");
  expect(withDark({ dark: true, wallpaper: "midnight", reduceMotion: false }, false).wallpaper).toBe("ocean");
  expect(resolveWallpaper("nope").id).toBe("ocean");
});
