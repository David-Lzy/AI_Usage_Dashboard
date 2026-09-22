import { getSafeLocalStorage, getSafeStorageItem, removeSafeStorageItem, setSafeStorageItem } from "../shared/local-storage";

export const STORE_SCREENSHOT_SEED_LOCK_STORAGE_KEY = "ai-usage-dashboard.store-screenshot-seed-lock";

export function isStoreScreenshotSeedLockEnabled(): boolean {
  const storage = getSafeLocalStorage();
  return storage !== null && getSafeStorageItem(storage, STORE_SCREENSHOT_SEED_LOCK_STORAGE_KEY) === "true";
}

export function setStoreScreenshotSeedLockEnabled(enabled: boolean) {
  const storage = getSafeLocalStorage();
  if (!storage) return;
  if (enabled) setSafeStorageItem(storage, STORE_SCREENSHOT_SEED_LOCK_STORAGE_KEY, "true");
  else removeSafeStorageItem(storage, STORE_SCREENSHOT_SEED_LOCK_STORAGE_KEY);
}
