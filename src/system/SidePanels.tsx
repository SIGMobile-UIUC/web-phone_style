import { ArrowUpRight, Clock, Hand, MapPin, MousePointerClick, Sparkles } from "lucide-react";
import { FaDiscord, FaInstagram } from "react-icons/fa";
import logo from "../assets/logo_white.png";
import { site } from "../content/site";
import { terms } from "../content/terms";
import { formatInViewerZone, formatMeetingWhen, formatPlace, formatTimeRange, formatWeekdayPlural } from "../lib/format";
import { nextMeeting } from "../lib/schedule";
import { formatCountdown } from "../lib/time";
import { useNow } from "./useNow";

// The two panels beside the phone on wide screens. They are the "plain information" layer for visitors who
// just want the meeting details without playing with the phone. Data comes from src/content (nothing hard-coded).

/** Left: who we are + when and where we meet. */
export function InfoPanel() {
  const now = useNow(1000);
  const next = nextMeeting(terms, now);
  const o = next?.occurrence;
  const viewer = o ? formatInViewerZone(o.start) : null;

  return (
    <aside className="stage-panel" aria-label="Meeting information">
      <div className="panel-brand">
        <span className="panel-brand__logo">
          <img src={logo} alt="" />
        </span>
        <div>
          <div className="panel-brand__name">{site.name}</div>
          <div className="panel-brand__tag">{site.tagline}</div>
        </div>
      </div>

      <div className="panel-card">
        <h2 className="panel-label">Weekly meeting</h2>
        {o ? (
          <>
            <div className="panel-big">{formatWeekdayPlural(o.start)}</div>
            <div className="panel-sub">{formatTimeRange(o)}</div>
            <div className="panel-row">
              <MapPin aria-hidden /> {formatPlace(o.place)}
            </div>

            <div className="panel-divider" />

            <h3 className="panel-label">{next.state === "live" ? "Happening now" : "Next meeting"}</h3>
            <div className="panel-next">{formatMeetingWhen(o).split(" · ")[0]}</div>
            <div className="panel-row" style={{ marginTop: 6 }}>
              <Clock aria-hidden />
              {next.state === "live" ? "In progress — come join us!" : `in ${formatCountdown(o.start.getTime() - now.getTime())}`}
            </div>
            {viewer && <div className="panel-note">Your time: {viewer}</div>}
          </>
        ) : (
          <>
            <div className="panel-big">See you next semester!</div>
            <div className="panel-note">No meetings are scheduled right now.</div>
          </>
        )}
      </div>
    </aside>
  );
}

/** Right: where to find us + how to use the phone. */
export function TipsPanel() {
  return (
    <aside className="stage-panel" aria-label="Links and tips">
      <div className="panel-card">
        <h2 className="panel-label">Join us</h2>
        <a className="panel-link" href={site.links.discord} target="_blank" rel="noopener noreferrer">
          <span className="panel-link__icon" style={{ background: "linear-gradient(155deg,#7b8cff,#4f5bd5)" }}>
            <FaDiscord aria-hidden />
          </span>
          <span>
            <div className="panel-link__title">Discord</div>
            <div className="panel-link__sub">Chat with the team</div>
          </span>
          <ArrowUpRight aria-hidden />
        </a>
        <a className="panel-link" href={site.links.instagram} target="_blank" rel="noopener noreferrer">
          <span className="panel-link__icon" style={{ background: "linear-gradient(155deg,#f58529,#dd2a7b)" }}>
            <FaInstagram aria-hidden />
          </span>
          <span>
            <div className="panel-link__title">Instagram</div>
            <div className="panel-link__sub">@sigmobile.uiuc</div>
          </span>
          <ArrowUpRight aria-hidden />
        </a>
      </div>

      <div className="panel-card">
        <h2 className="panel-label">Try the phone</h2>
        <ul className="panel-tips">
          <li>
            <Hand aria-hidden />
            <span>
              Drag up on the lock screen to unlock (or press <kbd>Enter</kbd>).
            </span>
          </li>
          <li>
            <MousePointerClick aria-hidden />
            <span>
              Click an app to open it. Swipe up the bottom bar or press <kbd>Esc</kbd> to go home.
            </span>
          </li>
          <li>
            <Sparkles aria-hidden />
            <span>Drag the logo on the lock screen — it scatters!</span>
          </li>
        </ul>
      </div>
    </aside>
  );
}
