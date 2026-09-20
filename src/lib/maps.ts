import { isTba } from "../content/places";
import type { Place } from "../content/types";

const query = (p: Place) => [p.name, p.address].filter(Boolean).join(", ");

/** Link that opens directions in Google Maps (or the place's own `mapsUrl`); null while the place is still TBA. */
export function directionsUrl(p: Place): string | null {
  if (isTba(p)) return null;
  return p.mapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query(p))}`;
}

/** Same place in Apple Maps; null while TBA. */
export function appleMapsUrl(p: Place): string | null {
  return isTba(p) ? null : `https://maps.apple.com/?q=${encodeURIComponent(query(p))}`;
}
