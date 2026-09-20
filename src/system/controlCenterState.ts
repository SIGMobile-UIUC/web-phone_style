// Pure logic of the Control Center switches (the React parts are in ControlCenterProvider / ControlCenter).

export type ToggleKey = "airplane" | "cellular" | "wifi" | "bluetooth" | "focus" | "rotationLock" | "flashlight";
export type Toggles = Record<ToggleKey, boolean>;

export const initialToggles: Toggles = {
  airplane: false,
  cellular: true,
  wifi: true,
  bluetooth: true,
  focus: false,
  rotationLock: false,
  flashlight: false,
};

/** Flip (or set) a switch. Airplane mode switches the radios off, like the real thing. */
export function withToggle(t: Toggles, key: ToggleKey, value?: boolean): Toggles {
  const next = value ?? !t[key];
  const out = { ...t, [key]: next };
  if (key === "airplane" && next) return { ...out, cellular: false, wifi: false, bluetooth: false };
  return out;
}

/** How dark the dimming overlay is for a brightness of 0..1 (never fully black, so the UI stays usable). */
export const dimOpacity = (brightness: number): number => Math.round((1 - Math.min(Math.max(brightness, 0), 1)) * 0.65 * 100) / 100;
