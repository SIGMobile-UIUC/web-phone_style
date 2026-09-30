import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { useReducedMotionPref } from "../../../system/PrefsProvider";
import AppFrame from "../../../ui/AppFrame";
import { ArrowPad, GameOverlay, Stat, useArrowKeys, useRecord, useSwipe, type Dir } from "../shared";
import { newSnake, step, stepMs, turn } from "./snake";
import "./snake.css";

const SIZE = 16;

/** Snake: steer with swipes, arrow keys or the pad; eat to grow. Logic in snake.ts. */
export default function SnakeApp() {
  const [snake, setSnake] = useState(() => newSnake(SIZE));
  const [phase, setPhase] = useState<"ready" | "playing" | "paused">("ready");
  /** Bumped on restart so the segments don't glide back from where the last game ended. */
  const [gameId, setGameId] = useState(0);
  const reduced = useReducedMotionPref();
  const best = useRecord("snake", snake.score);
  const ms = stepMs(snake.score);

  useEffect(() => {
    if (phase !== "playing" || snake.over) return;
    const id = setInterval(() => setSnake((s) => step(s)), ms);
    return () => clearInterval(id);
  }, [phase, snake.over, ms]);

  const steer = (dir: Dir) => {
    if (snake.over) return;
    setSnake((s) => turn(s, dir));
    setPhase("playing");
  };
  const restart = () => {
    setSnake(newSnake(SIZE));
    setPhase("ready");
    setGameId((n) => n + 1);
  };
  const togglePause = () => setPhase((p) => (p === "playing" ? "paused" : p === "paused" ? "playing" : p));

  useArrowKeys(steer);
  const swipe = useSwipe(steer, 16);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== " " && e.key !== "p" && e.key !== "P") return;
      e.preventDefault();
      togglePause();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const cell = (x: number, y: number): CSSProperties => ({ left: `${(x / SIZE) * 100}%`, top: `${(y / SIZE) * 100}%` });
  // Segments glide from cell to cell over exactly one step, which makes the motion look continuous.
  const glide: CSSProperties = reduced ? {} : { transition: `left ${ms}ms linear, top ${ms}ms linear` };

  return (
    <AppFrame title="Snake">
      <div className="game-bar">
        <Stat label="Score" value={snake.score} />
        <Stat label="Best" value={best ?? 0} />
        <button
          type="button"
          className="ui-button ui-button--soft"
          onClick={togglePause}
          disabled={phase === "ready" || snake.over}
          aria-label={phase === "paused" ? "Resume" : "Pause"}
        >
          {phase === "paused" ? <Play aria-hidden /> : <Pause aria-hidden />}
        </button>
      </div>

      <div className="game-board snake" {...swipe} style={{ "--cells": SIZE } as CSSProperties} role="group" aria-label="Snake board">
        <div key={gameId}>
          {snake.food && <span className="snake__food" style={cell(snake.food.x, snake.food.y)} aria-hidden />}
          {snake.body.map((p, i) => (
            <span key={i} className={`snake__seg${i === 0 ? " snake__seg--head" : ""}`} style={{ ...cell(p.x, p.y), ...glide }} aria-hidden />
          ))}
        </div>

        {phase === "ready" && <GameOverlay title="Snake" text="Swipe, press an arrow key or tap the pad to start." />}
        {phase === "paused" && !snake.over && (
          <GameOverlay title="Paused">
            <button type="button" className="ui-button" onClick={togglePause}>
              <Play aria-hidden /> Resume
            </button>
          </GameOverlay>
        )}
        {snake.over && (
          <GameOverlay title={snake.food ? "Game over" : "You filled the board!"} text={`You ate ${snake.score} ${snake.score === 1 ? "apple" : "apples"}.`}>
            <button type="button" className="ui-button" onClick={restart}>
              <RotateCcw aria-hidden /> Play again
            </button>
          </GameOverlay>
        )}
      </div>

      <ArrowPad onDir={steer} />
      <p className="game-help">Space pauses. Don't hit the walls or yourself.</p>
    </AppFrame>
  );
}
