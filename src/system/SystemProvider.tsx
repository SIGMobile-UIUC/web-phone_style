import { animate, useMotionValue, type MotionValue } from "motion/react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { session } from "../lib/storage";
import { useReducedMotionPref } from "./PrefsProvider";

// `progress` is the single number that drives the lock <-> home transition: 0 = fully locked, 1 = unlocked.
// The lock screen, the home screen and the particle logo all derive their motion from it, so a finger drag
// and the release animation move everything together.

const KEY = "sigmobile.unlocked";

/** Where an icon sat on the phone screen, as % insets from each edge (+ its corner radius in px). */
export type Box = { top: number; right: number; bottom: number; left: number; radius: number };

type System = {
  locked: boolean;
  progress: MotionValue<number>;
  unlock: () => void;
  lock: () => void;
  /** Springs back to fully locked (an unlock drag that wasn't far/fast enough). */
  cancelUnlock: () => void;
  /** Small bounce that hints "swipe up". */
  nudge: () => void;
  /** light = white status-bar text, for apps with a dark screen. */
  statusStyle: "dark" | "light";
  setStatusStyle: (s: "dark" | "light") => void;
  /** The .phone-screen element (attached by PhoneShell). */
  screenRef: RefObject<HTMLDivElement | null>;
  /** Remember where an app icon was, so its window can grow out of it and shrink back into it. */
  rememberOrigin: (appId: string, rect: DOMRect) => void;
  originOf: (appId: string) => Box | undefined;
};

const SystemContext = createContext<System | null>(null);

export function useSystem(): System {
  const s = useContext(SystemContext);
  if (!s) throw new Error("useSystem must be used inside <SystemProvider>");
  return s;
}

export function SystemProvider({ children, startUnlocked = false }: { children: ReactNode; startUnlocked?: boolean }) {
  // Stay unlocked for the rest of the browser session once unlocked. A deep link to an app skips the lock screen.
  const [locked, setLocked] = useState(() => {
    if (startUnlocked) {
      session.set(KEY, "1");
      return false;
    }
    return session.get(KEY) !== "1";
  });
  const progress = useMotionValue(locked ? 0 : 1);
  const reduced = useReducedMotionPref();
  const [statusStyle, setStatusStyle] = useState<"dark" | "light">("dark");
  const screenRef = useRef<HTMLDivElement>(null);
  const origins = useRef(new Map<string, Box>());

  const to = useCallback(
    (target: number, onComplete?: () => void) =>
      animate(
        progress,
        target,
        reduced
          ? { duration: 0.01, onComplete }
          : { type: "spring", stiffness: 190, damping: 27, restDelta: 0.002, onComplete },
      ),
    [progress, reduced],
  );

  const value = useMemo<System>(
    () => ({
      locked,
      progress,
      screenRef,
      statusStyle,
      setStatusStyle,
      unlock: () =>
        to(1, () => {
          session.set(KEY, "1");
          setLocked(false);
        }),
      lock: () => {
        session.set(KEY, "0");
        setLocked(true);
        to(0);
      },
      cancelUnlock: () => void to(0),
      nudge: () => void (!reduced && animate(progress, [0, 0.07, 0], { duration: 0.55 })),
      rememberOrigin: (appId, rect) => {
        const s = screenRef.current?.getBoundingClientRect();
        if (!s) return;
        // Percentages, so it stays correct if the phone is resized before the app closes again.
        origins.current.set(appId, {
          top: ((rect.top - s.top) / s.height) * 100,
          left: ((rect.left - s.left) / s.width) * 100,
          right: ((s.right - rect.right) / s.width) * 100,
          bottom: ((s.bottom - rect.bottom) / s.height) * 100,
          radius: rect.width * 0.225,
        });
      },
      originOf: (appId) => origins.current.get(appId),
    }),
    [locked, progress, reduced, to, statusStyle],
  );

  return <SystemContext value={value}>{children}</SystemContext>;
}
