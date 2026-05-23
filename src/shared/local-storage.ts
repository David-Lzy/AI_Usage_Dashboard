function getSafeWindowStorage(kind: "localStorage" | "sessionStorage"): Storage | null {
  if (typeof window === "undefined" || globalThis !== window) {
    return null;
  }

  try {
    const storage = window[kind];

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

export function getSafeLocalStorage(): Storage | null {
  return getSafeWindowStorage("localStorage");
}

export function getSafeSessionStorage(): Storage | null {
  return getSafeWindowStorage("sessionStorage");
}
