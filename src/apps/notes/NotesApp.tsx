import { ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { resources } from "../../content/resources";
import { todayInClubZone } from "../../lib/calendar";
import { domainOf, filterResources, groupByCategory, isRecent } from "../../lib/resources";
import { useNow } from "../../system/useNow";
import AppFrame from "../../ui/AppFrame";
import "./notes.css";

/** Learning resources, grouped by category. The list lives in src/content/resources.ts. */
export default function NotesApp() {
  const [query, setQuery] = useState("");
  const today = todayInClubZone(useNow(3_600_000));
  const groups = useMemo(() => groupByCategory(filterResources(resources, query)), [query]);

  return (
    <AppFrame title="Resources">
      <label className="notes-search">
        <Search aria-hidden />
        <input
          type="search"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search resources"
          // The phone disables text selection globally; the field itself must stay editable.
          style={{ userSelect: "text", WebkitUserSelect: "text" }}
        />
      </label>

      {groups.length === 0 && <p className="notes-empty">No links match “{query}”.</p>}

      {groups.map(({ category, items }) => (
        <section key={category}>
          <h2 className="ui-section">{category}</h2>
          <div className="notes-list">
            {items.map((r) => (
              <a className="notes-row" key={r.url} href={r.url} target="_blank" rel="noopener noreferrer">
                <span className="notes-row__main">
                  <span className="notes-row__title">
                    {r.title}
                    {isRecent(r.addedAt, today) && <span className="notes-row__new">New</span>}
                  </span>
                  {r.note && <span className="notes-row__note">{r.note}</span>}
                  <span className="notes-row__domain">{domainOf(r.url)}</span>
                </span>
                <ArrowUpRight aria-label="opens in a new tab" />
              </a>
            ))}
          </div>
        </section>
      ))}
    </AppFrame>
  );
}
