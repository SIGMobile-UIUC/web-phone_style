import { ExternalLink, Lightbulb } from "lucide-react";
import { terms } from "../../content/terms";
import { formatTermLabel } from "../../lib/format";
import AppFrame from "../../ui/AppFrame";
import "./projects.css";

// One tint per card, cycling — all in the site's blue family.
const tints = [
  ["#5ac8fa", "#0a7aff"],
  ["#3aa7de", "#1f5fb8"],
  ["#7dd3fc", "#2a86bb"],
] as const;

/** What the club is building this semester, as big "featured" cards. Data: the newest term's `projects`. */
export default function ProjectsApp() {
  const term = terms[0];

  return (
    <AppFrame title="Projects">
      <p className="projects-lead">{formatTermLabel(term)}</p>

      {term.projects.map((p, i) => {
        const [a, b] = tints[i % tints.length];
        return (
          <article className="project-card" key={p.name} style={{ background: `linear-gradient(155deg, ${a}, ${b})` }}>
            <h2 className="project-card__name">{p.name}</h2>
            <p className="project-card__tagline">{p.tagline}</p>
            <div className="project-card__foot">
              <div className="project-card__stack">
                {p.stack.map((s) => (
                  <span className="project-chip" key={s}>
                    {s}
                  </span>
                ))}
              </div>
              {p.repoUrl && (
                <a className="project-card__link" href={p.repoUrl} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} code (opens in a new tab)`}>
                  <ExternalLink aria-hidden /> Code
                </a>
              )}
            </div>
          </article>
        );
      })}

      <article className="project-card project-card--idea">
        <Lightbulb aria-hidden />
        <h2 className="project-card__name">Choose your own!</h2>
        <p className="project-card__tagline">Not into these? You can choose your own project.</p>
      </article>
    </AppFrame>
  );
}
