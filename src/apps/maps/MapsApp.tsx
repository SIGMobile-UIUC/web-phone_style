import { Clock, Navigation, Map as MapIcon } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import { isTba } from "../../content/places";
import { site } from "../../content/site";
import { terms } from "../../content/terms";
import { formatMeetingWhen, formatPlace } from "../../lib/format";
import { appleMapsUrl, directionsUrl } from "../../lib/maps";
import { nextMeeting } from "../../lib/schedule";
import { useNow } from "../../system/useNow";
import AppFrame from "../../ui/AppFrame";
import "./maps.css";

/** A stylised street map (no map service, no API key) with a pin on the meeting place. */
function MapArt({ unknown }: { unknown: boolean }) {
  return (
    <svg className="map-art" viewBox="0 0 358 240" role="img" aria-label={unknown ? "Map: meeting place not set yet" : "Map showing the meeting place"}>
      <rect width="358" height="240" fill="#e4f0f7" />
      <rect x="18" y="16" width="104" height="66" rx="14" fill="#cfe8d2" />
      <rect x="236" y="150" width="104" height="72" rx="14" fill="#cfe8d2" />
      <path d="M-10 196 C 80 150, 190 236, 370 168" fill="none" stroke="#a9d3ee" strokeWidth="28" strokeLinecap="round" />
      {[
        [136, 18, 86, 52], [232, 18, 108, 52], [18, 96, 86, 42], [120, 96, 62, 42],
        [246, 96, 94, 44], [18, 152, 70, 34],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="8" fill="#f7fbfd" />
      ))}
      <g stroke="#ffffff" strokeWidth="9" strokeLinecap="round">
        <path d="M0 86 H358" />
        <path d="M0 146 H358" opacity=".85" />
        <path d="M128 0 V240" />
        <path d="M228 0 V240" opacity=".85" />
      </g>
      <path d="M0 86 H358" stroke="#ffd66b" strokeWidth="3" strokeDasharray="10 8" />
      <g className="map-pin" transform="translate(178 96)">
        <ellipse cx="0" cy="8" rx="13" ry="4.5" fill="rgba(11,42,59,.22)" />
        <path
          d="M0 4 C -16 -14 -18 -22 -18 -30 A 18 18 0 1 1 18 -30 C 18 -22 16 -14 0 4 Z"
          fill={unknown ? "#9aa7b0" : "#3aa7de"}
          stroke="#fff"
          strokeWidth="3"
        />
        <circle cx="0" cy="-30" r="7" fill="#fff" />
        {unknown && (
          <text x="0" y="-26" textAnchor="middle" fontSize="11" fontWeight="700" fill="#6b7a84">
            ?
          </text>
        )}
      </g>
    </svg>
  );
}

/** Where the club meets: the next meeting's place, with directions once the place is set. */
export default function MapsApp() {
  const now = useNow(60_000);
  const next = nextMeeting(terms, now);
  const place = next?.occurrence.place ?? terms[0].meetings[0].place;
  const unknown = isTba(place);
  const google = directionsUrl(place);
  const apple = appleMapsUrl(place);

  return (
    <AppFrame title="Maps">
      <MapArt unknown={unknown} />

      <div className="ui-card map-card">
        <h2 className="ui-card__title">{unknown ? "Location to be announced" : place.name}</h2>
        {!unknown && (place.room || place.address) && (
          <p className="ui-card__text">{[place.room && `Room ${place.room}`, place.address].filter(Boolean).join(" · ")}</p>
        )}
        {unknown && <p className="ui-card__text">We haven't picked a room for this semester yet. Check Discord for updates.</p>}

        {next && (
          <div className="map-when">
            <Clock aria-hidden />
            <span>
              {next.state === "live" ? "Happening now · " : "Next: "}
              {formatMeetingWhen(next.occurrence)}
            </span>
          </div>
        )}

        <div className="ui-row map-actions">
          {google ? (
            <a className="ui-button" href={google} target="_blank" rel="noopener noreferrer">
              <Navigation aria-hidden /> Directions
            </a>
          ) : (
            <a className="ui-button" href={site.links.discord} target="_blank" rel="noopener noreferrer">
              <FaDiscord aria-hidden /> Ask on Discord
            </a>
          )}
          {apple && (
            <a className="ui-button ui-button--soft" href={apple} target="_blank" rel="noopener noreferrer">
              <MapIcon aria-hidden /> Apple Maps
            </a>
          )}
        </div>
      </div>

      <p className="map-foot">{formatPlace(place)}</p>
    </AppFrame>
  );
}
