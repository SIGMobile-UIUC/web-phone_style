import { Heart, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { usePrefs } from "../../../system/PrefsProvider";
import AppFrame from "../../../ui/AppFrame";
import { GameOverlay, Stat, useRecord } from "../shared";
import { BALL_R, H, LIVES, movePaddle, newBreakout, PADDLE_H, PADDLE_W, PADDLE_Y, serve, stepBreakout, W, type Breakout } from "./breakout";
import "./breakout.css";

const KEY_SPEED = 420; // paddle speed with the arrow keys, field units per second
const ROW_COLORS = ["#7c5cff", "#c43fcf", "#ff5f7e", "#ff9f40", "#ffc93c", "#3aa7de"];

type Hud = Pick<Breakout, "score" | "lives" | "status">;
const hudOf = (g: Breakout): Hud => ({ score: g.score, lives: g.lives, status: g.status });

/**
 * Breakout: drag (or ←/→) to move the paddle, tap (or Space) to launch. The game runs in a requestAnimationFrame
 * loop on a ref and draws to a canvas; React only re-renders when the score, lives or status change. Logic in breakout.ts.
 */
export default function BreakoutApp() {
  const dark = usePrefs().prefs.dark;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const game = useRef(newBreakout());
  const keys = useRef({ left: false, right: false });
  const [hud, setHud] = useState<Hud>(() => hudOf(game.current));
  const best = useRecord("breakout", hud.score);

  const launch = () => {
    game.current = serve(game.current, (Math.random() - 0.5) * 0.6);
  };
  const restart = () => {
    game.current = newBreakout();
    setHud(hudOf(game.current));
  };

  // The loop: input → physics → draw → HUD.
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const ink = dark ? "#e8f4fb" : "#0b2a3b";
    const paddleColor = dark ? "#6cc3ee" : "#1f86bd";
    let shown = hudOf(game.current);
    let last = performance.now();
    let raf = 0;

    const draw = (g: Breakout) => {
      const dpr = window.devicePixelRatio || 1;
      const px = Math.round(canvas.clientWidth * dpr);
      if (canvas.width !== px) {
        canvas.width = px;
        canvas.height = Math.round((px * H) / W);
      }
      const k = canvas.width / W;
      ctx.setTransform(k, 0, 0, k, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (const b of g.bricks) {
        if (!b.alive) continue;
        ctx.fillStyle = ROW_COLORS[b.row % ROW_COLORS.length];
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 4);
        ctx.fill();
      }
      ctx.fillStyle = paddleColor;
      ctx.beginPath();
      ctx.roundRect(g.paddle - PADDLE_W / 2, PADDLE_Y, PADDLE_W, PADDLE_H, PADDLE_H / 2);
      ctx.fill();
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.arc(g.ball.x, g.ball.y, BALL_R, 0, Math.PI * 2);
      ctx.fill();
    };

    const frame = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      let g = game.current;
      const dir = Number(keys.current.right) - Number(keys.current.left);
      if (dir) g = movePaddle(g, g.paddle + dir * KEY_SPEED * Math.min(dt, 0.05));
      g = stepBreakout(g, dt);
      game.current = g;
      draw(g);
      if (g.score !== shown.score || g.lives !== shown.lives || g.status !== shown.status) setHud((shown = hudOf(g)));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [dark]);

  useEffect(() => {
    const set = (e: KeyboardEvent, down: boolean) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.current.left = down;
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.current.right = down;
      else if (down && (e.key === " " || e.key === "ArrowUp")) launch();
      else return;
      e.preventDefault();
    };
    const onDown = (e: KeyboardEvent) => set(e, true);
    const onUp = (e: KeyboardEvent) => set(e, false);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  // The paddle follows the finger (while touching) or the mouse (hovering).
  const follow = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" && e.buttons === 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    game.current = movePaddle(game.current, ((e.clientX - r.left) / r.width) * W);
  };

  const fresh = hud.status === "serve" && hud.lives === LIVES && hud.score === 0;

  return (
    <AppFrame title="Breakout">
      <div className="game-bar">
        <Stat label="Score" value={hud.score} />
        <Stat label="Best" value={best ?? 0} />
        <Stat
          label="Lives"
          value={
            <span className="breakout__lives" aria-label={`${hud.lives} of ${LIVES}`}>
              {Array.from({ length: LIVES }, (_, i) => (
                <Heart key={i} aria-hidden className={i < hud.lives ? "is-full" : ""} />
              ))}
            </span>
          }
        />
      </div>

      <div
        className="game-board breakout"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          follow(e);
        }}
        onPointerMove={follow}
        onClick={() => hud.status === "serve" && launch()}
      >
        <canvas ref={canvasRef} className="breakout__canvas" aria-label={`Breakout. Score ${hud.score}, ${hud.lives} lives left.`} role="img" />

        {fresh && <GameOverlay title="Breakout" text="Drag to move the paddle, tap to launch. Arrow keys and Space work too." />}
        {hud.status === "won" && (
          <GameOverlay title="You cleared it!" text={`Every brick is gone. Score: ${hud.score}.`}>
            <button type="button" className="ui-button" onClick={restart}>
              <RotateCcw aria-hidden /> Play again
            </button>
          </GameOverlay>
        )}
        {hud.status === "over" && (
          <GameOverlay title="Game over" text={`You scored ${hud.score}.`}>
            <button type="button" className="ui-button" onClick={restart}>
              <RotateCcw aria-hidden /> Try again
            </button>
          </GameOverlay>
        )}
      </div>
      <p className="game-help">{hud.status === "serve" && !fresh ? "Tap or press Space to launch the next ball." : "Hit the ball with the edge of the paddle to aim it."}</p>
    </AppFrame>
  );
}
