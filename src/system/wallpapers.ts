// Wallpapers for the phone. Light ones go with the light theme, dark ones with dark mode.
// The first light / dark entry is that theme's default (and the fallback for unknown ids).
// To add one: append an entry (unique id, `dark` matches the theme it is meant for, `css` = a CSS background).

export type Wallpaper = { id: string; name: string; dark: boolean; css: string };

export const wallpapers: Wallpaper[] = [
  {
    id: "ocean",
    name: "Ocean",
    dark: false,
    css: "radial-gradient(90% 45% at 80% 0%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%), linear-gradient(180deg, #cfeaf8 0%, #6ec0ea 50%, #3aa7de 100%)",
  },
  {
    id: "sky",
    name: "Sky",
    dark: false,
    css: "radial-gradient(90% 42% at 50% -4%, #ffffff 0%, rgba(255,255,255,0) 72%), radial-gradient(70% 38% at 108% 42%, rgba(58,167,222,0.3), rgba(58,167,222,0) 70%), linear-gradient(180deg, #f7fcff 0%, #d9eefa 46%, #7cc4ec 100%)",
  },
  {
    id: "cloud",
    name: "Cloud",
    dark: false,
    css: "radial-gradient(80% 50% at 20% 0%, #ffffff 0%, rgba(255,255,255,0) 70%), linear-gradient(180deg, #ffffff 0%, #eef7fc 55%, #d4eaf6 100%)",
  },
  {
    id: "night",
    name: "Night",
    dark: true,
    css: "radial-gradient(90% 45% at 20% 0%, rgba(58,167,222,0.35) 0%, rgba(58,167,222,0) 70%), linear-gradient(180deg, #0d1c2c 0%, #0a1420 60%, #060c14 100%)",
  },
  {
    id: "midnight",
    name: "Midnight",
    dark: true,
    css: "radial-gradient(80% 40% at 90% 100%, rgba(31,134,189,0.5) 0%, rgba(31,134,189,0) 70%), linear-gradient(180deg, #0b1626 0%, #101e36 100%)",
  },
];

export const wallpapersFor = (dark: boolean): Wallpaper[] => wallpapers.filter((w) => w.dark === dark);

/** Unknown ids (e.g. a removed wallpaper saved in someone's browser) fall back to the first light one. */
export const resolveWallpaper = (id: string): Wallpaper => wallpapers.find((w) => w.id === id) ?? wallpapers[0];
