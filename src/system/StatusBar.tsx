import { BatteryFull, Plane, Signal, Wifi, WifiOff } from "lucide-react";
import { clockParts } from "../lib/format";
import { useControlCenter } from "./ControlCenterProvider";
import { useNow } from "./useNow";

/** Clock + signal icons across the top; they follow the Control Center switches. Decorative for screen readers. */
export default function StatusBar() {
  const { time } = clockParts(useNow(1000));
  const { toggles } = useControlCenter();
  return (
    <div className="statusbar" aria-hidden>
      <span>{time}</span>
      <span className="statusbar__icons">
        {toggles.airplane ? <Plane /> : toggles.cellular && <Signal />}
        {toggles.wifi ? <Wifi /> : <WifiOff />}
        <BatteryFull />
      </span>
    </div>
  );
}
