// User settings (Settings app). Pure helpers here; the React context is in PrefsProvider.tsx.

import { resolveWallpaper, wallpapers, wallpapersFor } from "./wallpapers";

export type Prefs = { dark: boolean; wallpaper: string; reduceMotion: boolean };

export const defaultPrefs: Prefs = { dark: false, wallpaper: "sky", reduceMotion: false };

/** Reads whatever was saved (possibly old, partial or hand-edited) into a valid Prefs. */
export function sanitizePrefs(raw: unknown): Prefs {
  const o = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const dark = typeof o.dark === "boolean" ? o.dark : defaultPrefs.dark;
  const id = typeof o.wallpaper === "string" && wallpapers.some((w) => w.id === o.wallpaper) ? o.wallpaper : wallpapersFor(dark)[0].id;
  return { dark, wallpaper: resolveWallpaper(id).dark === dark ? id : wallpapersFor(dark)[0].id, reduceMotion: o.reduceMotion === true };
}

/** Switching theme keeps the wallpaper if it suits the new theme, otherwise picks that theme's first one. */
export function withDark(p: Prefs, dark: boolean): Prefs {
  return { ...p, dark, wallpaper: resolveWallpaper(p.wallpaper).dark === dark ? p.wallpaper : wallpapersFor(dark)[0].id };
}
