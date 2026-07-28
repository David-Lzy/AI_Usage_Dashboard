import {
  getSafeLocalStorage,
  getSafeStorageItem,
  setSafeStorageItem,
  type WebStorageLike,
} from "../shared/local-storage";
import type { ProviderUsageHistoryModuleId } from "../providers/types";

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
const POPUP_PROVIDER_CARD_COLLAPSE_STORAGE_KEY_PREFIX =
  "ai-usage-dashboard:popup-collapse:provider-card:";

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
  providerCardId: string,
  moduleId: ProviderUsageHistoryModuleId,
): string {
  return `${POPUP_USAGE_HISTORY_COLLAPSE_STORAGE_KEY_PREFIX}${encodeURIComponent(
    providerCardId,
  )}:${moduleId}`;
}

export function readPopupUsageHistoryCollapsePreference(
  providerCardId: string,
  moduleId: ProviderUsageHistoryModuleId,
  options?: PopupCollapsePreferenceOptions,
): boolean {
  const storage = resolveStorage(options);
  const rawValue = getSafeStorageItem(
    storage,
    buildPopupUsageHistoryCollapseStorageKey(providerCardId, moduleId),
  );

  return rawValue === "1";
}

export function writePopupUsageHistoryCollapsePreference(
  providerCardId: string,
  moduleId: ProviderUsageHistoryModuleId,
  isCollapsed: boolean,
  options?: PopupCollapsePreferenceOptions,
): void {
  const storage = resolveStorage(options);

  setSafeStorageItem(
    storage,
    buildPopupUsageHistoryCollapseStorageKey(providerCardId, moduleId),
    isCollapsed ? "1" : "0",
  );
}

function buildPopupProviderCardCollapseStorageKey(
  providerCardId: string,
): string {
  return `${POPUP_PROVIDER_CARD_COLLAPSE_STORAGE_KEY_PREFIX}${encodeURIComponent(
    providerCardId,
  )}`;
}

export function readPopupProviderCardCollapsePreference(
  providerCardId: string,
  options?: PopupCollapsePreferenceOptions,
): boolean {
  const storage = resolveStorage(options);
  const rawValue = getSafeStorageItem(
    storage,
    buildPopupProviderCardCollapseStorageKey(providerCardId),
  );

  return rawValue === "1";
}

export function writePopupProviderCardCollapsePreference(
  providerCardId: string,
  isCollapsed: boolean,
  options?: PopupCollapsePreferenceOptions,
): void {
  const storage = resolveStorage(options);

  setSafeStorageItem(
    storage,
    buildPopupProviderCardCollapseStorageKey(providerCardId),
    isCollapsed ? "1" : "0",
  );
}
