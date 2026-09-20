import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { TermMember, TermSummary } from "../../content/types";
import { formatTermLabel } from "../../lib/format";
import { useReducedMotionPref } from "../../system/PrefsProvider";
import { useActiveCard } from "./ActiveCard";
import { getRoster } from "./api";
import MemberCard from "./MemberCard";
import { rarityOf } from "./roles";

type Load = { status: "idle" | "loading" | "ready" | "error"; roster: TermMember[] };

/**
 * One semester's board. The current term is always open. Past terms are collapsed: their cards (and photos)
 * are not even created until you open the section, and the roster is only requested at that moment — that is
 * what keeps a long history cheap. Opening/closing animates the height.
 */
export default function TermSection({ term, current }: { term: TermSummary; current: boolean }) {
  const [open, setOpen] = useState(current);
  const [animating, setAnimating] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [load, setLoad] = useState<Load>({ status: "idle", roster: [] });
  const loaded = useRef(false);
  const reduced = useReducedMotionPref();
  const { close } = useActiveCard();
  const bodyId = useId();

  // Request the roster the first time the section is open (and again on "Try again").
  useEffect(() => {
    if (!open || loaded.current) return;
    let stale = false;
    setLoad((l) => ({ ...l, status: "loading" }));
    getRoster(term.id).then(
      (roster) => {
        if (stale) return;
        loaded.current = true;
        setLoad({ status: "ready", roster });
      },
      () => !stale && setLoad({ status: "error", roster: [] }),
    );
    return () => {
      stale = true;
    };
  }, [open, term.id, attempt]);

  const label = formatTermLabel(term);
  const toggle = () => {
    close(); // don't leave an expanded card's backdrop behind a section that is disappearing
    setOpen((o) => !o);
  };

  return (
    <section className="exec-term">
      {current ? (
        <h2 className="exec-term__title">
          {label}
          <span className="exec-term__badge">Current</span>
        </h2>
      ) : (
        <h2 className="exec-term__title">
          <button type="button" className="exec-term__toggle" aria-expanded={open} aria-controls={bodyId} onClick={toggle}>
            <span>{label}</span>
            <span className="exec-term__count">{term.memberCount} members</span>
            <ChevronDown aria-hidden className={open ? "is-open" : ""} />
          </button>
        </h2>
      )}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={bodyId}
            key="body"
            className="exec-term__body"
            initial={{ height: reduced ? "auto" : 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: reduced ? "auto" : 0, opacity: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.32, ease: "easeOut" }}
            // Clip only while the height animates; at rest an expanded card must be free to grow past the box.
            style={{ overflow: animating ? "hidden" : "visible" }}
            onAnimationStart={() => setAnimating(true)}
            onAnimationComplete={() => setAnimating(false)}
          >
            {load.status === "ready" ? (
              <div className="exec-grid">
                {load.roster.map((m, i) => (
                  <MemberCard
                    key={m.id}
                    member={m}
                    rarity={rarityOf(m, current)}
                    number={i + 1}
                    total={load.roster.length}
                    showcase={current && i === 0}
                  />
                ))}
              </div>
            ) : load.status === "error" ? (
              <p className="exec-note">
                Couldn't load this board.{" "}
                <button type="button" className="exec-note__retry" onClick={() => setAttempt((a) => a + 1)}>
                  Try again
                </button>
              </p>
            ) : (
              <p className="exec-note" aria-live="polite">
                Loading…
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
