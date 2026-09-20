import { site } from "../../content/site";
import { terms } from "../../content/terms";
import { clockParts, formatDateLabel, formatLongDate, formatMeetingWhen, formatPlace } from "../../lib/format";
import { nextMeeting, upcomingEvents } from "../../lib/schedule";
import { countdown } from "../../lib/time";
import { todayInClubZone } from "../../lib/calendar";
import { useNow } from "../../system/useNow";
import AppFrame from "../../ui/AppFrame";
import "./clock.css";

const pad = (n: number) => String(n).padStart(2, "0");

/** Big live countdown: days / hours / minutes / seconds. */
function CountdownCard({ label, title, sub, ms, ended }: { label: string; title: string; sub?: string; ms: number; ended?: boolean }) {
  const c = countdown(ms);
  const units: [string, number][] = [["days", c.days], ["hrs", c.hours], ["min", c.minutes], ["sec", c.seconds]];
  return (
    <section className="clock-card" aria-label={`${title}: ${c.days} days ${c.hours} hours ${c.minutes} minutes`}>
      <h2 className="clock-card__label">{label}</h2>
      <div className="clock-card__title">{title}</div>
      {sub && <div className="clock-card__sub">{sub}</div>}
      <div className={`clock-units${ended ? " is-live" : ""}`} aria-hidden>
        {units.map(([name, value]) => (
          <div className="clock-unit" key={name}>
            <span className="clock-unit__num">{pad(value)}</span>
            <span className="clock-unit__name">{name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Club time (Central) + live countdowns to the next meeting and the semester's big dates. */
export default function ClockApp() {
  const now = useNow(1000);
  const club = clockParts(now, site.timeZone);
  const mine = clockParts(now);
  const showMine = mine.time !== club.time || mine.period !== club.period;

  const next = nextMeeting(terms, now);
  const events = upcomingEvents(terms, now, ["showcase", "deploy"]);

  return (
    <AppFrame title="Clock">
      <section className="clock-now">
        <div className="clock-now__time">
          {club.time}
          <span>{club.period}</span>
        </div>
        <div className="clock-now__sub">Central Time · {formatLongDate(now, site.timeZone)}</div>
        {showMine && (
          <div className="clock-now__mine">
            Your time: {mine.time} {mine.period}
          </div>
        )}
      </section>

      {next ? (
        next.state === "live" ? (
          <CountdownCard
            label="Happening now"
            title="Weekly meeting"
            sub={`${formatPlace(next.occurrence.place)} · ends in`}
            ms={next.occurrence.end.getTime() - now.getTime()}
            ended
          />
        ) : (
          <CountdownCard
            label="Next meeting"
            title={formatMeetingWhen(next.occurrence).split(" · ")[0]}
            sub={`${formatMeetingWhen(next.occurrence).split(" · ")[1]} · ${formatPlace(next.occurrence.place)}`}
            ms={next.occurrence.start.getTime() - now.getTime()}
          />
        )
      ) : (
        <section className="clock-card">
          <h2 className="clock-card__label">Next meeting</h2>
          <div className="clock-card__title">See you next semester!</div>
        </section>
      )}

      {events.map(({ event, at }) => (
        <CountdownCard
          key={`${event.date}-${event.title}`}
          label={event.kind === "showcase" ? "Showcase" : "Deployment"}
          title={event.title}
          sub={`${formatDateLabel(event.date)}${event.date === todayInClubZone(now) ? " · today" : ""}`}
          ms={at.getTime() - now.getTime()}
        />
      ))}
    </AppFrame>
  );
}
