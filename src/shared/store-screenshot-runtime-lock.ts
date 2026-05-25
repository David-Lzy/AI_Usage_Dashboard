import {
  getSafeLocalStorage,
  getSafeStorageItem,
  removeSafeStorageItem,
  setSafeStorageItem,
} from "./local-storage";

export const STORE_SCREENSHOT_RUNTIME_LOCK_STORAGE_KEY =
  "ai-usage-dashboard.store-screenshot-runtime-lock";

function hasChromeStorage(): boolean {
  return typeof chrome !== "undefined" && typeof chrome.storage?.local !== "undefined";
}

export async function readStoreScreenshotRuntimeLock(): Promise<boolean> {
  if (hasChromeStorage()) {
    const stored = await chrome.storage.local.get(
      STORE_SCREENSHOT_RUNTIME_LOCK_STORAGE_KEY,
    );

    return stored[STORE_SCREENSHOT_RUNTIME_LOCK_STORAGE_KEY] === true;
  }

  const localStorage = getSafeLocalStorage();

  if (localStorage) {
    return (
      getSafeStorageItem(localStorage, STORE_SCREENSHOT_RUNTIME_LOCK_STORAGE_KEY) ===
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

  const localStorage = getSafeLocalStorage();

  if (localStorage) {
    if (enabled) {
      setSafeStorageItem(
        localStorage,
        STORE_SCREENSHOT_RUNTIME_LOCK_STORAGE_KEY,
        "true",
      );
    } else {
      removeSafeStorageItem(localStorage, STORE_SCREENSHOT_RUNTIME_LOCK_STORAGE_KEY);
    }
  }
}
