import type { AppManifest } from "../apps/registry";

/** One icon tile (+ label). External apps render as a link that opens in a new tab. */
export default function AppIcon({
  app,
  showLabel = true,
  onOpen,
}: {
  app: AppManifest;
  showLabel?: boolean;
  /** Called with the tile's on-screen rect so the app can grow out of it. */
  onOpen: (app: AppManifest, tile: DOMRect) => void;
}) {
  const Icon = app.icon;
  const content = (
    <>
      <span
        className="app-icon__tile"
        style={{ background: `linear-gradient(155deg, ${app.colors[0]}, ${app.colors[1]})`, color: app.glyph ?? "#fff" }}
      >
        <Icon size="54%" />
      </span>
      {showLabel && <span className="app-icon__label">{app.name}</span>}
    </>
  );

  if (app.href) {
    return (
      <a className="app-icon" href={app.href} target="_blank" rel="noopener noreferrer" aria-label={`${app.name} (opens in a new tab)`}>
        {content}
      </a>
    );
  }
  return (
    <button
      type="button"
      className="app-icon"
      aria-label={app.name}
      onClick={(e) => onOpen(app, e.currentTarget.querySelector(".app-icon__tile")!.getBoundingClientRect())}
    >
      {content}
    </button>
  );
}
