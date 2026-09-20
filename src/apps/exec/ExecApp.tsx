import { useEffect, useState } from "react";
import type { TermSummary } from "../../content/types";
import AppFrame from "../../ui/AppFrame";
import { ActiveCardProvider } from "./ActiveCard";
import { listTerms } from "./api";
import TermSection from "./TermSection";
import "./exec.css";

/** The Executive Board app: the current semester's trading cards, and every past semester below (collapsed). */
export default function ExecApp() {
  const [terms, setTerms] = useState<TermSummary[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    listTerms().then(setTerms, () => setFailed(true));
  }, []);

  return (
    <AppFrame title="Executive Board">
      <ActiveCardProvider>
        {failed ? (
          <p className="exec-note">Couldn't load the board. Please reload the page.</p>
        ) : !terms ? (
          <p className="exec-note" aria-live="polite">
            Loading…
          </p>
        ) : (
          terms.map((t, i) => (
            <div key={t.id}>
              {i === 1 && <h2 className="ui-section">Past boards</h2>}
              <TermSection term={t} current={i === 0} />
            </div>
          ))
        )}
      </ActiveCardProvider>
    </AppFrame>
  );
}
