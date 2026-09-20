import { motion, useTransform } from "motion/react";
import { Camera, Flashlight } from "lucide-react";
import { useRef } from "react";
import { terms } from "../content/terms";
import logo from "../assets/logo_white.png";
import { clockParts, formatLongDate, formatMeetingWhen, formatPlace, formatTermLabel } from "../lib/format";
import { nextMeeting } from "../lib/schedule";
import { useControlCenter } from "./ControlCenterProvider";
import LockLogo from "./LockLogo";
import { useSystem } from "./SystemProvider";
import { useNow } from "./useNow";

const clamp = (v: number, min = 0, max = 1) => Math.min(Math.max(v, min), max);

/**
 * The site's landing page, as a phone lock screen. Slide up anywhere (or press Enter on the handle) to unlock;
 * the particle logo reacts to the slide (see LockLogo).
 */
export default function LockScreen() {
  const { progress, unlock, cancelUnlock, nudge } = useSystem();
  const { toggles, setToggle } = useControlCenter();
  const ref = useRef<HTMLElement>(null);
  const now = useNow(1000);
  const { time } = clockParts(now);

  // The screen slides up and fades with the same `progress` the home screen reveals with.
  const y = useTransform(progress, (p) => `${-p * 100}%`);
  const opacity = useTransform(progress, [0, 0.7, 1], [1, 0.5, 0]);

  const term = terms[0];
  const next = nextMeeting(terms, now);

  /** Upward finger travel (negative y) as 0..1 of ~85% of the screen height. */
  const slideProgress = (offsetY: number) => clamp(-offsetY / ((ref.current?.offsetHeight ?? window.innerHeight) * 0.85), 0, 1);

  return (
    <motion.section
      ref={ref}
      className="lock"
      style={{ y, opacity }}
      aria-label="Lock screen"
      onPanStart={() => progress.stop()}
      onPan={(_, info) => progress.set(slideProgress(info.offset.y))}
      // Decide from the gesture itself (not the animated value, which can lag a frame behind the finger).
      onPanEnd={(_, info) => (slideProgress(info.offset.y) > 0.25 || info.velocity.y < -500 ? unlock() : cancelUnlock())}
    >
      <LockLogo />

      <div className="lock__clock">
        <div className="lock__date">{formatLongDate(now)}</div>
        <div className="lock__time">{time}</div>
      </div>

      <div className="lock__notifs">
        <Notification
          title="SIGMobile"
          when="now"
          text={
            next
              ? `${next.state === "live" ? "Happening now: " : "Next meeting: "}${formatMeetingWhen(next.occurrence)} · ${formatPlace(next.occurrence.place)}`
              : "No meetings scheduled. See you next semester!"
          }
        />
        <Notification
          title={`${formatTermLabel(term)} projects`}
          when="today"
          text={term.projects.map((p) => p.name).join(" · ")}
        />
      </div>

      <button
        type="button"
        className={`lock__quick lock__quick--left${toggles.flashlight ? " is-on" : ""}`}
        aria-label={toggles.flashlight ? "Turn flashlight off" : "Turn flashlight on"}
        aria-pressed={toggles.flashlight}
        onClick={() => setToggle("flashlight")}
      >
        <Flashlight aria-hidden />
      </button>
      <div className="lock__quick lock__quick--right" aria-hidden>
        <Camera />
      </div>

      {/* Keyboard/click access to the same unlock. Mouse click = hint bounce; Enter/Space (detail 0) unlocks. */}
      <button type="button" className="lock__handle" aria-label="Unlock" onClick={(e) => (e.detail === 0 ? unlock() : nudge())}>
        <span className="lock__hint">Swipe up to unlock</span>
        <span className="home-indicator" />
      </button>
    </motion.section>
  );
}

function Notification({ title, when, text }: { title: string; when: string; text: string }) {
  return (
    <div className="notif">
      <span className="notif__icon">
        <img src={logo} alt="" />
      </span>
      <span className="notif__body">
        <span className="notif__head">
          <span>{title}</span>
          <span>{when}</span>
        </span>
        <span className="notif__text">{text}</span>
      </span>
    </div>
  );
}
