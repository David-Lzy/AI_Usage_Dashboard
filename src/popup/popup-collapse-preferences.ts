import {
  getSafeLocalStorage,
  getSafeStorageItem,
  setSafeStorageItem,
  type WebStorageLike,
} from "../shared/local-storage";

export type PopupCollapsePreferenceTarget = "headerActions" | "footerInfo";

const POPUP_COLLAPSE_STORAGE_KEYS: Record<
  PopupCollapsePreferenceTarget,
  string
> = {
  headerActions: "ai-usage-dashboard:popup-collapse:header-actions",
  footerInfo: "ai-usage-dashboard:popup-collapse:footer-info",
};

type PopupCollapsePreferenceOptions = {
  storage?: WebStorageLike | null;
};

function resolveStorage(
  options?: PopupCollapsePreferenceOptions,
): WebStorageLike | null {
  return options && "storage" in options
    ? (options.storage ?? null)
    : getSafeLocalStorage();
}

export function readPopupCollapsePreference(
  target: PopupCollapsePreferenceTarget,
  options?: PopupCollapsePreferenceOptions,
): boolean {
  const storage = resolveStorage(options);
  const rawValue = getSafeStorageItem(storage, POPUP_COLLAPSE_STORAGE_KEYS[target]);

  return rawValue === "1";
}

export function writePopupCollapsePreference(
  target: PopupCollapsePreferenceTarget,
  isCollapsed: boolean,
  options?: PopupCollapsePreferenceOptions,
): void {
  const storage = resolveStorage(options);

  setSafeStorageItem(
    storage,
    POPUP_COLLAPSE_STORAGE_KEYS[target],
    isCollapsed ? "1" : "0",
  );
}
