export type WebStorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function getSafeWindowStorage(kind: "localStorage" | "sessionStorage"): Storage | null {
  if (typeof window === "undefined") {
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

export function getSafeStorageItem(
  storage: WebStorageLike | null | undefined,
  key: string,
): string | null {
  if (!storage) {
    return null;
  }

  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function setSafeStorageItem(
  storage: WebStorageLike | null | undefined,
  key: string,
  value: string,
): boolean {
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeSafeStorageItem(
  storage: WebStorageLike | null | undefined,
  key: string,
): boolean {
  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
