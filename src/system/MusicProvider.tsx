import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { playlist, type Track } from "../content/music";
import { nextIndex, prevIndex } from "../lib/music";

// One YouTube player for the whole phone, so the music keeps playing after the Music app is closed and the
// Dynamic Island / Control Center can control it. The player (and Google's script) is only loaded when someone
// presses play. When a song ends — or can't be embedded — it moves on to the next one.

type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  loadVideoById(videoId: string): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
};
type YTNamespace = { Player: new (el: HTMLElement, opts: unknown) => YTPlayer };
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export type MusicState = {
  status: "idle" | "loading" | "playing" | "paused" | "error";
  time: number;
  duration: number;
  /** Position in the playlist. */
  index: number;
  /** 0..100 */
  volume: number;
};

type MusicApi = MusicState & {
  track: Track;
  toggle: () => void;
  seek: (seconds: number) => void;
  next: () => void;
  /** Restarts the song if it is more than 3 seconds in, otherwise goes to the previous one. */
  prev: () => void;
  playAt: (index: number) => void;
  setVolume: (volume: number) => void;
};

const MusicContext = createContext<MusicApi | null>(null);
export const useMusic = () => {
  const m = useContext(MusicContext);
  if (!m) throw new Error("useMusic must be used inside <MusicProvider>");
  return m;
};

let apiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  return (apiPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.onerror = () => {
      apiPromise = null;
      reject(new Error("Could not load the YouTube player"));
    };
    window.onYouTubeIframeAPIReady = () => resolve();
    document.head.appendChild(script);
  }));
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const indexRef = useRef(0);
  const volumeRef = useRef(80);
  const errorsInRow = useRef(0);
  const playAtRef = useRef<(index: number) => void>(() => {});
  const [state, setState] = useState<MusicState>({ status: "idle", time: 0, duration: 0, index: 0, volume: 80 });

  // While playing, follow the playhead.
  useEffect(() => {
    if (state.status !== "playing") return;
    const id = window.setInterval(() => {
      const p = player.current;
      if (p) setState((s) => ({ ...s, time: p.getCurrentTime(), duration: p.getDuration() || s.duration }));
    }, 500);
    return () => window.clearInterval(id);
  }, [state.status]);

  useEffect(() => () => player.current?.destroy(), []);

  const advance = useCallback(() => playAtRef.current(nextIndex(indexRef.current, playlist.length)), []);

  const createPlayer = useCallback(
    async (index: number) => {
      setState((s) => ({ ...s, status: "loading" }));
      try {
        await loadYouTubeApi();
      } catch {
        setState((s) => ({ ...s, status: "error" }));
        return;
      }
      if (!hostRef.current || !window.YT) return;
      const mount = document.createElement("div");
      hostRef.current.appendChild(mount);
      player.current = new window.YT.Player(mount, {
        host: "https://www.youtube-nocookie.com", // privacy-enhanced mode
        videoId: playlist[index].videoId,
        playerVars: { autoplay: 1, controls: 0, playsinline: 1, rel: 0, origin: window.location.origin },
        events: {
          onReady: () => {
            player.current?.setVolume(volumeRef.current);
            player.current?.playVideo();
          },
          onStateChange: (e: { data: number }) => {
            // 1 playing, 2 paused, 3 buffering, 0 ended
            if (e.data === 1) {
              errorsInRow.current = 0;
              setState((s) => ({ ...s, status: "playing", duration: player.current?.getDuration() || s.duration }));
            } else if (e.data === 2) setState((s) => ({ ...s, status: "paused" }));
            else if (e.data === 0) advance();
          },
          // A video that can't be embedded: skip it. Only give up if every song in a row failed.
          onError: () => {
            errorsInRow.current += 1;
            if (errorsInRow.current >= playlist.length) setState((s) => ({ ...s, status: "error" }));
            else advance();
          },
        },
      });
    },
    [advance],
  );

  const playAt = useCallback(
    (index: number) => {
      indexRef.current = index;
      setState((s) => ({ ...s, index, time: 0, duration: 0 }));
      if (player.current) {
        setState((s) => ({ ...s, status: "loading" }));
        player.current.loadVideoById(playlist[index].videoId);
      } else void createPlayer(index);
    },
    [createPlayer],
  );
  playAtRef.current = playAt;

  const toggle = useCallback(() => {
    if (!player.current) return void createPlayer(indexRef.current);
    if (state.status === "playing") player.current.pauseVideo();
    else player.current.playVideo();
  }, [createPlayer, state.status]);

  const seek = useCallback((seconds: number) => {
    player.current?.seekTo(seconds, true);
    setState((s) => ({ ...s, time: seconds }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    volumeRef.current = volume;
    player.current?.setVolume(volume);
    setState((s) => ({ ...s, volume }));
  }, []);

  const next = useCallback(() => playAt(nextIndex(indexRef.current, playlist.length)), [playAt]);
  const prev = useCallback(() => {
    if (state.time > 3) seek(0);
    else playAt(prevIndex(indexRef.current, playlist.length));
  }, [playAt, seek, state.time]);

  const value = useMemo<MusicApi>(
    () => ({ ...state, track: playlist[state.index], toggle, seek, next, prev, playAt, setVolume }),
    [state, toggle, seek, next, prev, playAt, setVolume],
  );

  return (
    <MusicContext value={value}>
      {children}
      {/* The (invisible) player lives here. It is never shown; the Music app and Control Center remote-control it. */}
      <div ref={hostRef} aria-hidden style={{ position: "fixed", width: 1, height: 1, opacity: 0, pointerEvents: "none", left: -10, top: -10 }} />
    </MusicContext>
  );
}
