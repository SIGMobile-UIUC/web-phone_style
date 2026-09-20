import { useLocation } from "react-router-dom";
import { appIdFromLocation } from "../apps/registry";
import AppHost from "./AppHost";
import ControlCenter, { ControlCenterHandle, ScreenEffects } from "./ControlCenter";
import { ControlCenterProvider } from "./ControlCenterProvider";
import DynamicIsland from "./DynamicIsland";
import HomeScreen from "./HomeScreen";
import LockScreen from "./LockScreen";
import { MusicProvider } from "./MusicProvider";
import PhoneShell from "./PhoneShell";
import { PrefsProvider } from "./PrefsProvider";
import StatusBar from "./StatusBar";
import { SystemProvider, useSystem } from "./SystemProvider";

/**
 * The whole site: a phone. Layers from back to front:
 * wallpaper, home screen, open app, lock screen, control center, status bar + island (+ screen effects).
 */
export default function Phone() {
  // Opening the site straight on an app URL (/exec) skips the lock screen.
  const deepLinked = appIdFromLocation(useLocation().pathname) !== null;
  return (
    <PrefsProvider>
      <SystemProvider startUnlocked={deepLinked}>
        <MusicProvider>
          <ControlCenterProvider>
            <PhoneShell>
              <div className="wallpaper" />
              <HomeScreen />
              <AppHost />
              <LockLayer />
              <ControlCenter />
              <StatusBar />
              <DynamicIsland />
              <ControlCenterHandle />
              <ScreenEffects />
            </PhoneShell>
          </ControlCenterProvider>
        </MusicProvider>
      </SystemProvider>
    </PrefsProvider>
  );
}

/** Mounted only while locked, so the 3D logo is torn down after unlocking. */
function LockLayer() {
  const { locked } = useSystem();
  return locked ? <LockScreen /> : null;
}
