// Small pieces shared by the games in the Games folder: input (swipe + arrow keys), a remembered record, and the
// stat chips / overlay they all show.

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { local } from "../../lib/storage";
import "./games.css";

export type Dir = "up" | "down" | "left" | "right";

const KEY_DIRS: Record<string, Dir> = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  w: "up", s: "down", a: "left", d: "right", W: "up", S: "down", A: "left", D: "right",
};

/** Arrow keys (and WASD) while the game is open. */
export function useArrowKeys(onDir: (dir: Dir) => void) {
  const latest = useRef(onDir);
  useEffect(() => {
    latest.current = onDir;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = KEY_DIRS[e.key];
      if (!dir || e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault(); // otherwise the arrows also scroll the page
      latest.current(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

/**
 * True when the pointer went down on a button or link inside a board (e.g. "Play again" in the overlay). A board that
 * captures the pointer must leave those alone: capture redirects the click to the board, so the button would never fire.
 */
export const onControl = (e: PointerEvent<HTMLElement>) => (e.target as Element).closest("button, a") !== null;

/** Pointer handlers that report one swipe per gesture (touch or mouse). The element needs `touch-action: none`. */
export function useSwipe(onSwipe: (dir: Dir) => void, minPx = 24) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (onControl(e)) return;
      start.current = { x: e.clientX, y: e.clientY };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerUp: (e: PointerEvent<HTMLElement>) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < minPx) return;
      onSwipe(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
    },
    onPointerCancel: () => {
      start.current = null;
    },
  };
}

/**
 * A game's record, remembered in this browser. Pass the current result (null = nothing to record yet); a better one
 * is saved. Higher is better unless `lowerIsBetter` (e.g. a time).
 */
export function useRecord(game: string, value: number | null, lowerIsBetter = false): number | null {
  const key = `sigmobile.best.${game}`;
  const [best, setBest] = useState<number | null>(() => {
    const n = Number(local.get(key));
    return Number.isFinite(n) && n > 0 ? n : null;
  });
  const better = value !== null && value > 0 && (best === null || (lowerIsBetter ? value < best : value > best));
  useEffect(() => {
    if (!better) return;
    setBest(value);
    local.set(key, String(value));
  }, [better, value, key]);
  return better ? value : best;
}

/** A small labelled number (Score, Best, Mines …). */
export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="game-stat">
      <span className="game-stat__label">{label}</span>
      <span className="game-stat__value">{value}</span>
    </div>
  );
}

/** A message over the board (game over, you win, tap to start). */
export function GameOverlay({ title, text, children }: { title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="game-overlay" role="status">
      <div className="game-overlay__title">{title}</div>
      {text && <div className="game-overlay__text">{text}</div>}
      {children}
    </div>
  );
}

const PAD = [
  { dir: "up", Icon: ChevronUp },
  { dir: "left", Icon: ChevronLeft },
  { dir: "down", Icon: ChevronDown },
  { dir: "right", Icon: ChevronRight },
] as const;

/** On-screen arrow buttons, for mouse users and anyone who prefers buttons to swiping. */
export function ArrowPad({ onDir }: { onDir: (dir: Dir) => void }) {
  return (
    <div className="game-pad">
      {PAD.map(({ dir, Icon }) => (
        // pointerdown, not click: a click waits for the finger to lift, which feels laggy in a game. A click with
        // detail 0 comes from the keyboard (Enter/Space), which fires no pointerdown.
        <button
          key={dir}
          type="button"
          className={`game-pad__${dir}`}
          aria-label={`Move ${dir}`}
          onPointerDown={() => onDir(dir)}
          onClick={(e) => e.detail === 0 && onDir(dir)}
        >
          <Icon aria-hidden />
        </button>
      ))}
    </div>
  );
}
