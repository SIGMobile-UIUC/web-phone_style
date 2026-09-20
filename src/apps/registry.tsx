// Every app on the phone. To add an app: add an entry here, create its screen (see apps/about for a small
// example), then place its id in `homeLayout`.
//   `component` = the screen shown when the app opens (lazy-loaded, so each app is its own download)
//   `href`      = opens that link in a new tab instead (Discord, Instagram)

import {
  Calculator,
  CalendarDays,
  Clock,
  IdCard,
  Info,
  MapPin,
  MessageCircle,
  Music,
  NotebookPen,
  Settings,
} from "lucide-react";
import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { FaDiscord, FaInstagram } from "react-icons/fa";
import { site } from "../content/site";
import { appIdFromPath } from "./routes";

export type AppIcon = ComponentType<{ size?: number | string; className?: string }>;

export type AppManifest = {
  id: string;
  name: string;
  icon: AppIcon;
  /** Gradient of the icon tile (top-left → bottom-right). */
  colors: [string, string];
  /** Colour of the glyph on the tile. */
  glyph?: string;
  href?: string;
  component?: LazyExoticComponent<ComponentType>;
};

// Our own "A"-style glyph for Projects (not Apple's artwork).
const ProjectsGlyph: AppIcon = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" className={className} aria-hidden>
    <path d="M12 4 5.5 19M12 4l6.5 15M8.6 14h6.8" />
  </svg>
);

export const apps: Record<string, AppManifest> = {
  about: { id: "about", name: "About", icon: Info, colors: ["#5ac8fa", "#0a7aff"], component: lazy(() => import("./about/AboutApp")) },
  projects: { id: "projects", name: "Projects", icon: ProjectsGlyph, colors: ["#24cbff", "#1a63ff"], component: lazy(() => import("./projects/ProjectsApp")) },
  exec: { id: "exec", name: "Executive Board", icon: IdCard, colors: ["#ffb340", "#ff7a00"], component: lazy(() => import("./exec/ExecApp")) },
  calendar: { id: "calendar", name: "Calendar", icon: CalendarDays, colors: ["#ffffff", "#e6e6ea"], glyph: "#ff3b30", component: lazy(() => import("./calendar/CalendarApp")) },
  clock: { id: "clock", name: "Clock", icon: Clock, colors: ["#3a3a3c", "#0d0d0f"], component: lazy(() => import("./clock/ClockApp")) },
  maps: { id: "maps", name: "Maps", icon: MapPin, colors: ["#7fe38b", "#23ad49"], component: lazy(() => import("./maps/MapsApp")) },
  messages: { id: "messages", name: "Messages", icon: MessageCircle, colors: ["#6fe37b", "#1fb53a"], component: lazy(() => import("./messages/MessagesApp")) },
  notes: { id: "notes", name: "Notes", icon: NotebookPen, colors: ["#ffe27a", "#f5b800"], glyph: "#6b4e00", component: lazy(() => import("./notes/NotesApp")) },
  calculator: { id: "calculator", name: "Calculator", icon: Calculator, colors: ["#4a4a4d", "#1c1c1e"], glyph: "#ff9f0a", component: lazy(() => import("./calculator/CalculatorApp")) },
  music: { id: "music", name: "Music", icon: Music, colors: ["#ff6b87", "#fa1f45"], component: lazy(() => import("./music/MusicApp")) },
  settings: { id: "settings", name: "Settings", icon: Settings, colors: ["#a9acb2", "#6d7077"], component: lazy(() => import("./settings/SettingsApp")) },
  discord: { id: "discord", name: "Discord", icon: FaDiscord, colors: ["#7b8cff", "#4f5bd5"], href: site.links.discord },
  instagram: { id: "instagram", name: "Instagram", icon: FaInstagram, colors: ["#f58529", "#dd2a7b"], href: site.links.instagram },
};

/** What is on the home screen, in order. Ids must exist in `apps` (a test checks this). */
export const homeLayout = {
  pages: [["about", "projects", "exec", "calendar", "clock", "maps", "notes", "calculator", "settings"]],
  dock: ["messages", "music", "discord", "instagram"],
} as const;

/** Apps that open inside the phone (i.e. have a route like /exec). */
export const internalAppIds = Object.values(apps)
  .filter((a) => !a.href)
  .map((a) => a.id);

export const appIdFromLocation = (pathname: string) => appIdFromPath(pathname, internalAppIds);
