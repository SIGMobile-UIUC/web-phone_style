import type { ComponentType, KeyboardEvent, PointerEvent } from "react";

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/**
 * A tall, thick vertical slider (the brightness/volume sliders of the Control Center): drag or click anywhere on
 * it, or use the arrow keys. `value` is 0..1. It is marked `data-no-pan` so dragging it never pulls the panel closed.
 */
export default function VSlider({
  value,
  onChange,
  label,
  icon: Icon,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  icon: ComponentType<{ "aria-hidden"?: boolean }>;
}) {
  const set = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    onChange(clamp01(1 - (e.clientY - r.top) / r.height));
  };
  const onKey = (e: KeyboardEvent) => {
    const step = e.key === "PageUp" || e.key === "PageDown" ? 0.2 : 0.05;
    if (e.key === "ArrowUp" || e.key === "ArrowRight" || e.key === "PageUp") onChange(clamp01(value + step));
    else if (e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "PageDown") onChange(clamp01(value - step));
    else if (e.key === "Home") onChange(0);
    else if (e.key === "End") onChange(1);
    else return;
    e.preventDefault();
  };

  return (
    <div
      className="vslider"
      data-no-pan
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      onKeyDown={onKey}
      onPointerDown={(e) => {
        try {
          e.currentTarget.setPointerCapture(e.pointerId); // keeps the drag going outside the slider
        } catch {
          /* the pointer is already gone (very quick tap) — the value below is still applied */
        }
        set(e);
      }}
      onPointerMove={(e) => e.buttons === 1 && set(e)}
    >
      <div className="vslider__fill" style={{ height: `${value * 100}%` }} />
      <span className="vslider__icon">
        <Icon aria-hidden />
      </span>
    </div>
  );
}
