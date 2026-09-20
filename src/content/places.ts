import type { Place } from "./types";

// Reusable meeting places. Define a place once here, then reference it from a term's `meetings`.

/** Placeholder until the room is decided. UI shows "Location TBA" and hides the directions button. */
export const tba: Place = { name: "Location TBA" };

export const isTba = (p: Place) => p === tba || p.name === tba.name;
