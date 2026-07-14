import {
  getSafeLocalStorage,
  getSafeStorageItem,
  setSafeStorageItem,
  type WebStorageLike,
} from "../shared/local-storage";
import type {
  ProviderId,
  ProviderUsageHistoryModuleId,
} from "../providers/types";

export type PopupCollapsePreferenceTarget = "headerActions" | "footerInfo";

const POPUP_COLLAPSE_STORAGE_KEYS: Record<
  PopupCollapsePreferenceTarget,
  string
> = {
  headerActions: "ai-usage-dashboard:popup-collapse:header-actions",
  footerInfo: "ai-usage-dashboard:popup-collapse:footer-info",
};

const POPUP_USAGE_HISTORY_COLLAPSE_STORAGE_KEY_PREFIX =
  "ai-usage-dashboard:popup-collapse:usage-history:";

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

function buildPopupUsageHistoryCollapseStorageKey(
  providerId: ProviderId,
  moduleId: ProviderUsageHistoryModuleId,
): string {
  return `${POPUP_USAGE_HISTORY_COLLAPSE_STORAGE_KEY_PREFIX}${encodeURIComponent(
    providerId,
  )}:${moduleId}`;
}

export function readPopupUsageHistoryCollapsePreference(
  providerId: ProviderId,
  moduleId: ProviderUsageHistoryModuleId,
  options?: PopupCollapsePreferenceOptions,
): boolean {
  const storage = resolveStorage(options);
  const rawValue = getSafeStorageItem(
    storage,
    buildPopupUsageHistoryCollapseStorageKey(providerId, moduleId),
  );

  return rawValue === "1";
}

export function writePopupUsageHistoryCollapsePreference(
  providerId: ProviderId,
  moduleId: ProviderUsageHistoryModuleId,
  isCollapsed: boolean,
  options?: PopupCollapsePreferenceOptions,
): void {
  const storage = resolveStorage(options);

  setSafeStorageItem(
    storage,
    buildPopupUsageHistoryCollapseStorageKey(providerId, moduleId),
    isCollapsed ? "1" : "0",
  );
}
