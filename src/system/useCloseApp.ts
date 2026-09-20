import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Closes the open app. If the app was opened from the home screen, that is a "back" (so the browser history
 * stays clean); if the page was loaded straight on an app URL, there is nothing to go back to, so go home.
 */
export function useCloseApp() {
  const navigate = useNavigate();
  return useCallback(() => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate("/", { replace: true });
  }, [navigate]);
}
