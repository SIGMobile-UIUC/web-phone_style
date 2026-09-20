import { expect, test } from "bun:test";
import { dimOpacity, initialToggles, withToggle } from "./controlCenterState";

test("a switch flips, or is set explicitly", () => {
  expect(withToggle(initialToggles, "wifi").wifi).toBe(false);
  expect(withToggle(initialToggles, "wifi", true).wifi).toBe(true);
  expect(withToggle(initialToggles, "focus").focus).toBe(true);
});

test("airplane mode turns the radios off; turning it off leaves them off", () => {
  const on = withToggle(initialToggles, "airplane");
  expect(on).toMatchObject({ airplane: true, cellular: false, wifi: false, bluetooth: false });
  const off = withToggle(on, "airplane");
  expect(off).toMatchObject({ airplane: false, cellular: false, wifi: false });
  expect(withToggle(on, "wifi").wifi).toBe(true); // Wi-Fi can be switched back on during airplane mode
});

test("dimming: full brightness = no overlay, never fully black", () => {
  expect(dimOpacity(1)).toBe(0);
  expect(dimOpacity(0.5)).toBeCloseTo(0.33, 2);
  expect(dimOpacity(0)).toBe(0.65);
  expect(dimOpacity(-1)).toBe(0.65);
  expect(dimOpacity(9)).toBe(0);
});
