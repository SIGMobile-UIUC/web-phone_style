import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import type { TermMember } from "../../content/types";

type ActiveCardState = { active: TermMember | null; toggle: (m: TermMember) => void; close: () => void };

const ActiveCardContext = createContext<ActiveCardState>({ active: null, toggle: () => {}, close: () => {} });
export const useActiveCard = () => useContext(ActiveCardContext);

/** Tracks which card is expanded; renders the dimmed backdrop and the caption (name + mailto link). */
export function ActiveCardProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<TermMember | null>(null);
  const toggle = useCallback((m: TermMember) => setActive((a) => (a?.id === m.id ? null : m)), []);
  const close = useCallback(() => setActive(null), []);

  // Esc closes the card first. Capture phase + stopPropagation so the app window's own Esc handler
  // (which would close the whole app) doesn't also fire.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setActive(null);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [active]);

  return (
    <ActiveCardContext value={{ active, toggle, close }}>
      {children}
      {active && (
        <>
          <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm" onClick={close} />
          <button
            onClick={close}
            aria-label="Close"
            className="fixed right-4 top-14 z-[300] rounded-full bg-white/15 p-2 text-white hover:bg-white/30"
          >
            <X size={24} />
          </button>
          <div className="pointer-events-none fixed inset-x-0 bottom-10 z-[300] flex flex-col items-center px-4 text-center font-mono text-white">
            <span className="font-extrabold">
              {active.name} · {active.role}
            </span>
            {active.email && (
              <a href={`mailto:${active.email}`} className="pointer-events-auto text-[#8fd3f4] underline">
                {active.email}
              </a>
            )}
          </div>
        </>
      )}
    </ActiveCardContext>
  );
}
