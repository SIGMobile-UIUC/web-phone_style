import { Music } from "lucide-react";
import { terms } from "../content/terms";
import { islandActivity } from "../lib/music";
import { nextMeeting } from "../lib/schedule";
import { useMusic } from "./MusicProvider";
import { useNow } from "./useNow";

/**
 * The pill at the top of the screen. Idle it is just the camera cut-out; it widens for a "live activity":
 * a meeting in progress (highest priority) or music that is playing.
 */
export default function DynamicIsland() {
  const now = useNow(30_000);
  const music = useMusic();
  const live = nextMeeting(terms, now)?.state === "live";
  const activity = islandActivity({ meetingLive: live, musicPlaying: music.status === "playing" });

  return (
    <div
      className={`island island--${activity}`}
      role="status"
      aria-label={activity === "meeting" ? "SIGMobile meeting in progress" : activity === "music" ? "Music playing" : undefined}
    >
      {activity === "music" && (
        <>
          <Music aria-hidden />
          <span className="island__eq" aria-hidden>
            <i />
            <i />
            <i />
            <i />
          </span>
        </>
      )}
      {activity === "meeting" && (
        <>
          <span className="island__live" aria-hidden />
          <span>SIGMobile · Live</span>
        </>
      )}
    </div>
  );
}
