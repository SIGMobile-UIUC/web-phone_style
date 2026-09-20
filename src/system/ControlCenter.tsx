import { motion, useTransform } from "motion/react";
import {
  Bluetooth, Calculator, Clock, Flashlight, Lock, Moon, Music, Pause, Plane, Play, Signal, SkipBack, SkipForward,
  Sun, SunMoon, Volume2, Wifi, type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { formatTrackTime } from "../lib/music";
import VSlider from "../ui/VSlider";
import { useControlCenter } from "./ControlCenterProvider";
import type { ToggleKey } from "./controlCenterState";
import { useMusic } from "./MusicProvider";
import { usePrefs } from "./PrefsProvider";
import { useSystem } from "./SystemProvider";
import { dimOpacity } from "./controlCenterState";

const clamp = (v: number, min = 0, max = 1) => Math.min(Math.max(v, min), max);

/** A round on/off button (the 2x2 radios block). */
function Round({ on, Icon, label, tint, onClick }: { on: boolean; Icon: LucideIcon; label: string; tint: string; onClick: () => void }) {
  return (
    <button type="button" className={`cc-round${on ? " is-on" : ""}`} style={{ "--tint": tint } as CSSProperties} aria-label={label} aria-pressed={on} onClick={onClick}>
      <Icon aria-hidden />
    </button>
  );
}

/** The pull-down invisible button in the top-right corner (over the status icons): drag down, or click to toggle. */
export function ControlCenterHandle() {
  const cc = useControlCenter();
  const { screenRef } = useSystem();
  const startedOpen = useRef(false);
  const dragged = useRef(false);
  const height = () => (screenRef.current?.clientHeight ?? 800) * 0.5;
  const at = (offsetY: number) => (startedOpen.current ? 1 : 0) + offsetY / height();

  return (
    <motion.button
      type="button"
      className="cc-handle"
      aria-label="Control Center"
      aria-expanded={cc.open}
      onPointerDown={() => (dragged.current = false)}
      onPanStart={() => {
        startedOpen.current = cc.progress.get() > 0.5;
        dragged.current = true;
        cc.drag.start();
      }}
      onPan={(_, info) => cc.drag.move(at(info.offset.y))}
      onPanEnd={(_, info) => cc.drag.end(clamp(at(info.offset.y)), info.velocity.y, startedOpen.current)}
      // A drag ends with a click on the same button; only a plain click toggles.
      onClick={() => {
        if (dragged.current) dragged.current = false;
        else cc.toggleCC();
      }}
    />
  );
}

/** The panel itself. */
export default function ControlCenter() {
  const cc = useControlCenter();
  const music = useMusic();
  const { prefs, setDark } = usePrefs();
  const { screenRef } = useSystem();
  const navigate = useNavigate();
  const ignore = useRef(false);

  const opacity = cc.progress;
  const lift = useTransform(cc.progress, (p) => `${(p - 1) * 5}%`);

  // Esc closes the panel first (capture + stopPropagation so it doesn't also close the open app).
  useEffect(() => {
    if (!cc.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      cc.closeCC();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [cc]);

  const halfHeight = () => (screenRef.current?.clientHeight ?? 800) * 0.5;
  const openApp = (id: string) => {
    cc.closeCC();
    navigate(`/${id}`);
  };

  const t = cc.toggles;
  const round = (k: ToggleKey, Icon: LucideIcon, label: string, tint: string) => (
    <Round on={t[k]} Icon={Icon} label={label} tint={tint} onClick={() => cc.setToggle(k)} />
  );

  const playing = music.status === "playing";
  const started = music.status !== "idle";

  return (
    <motion.div
      className="cc"
      style={{ opacity, y: lift, "--cc-p": cc.progress } as never}
      inert={!cc.open}
      aria-hidden={!cc.open}
      role="dialog"
      aria-label="Control Center"
      onClick={(e) => e.target === e.currentTarget && cc.closeCC()}
      onPanStart={(e) => {
        ignore.current = !!(e.target as Element | null)?.closest?.("[data-no-pan]");
        if (!ignore.current) cc.drag.start();
      }}
      onPan={(_, info) => !ignore.current && cc.drag.move(1 + info.offset.y / halfHeight())}
      onPanEnd={(_, info) => !ignore.current && cc.drag.end(clamp(1 + info.offset.y / halfHeight()), info.velocity.y, true)}
    >
      <div className="cc__grid">
        <section className="cc-tile cc-tile--radios" aria-label="Connectivity">
          {round("airplane", Plane, "Airplane mode", "#ff9f0a")}
          {round("cellular", Signal, "Cellular data", "#34c759")}
          {round("wifi", Wifi, "Wi-Fi", "#3aa7de")}
          {round("bluetooth", Bluetooth, "Bluetooth", "#3aa7de")}
        </section>

        <section className="cc-tile cc-tile--player" aria-label="Now playing">
          <div className="cc-player__head">
            <span className="cc-player__art" aria-hidden>
              <Music />
            </span>
            <div className="cc-player__text">
              <div className="cc-player__title">{started ? music.track.title : "Not Playing"}</div>
              <div className="cc-player__artist">{started ? music.track.artist : "Tap play to start"}</div>
            </div>
          </div>
          <div className="cc-player__seek" data-no-pan>
            <input
              type="range"
              min={0}
              max={music.duration || 1}
              step={1}
              value={Math.min(music.time, music.duration || 1)}
              disabled={!music.duration}
              aria-label="Seek"
              style={{ "--fill": `${music.duration ? (music.time / music.duration) * 100 : 0}%` } as CSSProperties}
              onChange={(e) => music.seek(Number(e.target.value))}
            />
            <div className="cc-player__times">
              <span>{formatTrackTime(music.time)}</span>
              <span>{music.duration ? `-${formatTrackTime(music.duration - music.time)}` : "-:--"}</span>
            </div>
          </div>
          <div className="cc-player__controls">
            <button type="button" aria-label="Previous song" onClick={music.prev}>
              <SkipBack aria-hidden />
            </button>
            <button type="button" className="cc-player__play" aria-label={playing ? "Pause" : "Play"} onClick={music.toggle} disabled={music.status === "loading"}>
              {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
            </button>
            <button type="button" aria-label="Next song" onClick={music.next}>
              <SkipForward aria-hidden />
            </button>
          </div>
        </section>

        <button
          type="button"
          className={`cc-tile cc-tile--btn${t.rotationLock ? " is-on" : ""}`}
          style={{ "--tint": "#ff3b30" } as CSSProperties}
          aria-pressed={t.rotationLock}
          aria-label="Orientation lock"
          onClick={() => cc.setToggle("rotationLock")}
        >
          <Lock aria-hidden />
        </button>
        <button
          type="button"
          className={`cc-tile cc-tile--btn${t.focus ? " is-on" : ""}`}
          style={{ "--tint": "#7c5cff" } as CSSProperties}
          aria-pressed={t.focus}
          aria-label="Focus"
          onClick={() => cc.setToggle("focus")}
        >
          <Moon aria-hidden />
        </button>

        <button
          type="button"
          className={`cc-tile cc-tile--wide${prefs.dark ? " is-on" : ""}`}
          style={{ "--tint": "#1f86bd" } as CSSProperties}
          aria-pressed={prefs.dark}
          onClick={() => setDark(!prefs.dark)}
        >
          <SunMoon aria-hidden />
          <span>Dark Mode</span>
        </button>

        <div className="cc-tile cc-tile--slider">
          <VSlider value={cc.brightness} onChange={cc.setBrightness} label="Brightness" icon={Sun} />
        </div>
        <div className="cc-tile cc-tile--slider">
          <VSlider value={music.volume / 100} onChange={(v) => music.setVolume(Math.round(v * 100))} label="Volume" icon={Volume2} />
        </div>

        <button type="button" className={`cc-tile cc-tile--btn${t.flashlight ? " is-on" : ""}`} style={{ "--tint": "#ffcc00" } as CSSProperties} aria-pressed={t.flashlight} aria-label="Flashlight" onClick={() => cc.setToggle("flashlight")}>
          <Flashlight aria-hidden />
        </button>
        <button type="button" className="cc-tile cc-tile--btn" aria-label="Open Clock" onClick={() => openApp("clock")}>
          <Clock aria-hidden />
        </button>
        <button type="button" className="cc-tile cc-tile--btn" aria-label="Open Calculator" onClick={() => openApp("calculator")}>
          <Calculator aria-hidden />
        </button>
        <button type="button" className="cc-tile cc-tile--btn" aria-label="Open Music" onClick={() => openApp("music")}>
          <Music aria-hidden />
        </button>
      </div>
    </motion.div>
  );
}

/** Screen-wide effects driven by the Control Center: brightness dimming and the flashlight glow. */
export function ScreenEffects() {
  const { toggles, brightness } = useControlCenter();
  return (
    <>
      <div className="screen-dim" style={{ opacity: dimOpacity(brightness) }} aria-hidden />
      {toggles.flashlight && <div className="screen-flash" aria-hidden />}
    </>
  );
}
