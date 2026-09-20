import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { terms } from "../../content/terms";
import { addMonths, agendaByDate, monthGrid, monthOf, todayInClubZone, type AgendaItem } from "../../lib/calendar";
import { MONTH_NAMES, formatDateLabel, formatPlace, formatTimeRange } from "../../lib/format";
import { parseDate } from "../../lib/time";
import { useNow } from "../../system/useNow";
import AppFrame from "../../ui/AppFrame";
import "./calendar.css";

const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
const KIND_LABEL: Record<AgendaItem["kind"], string> = {
  meeting: "Meeting",
  milestone: "Milestone",
  showcase: "Showcase",
  deploy: "Deploy",
  social: "Social",
};

/** Month view + agenda. Meetings are generated from the term's schedule; events come from the term file. */
export default function CalendarApp() {
  const now = useNow(60_000);
  const today = todayInClubZone(now);
  const agenda = useMemo(() => agendaByDate(terms), []);
  const [month, setMonth] = useState(() => monthOf(today));
  const [selected, setSelected] = useState(today);

  const weeks = monthGrid(month);
  const items = agenda.get(selected) ?? [];
  const goToday = () => {
    setMonth(monthOf(today));
    setSelected(today);
  };

  return (
    <AppFrame title="Calendar">
      <div className="cal-head">
        <div className="cal-head__month">
          {MONTH_NAMES[month.m - 1]} <span>{month.y}</span>
        </div>
        <div className="cal-head__nav">
          <button type="button" aria-label="Previous month" onClick={() => setMonth((m) => addMonths(m, -1))}>
            <ChevronLeft aria-hidden />
          </button>
          <button type="button" className="cal-head__today" onClick={goToday}>
            Today
          </button>
          <button type="button" aria-label="Next month" onClick={() => setMonth((m) => addMonths(m, 1))}>
            <ChevronRight aria-hidden />
          </button>
        </div>
      </div>

      <div className="cal-week cal-week--labels" aria-hidden>
        {WEEKDAY_LETTERS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      {weeks.map((week) => (
        <div className="cal-week" key={week[0].date}>
          {week.map(({ date, inMonth }) => {
            const list = agenda.get(date) ?? [];
            const hasMeeting = list.some((i) => i.kind === "meeting");
            const hasEvent = list.some((i) => i.kind !== "meeting");
            const cls = ["cal-day", !inMonth && "is-out", date === today && "is-today", date === selected && "is-selected"].filter(Boolean).join(" ");
            return (
              <button
                key={date}
                type="button"
                className={cls}
                aria-pressed={date === selected}
                aria-label={`${formatDateLabel(date)}${list.length ? `, ${list.length} item${list.length > 1 ? "s" : ""}` : ""}`}
                onClick={() => {
                  setSelected(date);
                  if (!inMonth) setMonth(monthOf(date));
                }}
              >
                <span className="cal-day__num">{parseDate(date).d}</span>
                <span className="cal-day__dots" aria-hidden>
                  {hasMeeting && <i className="cal-dot cal-dot--meeting" />}
                  {hasEvent && <i className="cal-dot cal-dot--event" />}
                </span>
              </button>
            );
          })}
        </div>
      ))}

      <h2 className="ui-section">{formatDateLabel(selected)}</h2>
      {items.length === 0 ? (
        <p className="cal-empty">Nothing scheduled.</p>
      ) : (
        items.map((item, i) => (
          <article className={`cal-item cal-item--${item.kind === "meeting" ? "meeting" : "event"}`} key={i}>
            <div className="cal-item__top">
              <h3 className="cal-item__title">{item.title}</h3>
              <span className="cal-item__kind">{KIND_LABEL[item.kind]}</span>
            </div>
            {item.start && item.end && <div className="cal-item__time">{formatTimeRange({ start: item.start, end: item.end })}</div>}
            {item.place && (
              <div className="cal-item__place">
                <MapPin aria-hidden /> {formatPlace(item.place)}
              </div>
            )}
            {item.note && <p className="cal-item__note">{item.note}</p>}
          </article>
        ))
      )}
    </AppFrame>
  );
}
