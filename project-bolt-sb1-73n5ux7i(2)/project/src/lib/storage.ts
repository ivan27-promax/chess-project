export function readStoredChoice<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return allowed.find((option) => option === value) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeStoredChoice(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
  }
}
