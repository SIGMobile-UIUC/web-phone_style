import { useEffect } from "react";
import { useSystem } from "./SystemProvider";

/** An app with a dark screen calls `useStatusBarStyle("light")` so the clock and icons on top stay readable. */
export function useStatusBarStyle(style: "dark" | "light") {
  const { setStatusStyle } = useSystem();
  useEffect(() => {
    setStatusStyle(style);
    return () => setStatusStyle("dark");
  }, [style, setStatusStyle]);
}
