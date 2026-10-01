// Checks for the home-screen layout (registry.tsx). Kept free of React so it can be tested with small fixtures.

/** A folder on the home screen: a tile that opens into a grid of its apps. */
export type FolderManifest = { id: string; name: string; apps: readonly string[] };

/** The home screen: pages of icons plus the dock. A slot holds an app id or a folder id. */
export type HomeLayout = { pages: readonly (readonly string[])[]; dock: readonly string[] };

/**
 * Everything wrong with a layout, as readable messages (empty = fine): unknown ids, an id used as both app and
 * folder, empty folders, folders inside folders, and apps placed more than once (on the home screen or in folders).
 */
export function layoutProblems(appIds: readonly string[], folders: Readonly<Record<string, FolderManifest>>, layout: HomeLayout): string[] {
  const problems: string[] = [];
  const isApp = (id: string) => appIds.includes(id);
  const seen = new Set<string>();
  const place = (id: string, where: string) => {
    if (seen.has(id)) problems.push(`"${id}" is placed more than once (again in ${where})`);
    seen.add(id);
  };

  for (const [key, folder] of Object.entries(folders)) {
    if (folder.id !== key) problems.push(`folder "${key}" has id "${folder.id}"`);
    if (isApp(key)) problems.push(`"${key}" is both an app and a folder`);
    if (folder.apps.length === 0) problems.push(`folder "${key}" is empty`);
  }

  const slots = [...layout.pages.flatMap((page, i) => page.map((id) => [id, `page ${i + 1}`] as const)), ...layout.dock.map((id) => [id, "the dock"] as const)];
  for (const [id, where] of slots) {
    const folder = folders[id];
    if (!folder && !isApp(id)) {
      problems.push(`${where} references unknown app or folder "${id}"`);
      continue;
    }
    place(id, where);
    for (const inner of folder?.apps ?? []) {
      if (folders[inner]) problems.push(`folder "${id}" contains another folder "${inner}"`);
      else if (!isApp(inner)) problems.push(`folder "${id}" references unknown app "${inner}"`);
      else place(inner, `folder "${id}"`);
    }
  }
  return problems;
}
