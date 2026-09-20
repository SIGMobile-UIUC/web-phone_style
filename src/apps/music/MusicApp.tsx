import { Loader2, Music, Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import type { CSSProperties } from "react";
import { playlist, playlistName } from "../../content/music";
import { formatTrackTime } from "../../lib/music";
import { useMusic } from "../../system/MusicProvider";
import AppFrame from "../../ui/AppFrame";
import "./music.css";

/** Player + playlist. It keeps playing after the app is closed (Control Center and the island show it). */
export default function MusicApp() {
  const { status, time, duration, track, index, volume, toggle, seek, next, prev, playAt, setVolume } = useMusic();
  const playing = status === "playing";
  const loading = status === "loading";
  const max = duration || 1;

  return (
    <AppFrame title="Music">
      <div className={`mu-art${playing ? " is-playing" : ""}`} aria-hidden>
        <Music />
        <span>{playlistName}</span>
      </div>

      <div className="mu-meta">
        <div className="mu-title">{track.title}</div>
        <div className="mu-artist">{track.artist}</div>
      </div>

      <input
        className="mu-seek"
        type="range"
        min={0}
        max={max}
        step={1}
        value={Math.min(time, max)}
        disabled={!duration}
        aria-label="Seek"
        style={{ "--fill": `${duration ? (time / duration) * 100 : 0}%` } as CSSProperties}
        onChange={(e) => seek(Number(e.target.value))}
      />
      <div className="mu-times">
        <span>{formatTrackTime(time)}</span>
        <span>{duration ? `-${formatTrackTime(duration - time)}` : "-:--"}</span>
      </div>

      <div className="mu-controls">
        <button type="button" className="mu-skip" onClick={prev} aria-label="Previous song">
          <SkipBack aria-hidden />
        </button>
        <button type="button" className="mu-play" onClick={toggle} disabled={loading} aria-label={playing ? "Pause" : "Play"}>
          {loading ? <Loader2 className="mu-spin" aria-hidden /> : playing ? <Pause aria-hidden /> : <Play aria-hidden />}
        </button>
        <button type="button" className="mu-skip" onClick={next} aria-label="Next song">
          <SkipForward aria-hidden />
        </button>
      </div>

      <label className="mu-volume">
        <Volume2 aria-hidden />
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          aria-label="Volume"
          style={{ "--fill": `${volume}%` } as CSSProperties}
          onChange={(e) => setVolume(Number(e.target.value))}
        />
      </label>

      {/* Only shown if the player can't start (e.g. blocked network); otherwise nothing is said. */}
      <p className="mu-note" aria-live="polite">
        {status === "error" && (
          <>
            Couldn't play the music here.{" "}
            <a href={`https://www.youtube.com/watch?v=${track.videoId}`} target="_blank" rel="noopener noreferrer">
              Open this song on YouTube
            </a>
          </>
        )}
      </p>

      <h2 className="ui-section">Up next</h2>
      <ol className="mu-list">
        {playlist.map((t, i) => (
          <li key={t.videoId}>
            <button type="button" className={`mu-item${i === index ? " is-current" : ""}`} onClick={() => playAt(i)} aria-current={i === index}>
              <span className="mu-item__num">{i === index && playing ? <i className="mu-eq" aria-hidden /> : i + 1}</span>
              <span className="mu-item__text">
                <span className="mu-item__title">{t.title}</span>
                <span className="mu-item__artist">{t.artist}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </AppFrame>
  );
}
