import { animate, useMotionValue, type MotionValue } from "motion/react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { withToggle, initialToggles, type ToggleKey, type Toggles } from "./controlCenterState";
import { useReducedMotionPref } from "./PrefsProvider";

// State of the Control Center: how far it is pulled down (`progress`, 0..1), the little switches, and screen
// brightness. Nothing here talks to a real device — Wi-Fi etc. are only visual — except the ones that map to the
// site (dark mode, music volume, the flashlight glow, brightness dimming).

type ControlCenterApi = {
  progress: MotionValue<number>;
  /** Fully or partly open (the panel accepts clicks and is visible to assistive tech). */
  open: boolean;
  openCC: () => void;
  closeCC: () => void;
  toggleCC: () => void;
  /** Gesture hooks for the pull-down handle and the panel. */
  drag: {
    start: () => void;
    move: (p: number) => void;
    /** `p` = how far open it is now; `vy` = release velocity (px/s, positive = downward). */
    end: (p: number, vy: number, startedOpen: boolean) => void;
  };
  toggles: Toggles;
  setToggle: (key: ToggleKey, value?: boolean) => void;
  /** 0..1 */
  brightness: number;
  setBrightness: (v: number) => void;
};

const Ctx = createContext<ControlCenterApi | null>(null);
export const useControlCenter = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useControlCenter must be used inside <ControlCenterProvider>");
  return c;
};

export function ControlCenterProvider({ children }: { children: ReactNode }) {
  const progress = useMotionValue(0);
  const reduced = useReducedMotionPref();
  const [open, setOpen] = useState(false);
  const [toggles, setToggles] = useState<Toggles>(initialToggles);
  const [brightness, setBrightness] = useState(1);
  const anim = useRef<ReturnType<typeof animate> | null>(null);

  const to = useCallback(
    (target: 0 | 1) => {
      anim.current?.stop();
      if (target === 1) setOpen(true);
      anim.current = animate(
        progress,
        target,
        reduced
          ? { duration: 0.01, onComplete: () => target === 0 && setOpen(false) }
          : { type: "spring", stiffness: 260, damping: 32, restDelta: 0.002, onComplete: () => target === 0 && setOpen(false) },
      );
    },
    [progress, reduced],
  );

  const value = useMemo<ControlCenterApi>(
    () => ({
      progress,
      open,
      openCC: () => to(1),
      closeCC: () => to(0),
      toggleCC: () => to(progress.get() > 0.5 ? 0 : 1),
      drag: {
        start: () => {
          anim.current?.stop();
          setOpen(true);
        },
        move: (p) => progress.set(Math.min(Math.max(p, 0), 1)),
        end: (p, vy, startedOpen) => {
          const shouldOpen = startedOpen ? !(p < 0.7 || vy < -500) : p > 0.3 || vy > 500;
          to(shouldOpen ? 1 : 0);
        },
      },
      toggles,
      setToggle: (key, v) => setToggles((t) => withToggle(t, key, v)),
      brightness,
      setBrightness,
    }),
    [progress, open, to, toggles, brightness],
  );

  return <Ctx value={value}>{children}</Ctx>;
}
