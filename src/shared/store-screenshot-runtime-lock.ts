export const STORE_SCREENSHOT_RUNTIME_LOCK_STORAGE_KEY =
  "ai-usage-dashboard.store-screenshot-runtime-lock";

function hasChromeStorage(): boolean {
  return typeof chrome !== "undefined" && typeof chrome.storage?.local !== "undefined";
}

function hasLocalStorage(): boolean {
  return (
    typeof globalThis.localStorage?.getItem === "function" &&
    typeof globalThis.localStorage?.setItem === "function" &&
    typeof globalThis.localStorage?.removeItem === "function"
  );
}

export async function readStoreScreenshotRuntimeLock(): Promise<boolean> {
  if (hasChromeStorage()) {
    const stored = await chrome.storage.local.get(
      STORE_SCREENSHOT_RUNTIME_LOCK_STORAGE_KEY,
    );

    return stored[STORE_SCREENSHOT_RUNTIME_LOCK_STORAGE_KEY] === true;
  }

  if (hasLocalStorage()) {
    return (
      globalThis.localStorage.getItem(STORE_SCREENSHOT_RUNTIME_LOCK_STORAGE_KEY) ===
      "true"
    );
  }

  return false;
}

export async function writeStoreScreenshotRuntimeLock(
  enabled: boolean,
): Promise<void> {
  if (hasChromeStorage()) {
    if (enabled) {
      await chrome.storage.local.set({
        [STORE_SCREENSHOT_RUNTIME_LOCK_STORAGE_KEY]: true,
      });
    } else {
      await chrome.storage.local.remove(STORE_SCREENSHOT_RUNTIME_LOCK_STORAGE_KEY);
    }
  }

  if (hasLocalStorage()) {
    if (enabled) {
      globalThis.localStorage.setItem(
        STORE_SCREENSHOT_RUNTIME_LOCK_STORAGE_KEY,
        "true",
      );
    } else {
      globalThis.localStorage.removeItem(
        STORE_SCREENSHOT_RUNTIME_LOCK_STORAGE_KEY,
      );
    }
  }
}
