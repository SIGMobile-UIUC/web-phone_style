import { useReducedMotion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { local } from "../lib/storage";
import { defaultPrefs, sanitizePrefs, withDark, type Prefs } from "./prefs";

const KEY = "sigmobile.prefs";

type PrefsApi = {
  prefs: Prefs;
  setDark: (dark: boolean) => void;
  setWallpaper: (id: string) => void;
  setReduceMotion: (on: boolean) => void;
  reset: () => void;
  /** Motion is reduced if the user asked for it here OR their device is set to reduce motion. */
  reducedMotion: boolean;
  /** The device asks for reduced motion (so the Settings switch is forced on). */
  deviceReducesMotion: boolean;
};

const PrefsContext = createContext<PrefsApi | null>(null);

export function usePrefs(): PrefsApi {
  const p = useContext(PrefsContext);
  if (!p) throw new Error("usePrefs must be used inside <PrefsProvider>");
  return p;
}

/** Convenience for components that only need "should I skip animations?". */
export const useReducedMotionPref = () => usePrefs().reducedMotion;

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(() => {
    try {
      return sanitizePrefs(JSON.parse(local.get(KEY) ?? "null"));
    } catch {
      return defaultPrefs;
    }
  });
  const device = !!useReducedMotion();

  useEffect(() => local.set(KEY, JSON.stringify(prefs)), [prefs]);

  const setDark = useCallback((dark: boolean) => setPrefs((p) => withDark(p, dark)), []);
  const setWallpaper = useCallback((wallpaper: string) => setPrefs((p) => sanitizePrefs({ ...p, wallpaper })), []);
  const setReduceMotion = useCallback((reduceMotion: boolean) => setPrefs((p) => ({ ...p, reduceMotion })), []);
  const reset = useCallback(() => setPrefs(defaultPrefs), []);

  const value = useMemo<PrefsApi>(
    () => ({ prefs, setDark, setWallpaper, setReduceMotion, reset, reducedMotion: prefs.reduceMotion || device, deviceReducesMotion: device }),
    [prefs, device, setDark, setWallpaper, setReduceMotion, reset],
  );
  return <PrefsContext value={value}>{children}</PrefsContext>;
}
