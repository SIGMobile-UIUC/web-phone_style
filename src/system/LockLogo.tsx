import { useEffect, useRef, useState } from "react";
import logo from "../assets/logo_white.png";
import type { ParticleLogo } from "./lock/particleLogoScene";
import { usePrefs } from "./PrefsProvider";
import { useSystem } from "./SystemProvider";

/**
 * The lock screen's centerpiece: the site's original particle logo (drag it and it scatters and orbits).
 * It is wired to the unlock slide: `progress` feeds the same scatter/orbit, so sliding up makes the logo
 * break apart and fade in step with the finger — and it re-forms if the slide is cancelled.
 *
 * three.js is loaded lazily (its own chunk) and torn down when the lock screen unmounts.
 * Falls back to the flat logo without WebGL.
 */
export default function LockLogo() {
  const { progress } = useSystem();
  const ref = useRef<HTMLDivElement>(null);
  const { prefs, reducedMotion: reduced } = usePrefs();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let particles: ParticleLogo | undefined;
    let stop: (() => void) | undefined;

    import("./lock/particleLogoScene").then(({ mountParticleLogo }) => {
      if (disposed || !ref.current) return;
      try {
        // On a dark wallpaper the particles glow (additive); on a light one they are drawn in solid brand blue.
        particles = mountParticleLogo(ref.current, { reducedMotion: reduced, light: !prefs.dark });
        particles.setUnlockProgress(progress.get());
        stop = progress.on("change", (p) => particles?.setUnlockProgress(p));
      } catch {
        setFailed(true); // no WebGL
      }
    });

    return () => {
      disposed = true;
      stop?.();
      particles?.dispose();
    };
  }, [reduced, progress, prefs.dark]);

  return (
    <div className="lock__logo" ref={ref}>
      {failed && <img className="lock__logo-fallback" src={logo} alt="" />}
    </div>
  );
}
