import type { Place } from "./types";

// Reusable meeting places. Define a place once here, then reference it from a term's `meetings`.

/** Placeholder until the room is decided. UI shows "Location TBA" and hides the directions button. */
export const tba: Place = { name: "Location TBA" };

export const isTba = (p: Place) => p === tba || p.name === tba.name;

// Thomas M. Siebel Center for Computer Science. `mapsUrl` pins the building; the room is what changes, so each room
// is its own place (see the Fall 2026 term file for when we moved).
const siebel = {
  name: "Siebel Center for Computer Science",
  address: "201 N Goodwin Ave, Urbana, IL 61801",
  mapsUrl: "https://maps.app.goo.gl/X1knPeFxB75hYRkc9",
};
export const siebel3401: Place = { ...siebel, room: "3401" };
export const siebel4403: Place = { ...siebel, room: "4403" };
