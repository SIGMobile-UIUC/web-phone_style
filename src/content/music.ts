// The Music app's playlist: internet-famous songs. Each one streams from YouTube after the visitor presses play;
// nothing is hosted here. To add a song, add a line — `videoId` is the part after ?v= in the YouTube link.
// Prefer the artist's official upload (an unofficial re-upload can be taken down or blocked from embedding).
// If a video can't be embedded, the player skips to the next song by itself.

export type Track = { videoId: string; title: string; artist: string };

export const playlistName = "Internet Classics";

export const playlist: Track[] = [
  { videoId: "dQw4w9WgXcQ", title: "Never Gonna Give You Up", artist: "Rick Astley" },
  { videoId: "L_jWHffIx5E", title: "All Star", artist: "Smash Mouth" },
  { videoId: "FTQbiNvZqaY", title: "Africa", artist: "Toto" },
  { videoId: "y6120QOlsfU", title: "Sandstorm", artist: "Darude" },
  { videoId: "kfVsfOSbJY0", title: "Friday", artist: "Rebecca Black" },
  { videoId: "9bZkp7q19f0", title: "Gangnam Style", artist: "PSY" },
  { videoId: "ZyhrYis509A", title: "Barbie Girl", artist: "Aqua" },
  { videoId: "1k8craCGpgs", title: "Don't Stop Believin'", artist: "Journey" },
  { videoId: "LDU_Txk06tM", title: "Crab Rave", artist: "Noisestorm" },
  { videoId: "izGwDsrQ1eQ", title: "Careless Whisper", artist: "George Michael" },
];
