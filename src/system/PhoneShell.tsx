import type { CSSProperties, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { usePrefs } from "./PrefsProvider";
import { InfoPanel, TipsPanel } from "./SidePanels";
import { useSystem } from "./SystemProvider";
import { resolveWallpaper } from "./wallpapers";
import "./system.css";

/**
 * The device: a bezel + screen on desktop (with info panels on either side on wide windows), the bare screen on
 * a real phone. The screen is a size container with paint containment, so anything inside (even position:fixed)
 * stays in it, and `.phone-ui` turns the screen width into the `--u` unit the rest of the UI is sized in.
 * It also carries the user's settings as attributes/variables (theme, reduced motion, wallpaper) for the CSS.
 */
export default function PhoneShell({ children }: { children: ReactNode }) {
  const { lock, locked, screenRef, statusStyle } = useSystem();
  const { prefs, reducedMotion } = usePrefs();
  const navigate = useNavigate();
  return (
    <div className="phone-stage">
      <InfoPanel />
      <div className="phone-frame">
        {/* The side button locks the phone (and closes any open app). */}
        <button
          className="phone-power"
          aria-label="Lock the phone"
          disabled={locked}
          onClick={() => {
            navigate("/", { replace: true });
            lock();
          }}
        />
        <div className="phone-screen" ref={screenRef}>
          <div
            className="phone-ui"
            data-status={statusStyle}
            data-theme={prefs.dark ? "dark" : "light"}
            data-motion={reducedMotion ? "reduced" : "full"}
            style={{ "--wallpaper": resolveWallpaper(prefs.wallpaper).css } as CSSProperties}
          >
            {children}
          </div>
        </div>
      </div>
      <TipsPanel />
    </div>
  );
}
