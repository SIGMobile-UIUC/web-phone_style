// Port of the interaction logic in simeydotme/pokemon-cards-css `Card.svelte` (GPL-3.0,
// Copyright (C) 2022 Simon Goellner) to React. State lives in springs and is written
// straight to CSS variables on the card element, so pointer moves never re-render React.
import { useEffect, useLayoutEffect, useRef, type PointerEvent, type RefObject } from "react";
import { createSpring, type SpringSetOptions } from "./card/spring";

const INTERACT = { stiffness: 0.066, damping: 0.25 };
const POPOVER = { stiffness: 0.033, damping: 0.45 };
const SNAP = { stiffness: 0.01, damping: 0.06 };

const round = (v: number, precision = 3) => parseFloat(v.toFixed(precision));
const clamp = (v: number, min = 0, max = 100) => Math.min(Math.max(v, min), max);
const adjust = (v: number, fromMin: number, fromMax: number, toMin: number, toMax: number) =>
  round(toMin + ((toMax - toMin) * (v - fromMin)) / (fromMax - fromMin));

/** The area an expanded card grows into: the phone screen it lives in, or the whole window on a plain page. */
function viewOf(el: HTMLElement) {
  const screen = el.closest(".phone-screen");
  if (screen) {
    const r = screen.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }
  const v = document.documentElement;
  return { left: 0, top: 0, width: v.clientWidth, height: v.clientHeight };
}

/** iOS 13+ only delivers deviceorientation after a permission prompt, which needs a user gesture. */
export function requestOrientationPermission() {
  const D = (typeof DeviceOrientationEvent === "undefined" ? undefined : DeviceOrientationEvent) as
    | (typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> })
    | undefined;
  D?.requestPermission?.().catch(() => {});
}

type Options = {
  active: boolean;
  /** Another card is expanded; this one must ignore the pointer. */
  blocked: boolean;
  showcase: boolean;
  reducedMotion: boolean;
};

export function useCardTilt(ref: RefObject<HTMLDivElement | null>, opts: Options) {
  const optsRef = useRef(opts);
  useLayoutEffect(() => {
    optsRef.current = opts; // not during render, so a discarded render can't leak options into the engine
  });

  const engineRef = useRef<ReturnType<typeof createEngine> | null>(null);
  engineRef.current ??= createEngine(() => ref.current, () => optsRef.current);
  const engine = engineRef.current;

  // Expand / collapse, plus the gyroscope while expanded (order matches the original).
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (opts.active) engine.popover();
    else engine.retreat();
  }, [opts.active, engine]);

  useEffect(() => {
    if (!opts.active) return;
    let base: { g: number; b: number } | null = null;
    engine.orientate(0, 0);
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return; // desktops without a sensor
      base ??= { g: e.gamma, b: e.beta };
      engine.orientate(e.gamma - base.g, e.beta - base.b);
    };
    window.addEventListener("deviceorientation", onOrientation, true);
    return () => window.removeEventListener("deviceorientation", onOrientation, true);
  }, [opts.active, engine]);

  // Keep the expanded card centered when the page scrolls or resizes.
  useEffect(() => {
    if (!opts.active) return;
    let timer: number;
    const recenter = () => {
      clearTimeout(timer);
      timer = window.setTimeout(engine.setCenter, 300);
    };
    // Capture phase so scrolling inside the app's own scroll container (not just the window) is noticed.
    window.addEventListener("scroll", recenter, true);
    window.addEventListener("resize", recenter);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", recenter, true);
      window.removeEventListener("resize", recenter);
    };
  }, [opts.active, engine]);

  useEffect(() => {
    const onVisibility = () => {
      engine.endShowcase();
      engine.reset();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [engine]);

  useEffect(() => {
    if (opts.showcase && !opts.reducedMotion) return engine.startShowcase();
  }, [opts.showcase, opts.reducedMotion, engine]);

  useEffect(() => engine.dispose, [engine]);

  return {
    onPointerMove: (e: PointerEvent<HTMLElement>) => engine.interact(e),
    onPointerLeave: () => engine.interactEnd(),
  };
}

function createEngine(getEl: () => HTMLDivElement | null, getOpts: () => Options) {
  // Each spring gets its own config copy: the config is mutated per phase (interact / snap / showcase).
  const rotate = createSpring([0, 0], { ...INTERACT });
  const glare = createSpring([50, 50, 0], { ...INTERACT });
  const background = createSpring([50, 50], { ...INTERACT });
  const rotateDelta = createSpring([0, 0], { ...POPOVER });
  const translate = createSpring([0, 0], { ...POPOVER });
  const scale = createSpring([1], { ...POPOVER });
  const interactive = [rotate, glare, background];
  const all = [...interactive, rotateDelta, translate, scale];

  let raf = 0;
  let lastTime = 0;
  let endTimer: number | undefined;
  let firstPop = true;
  let cancelShowcase: (() => void) | null = null;

  const write = () => {
    const el = getEl();
    if (!el) return;
    const [rx, ry] = rotate.value;
    const [rdx, rdy] = rotateDelta.value;
    const [gx, gy, go] = glare.value;
    const [bx, by] = background.value;
    const [tx, ty] = translate.value;
    const vars: Record<string, string | number> = {
      "--pointer-x": `${gx}%`,
      "--pointer-y": `${gy}%`,
      "--pointer-from-center": clamp(Math.hypot(gy - 50, gx - 50) / 50, 0, 1),
      "--pointer-from-top": gy / 100,
      "--pointer-from-left": gx / 100,
      "--card-opacity": go,
      "--rotate-x": `${rx + rdx}deg`,
      "--rotate-y": `${ry + rdy}deg`,
      "--background-x": `${bx}%`,
      "--background-y": `${by}%`,
      "--card-scale": scale.value[0],
      "--translate-x": `${tx}px`,
      "--translate-y": `${ty}px`,
    };
    for (const k in vars) el.style.setProperty(k, String(vars[k]));
  };

  const frame = (now: number) => {
    const dt = Math.min(((now - lastTime) * 60) / 1000, 4);
    lastTime = now;
    let moving = false;
    for (const s of all) moving = s.tick(dt) || moving;
    write();
    raf = moving ? requestAnimationFrame(frame) : 0;
  };

  const kick = () => {
    if (raf) return;
    lastTime = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const move = (s: ReturnType<typeof createSpring>, v: number[], o?: SpringSetOptions) => {
    s.set(v, o);
    kick();
  };

  const setInteracting = (on: boolean) => getEl()?.toggleAttribute("data-interacting", on);

  const useInteractConfig = () => {
    for (const s of interactive) Object.assign(s.config, INTERACT);
  };

  const interactEnd = (delay = 500) => {
    clearTimeout(endTimer);
    endTimer = window.setTimeout(() => {
      setInteracting(false);
      for (const s of interactive) Object.assign(s.config, SNAP);
      move(rotate, [0, 0], { soft: 1 });
      move(glare, [50, 50, 0], { soft: 1 });
      move(background, [50, 50], { soft: 1 });
    }, delay);
  };

  const endShowcase = () => {
    cancelShowcase?.();
    cancelShowcase = null;
  };

  const setCenter = () => {
    const el = getEl();
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const view = viewOf(el);
    move(translate, [
      round(view.left + view.width / 2 - rect.x - rect.width / 2),
      round(view.top + view.height / 2 - rect.y - rect.height / 2),
    ]);
  };

  return {
    interact(e: PointerEvent<HTMLElement>) {
      endShowcase();
      if (document.visibilityState !== "visible" || getOpts().blocked) {
        setInteracting(false);
        return;
      }
      clearTimeout(endTimer);
      setInteracting(true);
      const rect = e.currentTarget.getBoundingClientRect();
      const px = clamp(round((100 / rect.width) * (e.clientX - rect.left)));
      const py = clamp(round((100 / rect.height) * (e.clientY - rect.top)));
      useInteractConfig();
      move(background, [adjust(px, 0, 100, 37, 63), adjust(py, 0, 100, 33, 67)]);
      move(rotate, [round(-((px - 50) / 3.5)), round((py - 50) / 3.5)]);
      move(glare, [px, py, 1]);
    },

    interactEnd,
    endShowcase,
    setCenter,

    orientate(gamma: number, beta: number) {
      const limit = { x: 16, y: 18 };
      const g = clamp(gamma, -limit.x, limit.x);
      const b = clamp(beta, -limit.y, limit.y);
      setInteracting(true);
      useInteractConfig();
      move(background, [adjust(g, -limit.x, limit.x, 37, 63), adjust(b, -limit.y, limit.y, 33, 67)]);
      move(rotate, [round(-g), round(b)]);
      move(glare, [adjust(g, -limit.x, limit.x, 0, 100), adjust(b, -limit.y, limit.y, 0, 100), 1]);
    },

    popover() {
      const el = getEl();
      if (!el) return;
      const rect = el.getBoundingClientRect();
      let delay = 100;
      // Vertical room is limited to 72% so the caption under the card never overlaps it.
      const view = viewOf(el);
      const fit = Math.min((view.width / rect.width) * 0.9, (view.height / rect.height) * 0.72);
      setCenter();
      if (firstPop && !getOpts().reducedMotion) {
        delay = 1000;
        move(rotateDelta, [360, 0]);
      }
      firstPop = false;
      move(scale, [Math.min(fit, 1.75)]);
      interactEnd(delay);
    },

    retreat() {
      move(scale, [1], { soft: true });
      move(translate, [0, 0], { soft: true });
      move(rotateDelta, [0, 0], { soft: true });
      interactEnd(100);
    },

    reset() {
      interactEnd(0);
      move(scale, [1], { hard: true });
      move(translate, [0, 0], { hard: true });
      move(rotateDelta, [0, 0], { hard: true });
      move(rotate, [0, 0], { hard: true });
    },

    /** A gentle automatic sway a couple of seconds after load, cancelled by the first interaction. */
    startShowcase() {
      if (document.visibilityState !== "visible") return;
      let interval: number | undefined;
      let endTimeout: number | undefined;
      const startTimeout = window.setTimeout(() => {
        const el = getEl();
        if (!el) return;
        setInteracting(true);
        el.toggleAttribute("data-showcase", true);
        for (const s of interactive) Object.assign(s.config, { stiffness: 0.02, damping: 0.5 });
        let r = 0;
        interval = window.setInterval(() => {
          r += 0.05;
          move(rotate, [Math.sin(r) * 25, Math.cos(r) * 25]);
          move(glare, [55 + Math.sin(r) * 55, 55 + Math.cos(r) * 55, 0.8]);
          move(background, [20 + Math.sin(r) * 20, 20 + Math.cos(r) * 20]);
        }, 20);
        endTimeout = window.setTimeout(() => {
          clearInterval(interval);
          getEl()?.toggleAttribute("data-showcase", false);
          interactEnd(0);
        }, 4000);
      }, 2000);
      const cancel = () => {
        clearTimeout(startTimeout);
        clearTimeout(endTimeout);
        clearInterval(interval);
        getEl()?.toggleAttribute("data-showcase", false);
      };
      cancelShowcase = cancel;
      return cancel;
    },

    dispose() {
      cancelAnimationFrame(raf);
      raf = 0;
      clearTimeout(endTimer);
      cancelShowcase?.();
    },
  };
}
