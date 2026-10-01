import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { apps, type AppManifest, type FolderManifest } from "../apps/registry";
import AppIcon from "./AppIcon";
import { useReducedMotionPref } from "./PrefsProvider";

/**
 * An open folder: the home screen blurs and the folder's apps appear in a panel. Tapping outside the panel or
 * pressing Esc closes it. It stays open behind an app launched from it, so closing that app lands back here.
 */
export default function FolderView({
  folder,
  appOpen,
  onOpenApp,
  onClose,
}: {
  folder: FolderManifest;
  /** An app is open on top: Esc belongs to the app then, not the folder. */
  appOpen: boolean;
  onOpenApp: (app: AppManifest, tile: DOMRect) => void;
  onClose: () => void;
}) {
  const reduced = useReducedMotionPref();
  const panelRef = useRef<HTMLDivElement>(null);

  // Move focus into the folder, and give it back to the folder tile when the folder closes.
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.querySelector<HTMLElement>(".app-icon")?.focus({ preventScroll: true });
    return () => opener?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (appOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [appOpen, onClose]);

  const fade = { duration: reduced ? 0.01 : 0.2 };
  const pop = reduced ? { duration: 0.01 } : ({ type: "spring", stiffness: 380, damping: 30 } as const);

  return (
    <motion.div
      className="folder"
      role="dialog"
      aria-modal="true"
      aria-label={`${folder.name} folder`}
      inert={appOpen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={fade}
      onClick={(e) => !(e.target as Element).closest(".folder__panel") && onClose()}
    >
      <h2 className="folder__name">{folder.name}</h2>
      <motion.div ref={panelRef} className="folder__panel" initial={{ scale: 0.6 }} animate={{ scale: 1 }} exit={{ scale: 0.6 }} transition={pop}>
        {folder.apps.map((id) => (
          <AppIcon key={id} app={apps[id]} onOpen={onOpenApp} />
        ))}
      </motion.div>
    </motion.div>
  );
}
