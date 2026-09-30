import { apps, type FolderManifest } from "../apps/registry";
import { tileStyle } from "./AppIcon";

/** A folder on the home screen: a frosted tile showing its first nine apps as tiny icons. */
export default function FolderIcon({
  folder,
  showLabel = true,
  expanded,
  onOpen,
}: {
  folder: FolderManifest;
  showLabel?: boolean;
  expanded: boolean;
  onOpen: () => void;
}) {
  return (
    <button type="button" className="app-icon" aria-label={`${folder.name} folder`} aria-haspopup="dialog" aria-expanded={expanded} onClick={onOpen}>
      <span className="app-icon__tile folder-tile">
        {folder.apps.slice(0, 9).map((id) => {
          const Icon = apps[id].icon;
          return (
            <span key={id} className="folder-tile__app" style={tileStyle(apps[id])}>
              <Icon size="62%" />
            </span>
          );
        })}
      </span>
      {showLabel && <span className="app-icon__label">{folder.name}</span>}
    </button>
  );
}
