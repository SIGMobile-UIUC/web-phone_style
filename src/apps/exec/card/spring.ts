// Small spring integrator with the same per-tick model as svelte/motion's `spring`
// (which the ported card effect was tuned against). One tick = 1/60s.

const PRECISION = 0.01;

export type SpringSetOptions = { hard?: boolean; soft?: boolean | number };

export function createSpring(initial: number[], config: { stiffness: number; damping: number }) {
  let value = [...initial];
  let last = [...initial];
  let target = [...initial];
  let invMass = 1;
  let recovery = 0;

  return {
    config,
    get value() {
      return value;
    },
    set(next: number[], options: SpringSetOptions = {}) {
      target = next;
      if (options.hard) {
        value = [...next];
        last = [...next];
        invMass = 1;
        recovery = 0;
      } else if (options.soft) {
        // "soft": start with infinite mass and recover to normal, giving a gentle ease-in.
        recovery = 1 / ((options.soft === true ? 0.5 : options.soft) * 60);
        invMass = 0;
      }
    },
    /** Advances by `dt` ticks; returns true while still moving. */
    tick(dt: number): boolean {
      invMass = Math.min(invMass + recovery, 1);
      let moving = false;
      const next = value.map((current, i) => {
        const delta = target[i] - current;
        const velocity = (current - last[i]) / (dt || 1 / 60);
        const acceleration = (config.stiffness * delta - config.damping * velocity) * invMass;
        const step = (velocity + acceleration) * dt;
        if (Math.abs(step) < PRECISION && Math.abs(delta) < PRECISION) return target[i];
        moving = true;
        return current + step;
      });
      last = value;
      value = next;
      return moving;
    },
  };
}
