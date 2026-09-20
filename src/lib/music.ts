/** 213 -> "3:33" */
export function formatTrackTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export type IslandActivity = "meeting" | "music" | "idle";

/** What the Dynamic Island shows. A meeting in progress beats music; music beats nothing. */
export function islandActivity({ meetingLive, musicPlaying }: { meetingLive: boolean; musicPlaying: boolean }): IslandActivity {
  if (meetingLive) return "meeting";
  return musicPlaying ? "music" : "idle";
}

/** Index of the next song, wrapping to the start. */
export const nextIndex = (i: number, length: number): number => (i + 1) % length;

/** Index of the previous song, wrapping to the end. */
export const prevIndex = (i: number, length: number): number => (i - 1 + length) % length;