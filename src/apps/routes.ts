/** "/exec/whatever" -> "exec", if that is one of the given app ids; otherwise null (home). */
export function appIdFromPath(pathname: string, appIds: readonly string[]): string | null {
  const first = pathname.split("/").filter(Boolean)[0];
  return first && appIds.includes(first) ? first : null;
}
