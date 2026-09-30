import { Bomb, Flag, Pickaxe, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import AppFrame from "../../../ui/AppFrame";
import { Stat, useRecord } from "../shared";
import { chord, flagsLeft, newField, reveal, toggleFlag, type Minefield } from "./minesweeper";
import "./minesweeper.css";

const LONG_PRESS_MS = 380;

/** Minesweeper, 9×9 with 10 mines. Tap to dig; long-press, right-click or Flag mode to flag. Logic in minesweeper.ts. */
export default function MinesweeperApp() {
  const [field, setField] = useState(() => newField());
  const [mode, setMode] = useState<"dig" | "flag">("dig");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const press = useRef<{ timer: ReturnType<typeof setTimeout>; fired: boolean } | null>(null);

  const ended = field.status === "won" || field.status === "lost";
  const seconds = startedAt ? Math.floor(((endedAt ?? now) - startedAt) / 1000) : 0;
  const best = useRecord("minesweeper", field.status === "won" ? Math.max(1, seconds) : null, true);

  useEffect(() => {
    if (field.status !== "playing") return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [field.status]);
  useEffect(() => () => clearTimeout(press.current?.timer), []);

  const update = (next: Minefield) => {
    if (next === field) return;
    const t = Date.now();
    if (field.status === "ready" && next.status !== "ready") setStartedAt(t);
    if (next.status === "won" || next.status === "lost") setEndedAt(t);
    setNow(t);
    setField(next);
  };
  const restart = () => {
    setField(newField());
    setStartedAt(null);
    setEndedAt(null);
  };

  const flag = (i: number) => update(toggleFlag(field, i));
  const tap = (i: number) => {
    if (field.cells[i].open) update(chord(field, i));
    else if (mode === "flag") flag(i);
    else update(reveal(field, i));
  };

  // Long-press flags on touch screens. The click that follows the long press is then ignored.
  const startPress = (i: number) => {
    clearTimeout(press.current?.timer);
    const p = {
      fired: false,
      timer: setTimeout(() => {
        p.fired = true;
        flag(i);
      }, LONG_PRESS_MS),
    };
    press.current = p;
  };
  const cancelPress = () => clearTimeout(press.current?.timer);

  return (
    <AppFrame title="Minesweeper">
      <div className="game-bar">
        <Stat label="Mines" value={flagsLeft(field)} />
        <Stat label="Time" value={`${seconds}s`} />
        <Stat label="Best" value={best ? `${best}s` : "—"} />
        <button type="button" className="ui-button ui-button--soft" onClick={restart} aria-label="New game">
          <RotateCcw aria-hidden />
        </button>
      </div>

      <div className="game-board mines" role="grid" aria-label="Minefield" style={{ "--cols": field.w } as CSSProperties}>
        {Array.from({ length: field.h }, (_, y) => (
          <div className="mines__row" role="row" key={y}>
            {field.cells.slice(y * field.w, (y + 1) * field.w).map((c, x) => {
              const i = y * field.w + x;
              const wrongFlag = field.status === "lost" && c.flagged && !c.mine;
              const label = c.open ? (c.mine ? "mine" : c.near ? `${c.near}` : "empty") : c.flagged ? "flagged" : "hidden";
              return (
                <button
                  key={i}
                  type="button"
                  role="gridcell"
                  className={`mines__cell${c.open ? " is-open" : ""}${i === field.exploded ? " is-exploded" : ""}`}
                  data-near={c.open && !c.mine ? c.near : undefined}
                  aria-label={`Row ${y + 1}, column ${x + 1}: ${label}`}
                  disabled={ended}
                  onPointerDown={(e) => e.button === 0 && startPress(i)}
                  onPointerUp={cancelPress}
                  onPointerLeave={cancelPress}
                  onPointerCancel={cancelPress}
                  onClick={() => {
                    if (press.current?.fired) press.current.fired = false; // this click ends a long press
                    else tap(i);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    cancelPress();
                    if (!press.current?.fired) flag(i);
                  }}
                  onKeyDown={(e) => (e.key === "f" || e.key === "F") && flag(i)}
                >
                  {c.open && c.mine ? <Bomb aria-hidden /> : wrongFlag ? <X aria-hidden /> : c.flagged ? <Flag aria-hidden /> : c.open && c.near ? c.near : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {ended ? (
        <div className="ui-card mines__result" role="status">
          <div className="mines__result-title">{field.status === "won" ? `Cleared in ${seconds}s!` : "Boom!"}</div>
          <p className="ui-card__text">{field.status === "won" ? "Every mine found. Nicely swept." : "You hit a mine. Every mine is shown now."}</p>
          <button type="button" className="ui-button" onClick={restart}>
            <RotateCcw aria-hidden /> Play again
          </button>
        </div>
      ) : (
        <div className="mines__modes" role="radiogroup" aria-label="What a tap does">
          <button type="button" role="radio" aria-checked={mode === "dig"} className={mode === "dig" ? "is-on" : ""} onClick={() => setMode("dig")}>
            <Pickaxe aria-hidden /> Dig
          </button>
          <button type="button" role="radio" aria-checked={mode === "flag"} className={mode === "flag" ? "is-on" : ""} onClick={() => setMode("flag")}>
            <Flag aria-hidden /> Flag
          </button>
        </div>
      )}
      <p className="game-help">Long-press or right-click to flag (F on the keyboard). Tap a number whose mines are flagged to open around it.</p>
    </AppFrame>
  );
}
