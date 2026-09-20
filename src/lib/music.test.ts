import { expect, test } from "bun:test";
import { playlist } from "../content/music";
import { formatTrackTime, islandActivity, nextIndex, prevIndex } from "./music";

test("track times", () => {
  expect(formatTrackTime(213)).toBe("3:33");
  expect(formatTrackTime(5)).toBe("0:05");
  expect(formatTrackTime(600)).toBe("10:00");
  expect(formatTrackTime(-3)).toBe("0:00");
  expect(formatTrackTime(NaN)).toBe("0:00");
});

test("the island shows a live meeting before music, music before nothing", () => {
  expect(islandActivity({ meetingLive: true, musicPlaying: true })).toBe("meeting");
  expect(islandActivity({ meetingLive: false, musicPlaying: true })).toBe("music");
  expect(islandActivity({ meetingLive: false, musicPlaying: false })).toBe("idle");
});

test("next/previous wrap around the playlist", () => {
  expect(nextIndex(0, 10)).toBe(1);
  expect(nextIndex(9, 10)).toBe(0);
  expect(prevIndex(0, 10)).toBe(9);
  expect(prevIndex(5, 10)).toBe(4);
});

test("content/music.ts: about ten songs, unique 11-character video ids, real titles", () => {
  expect(playlist.length).toBeGreaterThanOrEqual(8);
  expect(new Set(playlist.map((t) => t.videoId)).size).toBe(playlist.length);
  for (const t of playlist) {
    expect(t.videoId, `${t.title}: video id`).toMatch(/^[A-Za-z0-9_-]{11}$/);
    expect(t.title.trim()).not.toBe("");
    expect(t.artist.trim()).not.toBe("");
  }
});
