import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { Suspense, useEffect, useRef, useState } from "react";
import type { AppManifest } from "../apps/registry";
import { useReducedMotionPref } from "./PrefsProvider";
import { useSystem, type Box } from "./SystemProvider";
import { useCloseApp } from "./useCloseApp";

const FULL = "inset(0% 0% 0% 0% round 0px)";
const clamp = (v: number, min = 0, max = 1) => Math.min(Math.max(v, min), max);

// Opened by URL (no icon was tapped): grow from a small square in the middle of the screen.
const FROM_CENTER: Box = { top: 46, right: 42, bottom: 46, left: 42, radius: 14 };

/** The clip-path that makes the window look like the icon tile it grows out of. All % insets, so it needs no measuring. */
const clipFrom = (b: Box = FROM_CENTER): string => `inset(${b.top}% ${b.right}% ${b.bottom}% ${b.left}% round ${b.radius}px)`;

/**
 * An open app. It grows out of its icon (clip-path), and closes by shrinking back into it — from the Esc key,
 * a tap on the bottom bar, the browser's back button, or by dragging the bottom bar up (the window follows).
 */
export default function AppWindow({ app }: { app: AppManifest }) {
  const { screenRef, originOf } = useSystem();
  const close = useCloseApp();
  const reduced = useReducedMotionPref();
  const Screen = app.component!;
  const contentRef = useRef<HTMLDivElement>(null);

  // Computed once at mount: exit reuses the same shape, even after the icon's rect is forgotten.
  const [from] = useState(() => clipFrom(originOf(app.id)));

  // Drag-to-close: 0 = at rest, 1 = pulled all the way up.
  const pull = useMotionValue(0);
  const scale = useTransform(pull, [0, 1], [1, 0.8]);
  const radius = useTransform(pull, [0, 1], [0, 44]);
  const pullFor = (offsetY: number) => clamp(-offsetY / ((screenRef.current?.clientHeight ?? 800) * 0.4));

  useEffect(() => {
    contentRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const spring = reduced ? { duration: 0.01 } : ({ type: "spring", stiffness: 240, damping: 30 } as const);

  return (
    <motion.div
      className="app-window"
      style={{ scale, borderRadius: radius, background: `linear-gradient(155deg, ${app.colors[0]}, ${app.colors[1]})` }}
      initial={{ clipPath: reduced ? FULL : from, opacity: reduced ? 0 : 1 }}
      animate={{ clipPath: FULL, opacity: 1 }}
      exit={{ clipPath: reduced ? FULL : from, opacity: reduced ? 0 : 1 }}
      transition={spring}
    >
      <motion.div
        ref={contentRef}
        tabIndex={-1}
        className="app-window__content"
        aria-label={app.name}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0.01 : 0.22 }}
      >
        <Suspense fallback={null}>
          <Screen />
        </Suspense>
      </motion.div>

      <motion.button
        type="button"
        className="app-window__bar"
        aria-label="Close app and go home"
        onPan={(_, info) => pull.set(pullFor(info.offset.y))}
        onPanEnd={(_, info) =>
          pullFor(info.offset.y) > 0.3 || info.velocity.y < -500 ? close() : void animate(pull, 0, { type: "spring", stiffness: 300, damping: 30 })
        }
        onTap={close}
      >
        <span className="home-indicator" />
      </motion.button>
    </motion.div>
  );
}
