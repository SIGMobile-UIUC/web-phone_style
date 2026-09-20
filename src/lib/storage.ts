// Browser storage can throw (private windows, blocked site data). Every read/write goes through here so the
// site still works without it.

const safe = <T>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export const session = {
  get: (key: string): string | null => safe(() => sessionStorage.getItem(key), null),
  set: (key: string, value: string) => safe(() => sessionStorage.setItem(key, value), undefined),
};

export const local = {
  get: (key: string): string | null => safe(() => localStorage.getItem(key), null),
  set: (key: string, value: string) => safe(() => localStorage.setItem(key, value), undefined),
};
