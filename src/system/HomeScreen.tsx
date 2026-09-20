import { motion, useTransform } from "motion/react";
import { CalendarDays } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { apps, appIdFromLocation, homeLayout, type AppManifest } from "../apps/registry";
import { terms } from "../content/terms";
import { formatMeetingWhen, formatPlace } from "../lib/format";
import { nextMeeting } from "../lib/schedule";
import { formatCountdown } from "../lib/time";
import AppIcon from "./AppIcon";
import { useSystem } from "./SystemProvider";
import { useNow } from "./useNow";

/**
 * Icons + widget. It sits behind the lock screen (eases into focus as the lock screen slides away) and behind
 * an open app (shrinks back and blurs, like on a phone).
 */
export default function HomeScreen() {
  const { progress, locked, rememberOrigin } = useSystem();
  const navigate = useNavigate();
  const appOpen = appIdFromLocation(useLocation().pathname) !== null;

  const scale = useTransform(progress, [0, 1], [1.14, 1]);
  const filter = useTransform(progress, [0, 1], ["blur(14px)", "blur(0px)"]);
  const opacity = useTransform(progress, [0, 0.3, 1], [0, 0.6, 1]);

  const open = (app: AppManifest, tile: DOMRect) => {
    rememberOrigin(app.id, tile);
    navigate(`/${app.id}`);
  };

  return (
    <motion.div
      className="home-layer"
      animate={{ scale: appOpen ? 0.92 : 1, filter: appOpen ? "blur(8px)" : "blur(0px)" }}
      transition={{ duration: 0.35 }}
    >
      <motion.div className="home" style={{ scale, filter, opacity }} inert={locked || appOpen}>
        <NextMeetingWidget />

        {homeLayout.pages.map((page, i) => (
          <div className="app-grid" key={i}>
            {page.map((id) => (
              <AppIcon key={id} app={apps[id]} onOpen={open} />
            ))}
          </div>
        ))}

        <nav className="dock" aria-label="Dock">
          {homeLayout.dock.map((id) => (
            <AppIcon key={id} app={apps[id]} showLabel={false} onOpen={open} />
          ))}
        </nav>
        <div className="home-indicator" />
      </motion.div>
    </motion.div>
  );
}

function NextMeetingWidget() {
  const now = useNow(30_000);
  const next = nextMeeting(terms, now);

  if (!next) {
    return (
      <div className="widget">
        <div className="widget__label">
          <CalendarDays /> Next meeting
        </div>
        <div className="widget__big">See you next semester!</div>
        <div className="widget__foot">No meetings scheduled</div>
      </div>
    );
  }

  const { occurrence: o, state } = next;
  const [day, range] = formatMeetingWhen(o).split(" · ");
  return (
    <div className="widget">
      <div className="widget__label">
        <CalendarDays /> {state === "live" ? "Happening now" : "Next meeting"}
      </div>
      <div>
        <div className="widget__big">{day}</div>
        <div className="widget__sub">{range}</div>
      </div>
      <div className="widget__foot">
        {formatPlace(o.place)}
        {state === "upcoming" && ` · in ${formatCountdown(o.start.getTime() - now.getTime())}`}
      </div>
    </div>
  );
}
