import { useState, type ReactNode } from "react";
import "./ui.css";

/**
 * The chrome every app shares: a large title that scrolls away and collapses into a small centred title in a
 * translucent bar, over a scrolling white page. Apps only provide the title and their content.
 */
export default function AppFrame({ title, children }: { title: string; children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  return (
    <div className="appframe">
      <header className={`appframe__nav${scrolled ? " is-scrolled" : ""}`} aria-hidden>
        {title}
      </header>
      <div className="appframe__scroll" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 26)}>
        <h1 className="appframe__large">{title}</h1>
        {children}
        <div className="appframe__end" />
      </div>
    </div>
  );
}
