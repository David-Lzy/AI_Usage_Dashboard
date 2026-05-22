export function getSafeLocalStorage(): Storage | null {
  if (typeof window === "undefined" || globalThis !== window) {
    return null;
  }

  try {
    const storage = window.localStorage;

    if (
      storage &&
      typeof storage.getItem === "function" &&
      typeof storage.setItem === "function" &&
      typeof storage.removeItem === "function"
    ) {
      return storage;
    }
  } catch {
    return null;
  }

  return null;
}
