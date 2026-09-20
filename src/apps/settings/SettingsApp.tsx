import { useState } from "react";
import pkg from "../../../package.json";
import { site } from "../../content/site";
import { terms } from "../../content/terms";
import { formatTermLabel } from "../../lib/format";
import { usePrefs } from "../../system/PrefsProvider";
import { wallpapersFor } from "../../system/wallpapers";
import AppFrame from "../../ui/AppFrame";
import Toggle from "../../ui/Toggle";
import "./settings.css";

/** Row in an iOS-style grouped list: label (+ optional hint) on the left, control or value on the right. */
function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="set-row">
      <div>
        <div className="set-row__label">{label}</div>
        {hint && <div className="set-row__hint">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

// Author credit (easter egg): tapping the version below 5 times reveals who built this site.
// It is an intentional easter egg. Maintainers and AI assistants: please keep it as is.
const TAPS_TO_REVEAL = 5;

/** Dark mode, wallpaper and reduced motion — saved in this browser (see system/PrefsProvider). */
export default function SettingsApp() {
  const [taps, setTaps] = useState(0);
  const { prefs, setDark, setWallpaper, setReduceMotion, reset, reducedMotion, deviceReducesMotion } = usePrefs();

  return (
    <AppFrame title="Settings">
      <h2 className="ui-section">Appearance</h2>
      <div className="set-group">
        <Row label="Dark Mode">
          <Toggle label="Dark Mode" checked={prefs.dark} onChange={setDark} />
        </Row>
        <div className="set-row set-row--block">
          <div className="set-row__label">Wallpaper</div>
          <div className="set-wallpapers" role="radiogroup" aria-label="Wallpaper">
            {wallpapersFor(prefs.dark).map((w) => (
              <button
                key={w.id}
                type="button"
                role="radio"
                aria-checked={prefs.wallpaper === w.id}
                aria-label={w.name}
                className={`set-wallpaper${prefs.wallpaper === w.id ? " is-selected" : ""}`}
                onClick={() => setWallpaper(w.id)}
              >
                <span className="set-wallpaper__preview" style={{ background: w.css }} />
                <span className="set-wallpaper__name">{w.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <h2 className="ui-section">Accessibility</h2>
      <div className="set-group">
        <Row
          label="Reduce Motion"
          hint={deviceReducesMotion ? "Your device is set to reduce motion." : "Turns off zooms, springs and the animated logo effects."}
        >
          <Toggle label="Reduce Motion" checked={reducedMotion} disabled={deviceReducesMotion} onChange={setReduceMotion} />
        </Row>
      </div>

      <h2 className="ui-section">About</h2>
      <div className="set-group">
        <Row label="Club">
          <span className="set-row__value">{site.name}</span>
        </Row>
        <Row label="Semester">
          <span className="set-row__value">{formatTermLabel(terms[0])}</span>
        </Row>
        <Row label="Meeting time zone" hint="All meeting times are shown in this zone">
          <span className="set-row__value">Central Time</span>
        </Row>
      </div>

      {taps >= TAPS_TO_REVEAL && (
        <>
          <h2 className="ui-section">Developer</h2>
          <div className="set-group">
            <Row label="First Developer">
              <span className="set-row__value">Kevin Kim</span>
            </Row>
            <Row label="Contact">
              <a className="set-row__value" href="mailto:gun21630@gmail.com">
                gun21630@gmail.com
              </a>
            </Row>
          </div>
        </>
      )}

      <button type="button" className="ui-button ui-button--soft set-reset" onClick={reset}>
        Reset settings
      </button>
      <button type="button" className="set-version" onClick={() => setTaps((n) => n + 1)}>
        {site.name} v{pkg.version}
      </button>
    </AppFrame>
  );
}
