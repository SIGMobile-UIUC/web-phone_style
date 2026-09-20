import { AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";
import { apps, appIdFromLocation } from "../apps/registry";
import AppWindow from "./AppWindow";

/** Shows the app that the URL points at (/exec, /about, …); nothing on the home screen. */
export default function AppHost() {
  const id = appIdFromLocation(useLocation().pathname);
  return <AnimatePresence>{id && <AppWindow key={id} app={apps[id]} />}</AnimatePresence>;
}
