import type { DisplaySurface, ProviderId } from "../providers/types";
import {
  getSafeLocalStorage,
  getSafeStorageItem,
  setSafeStorageItem,
  type WebStorageLike,
} from "./local-storage";

export type CursorUsageUiModuleId = "billing_summary" | "usage_history";

const STORAGE_KEY_PREFIX = "ai-usage-dashboard:cursor-usage:collapsed:";

type CursorUsageUiPreferenceOptions = {
  storage?: WebStorageLike | null;
};

function resolveStorage(
  options?: CursorUsageUiPreferenceOptions,
): WebStorageLike | null {
  return options && "storage" in options
    ? (options.storage ?? null)
    : getSafeLocalStorage();
}

function buildStorageKey(
  providerId: ProviderId,
  surface: DisplaySurface,
  moduleId: CursorUsageUiModuleId,
): string {
  return `${STORAGE_KEY_PREFIX}${encodeURIComponent(providerId)}:${surface}:${moduleId}`;
}

export function readCursorUsageCollapsePreference(
  providerId: ProviderId,
  surface: DisplaySurface,
  moduleId: CursorUsageUiModuleId,
  options?: CursorUsageUiPreferenceOptions,
): boolean {
  return (
    getSafeStorageItem(
      resolveStorage(options),
      buildStorageKey(providerId, surface, moduleId),
    ) === "1"
  );
}

export function writeCursorUsageCollapsePreference(
  providerId: ProviderId,
  surface: DisplaySurface,
  moduleId: CursorUsageUiModuleId,
  isCollapsed: boolean,
  options?: CursorUsageUiPreferenceOptions,
): void {
  setSafeStorageItem(
    resolveStorage(options),
    buildStorageKey(providerId, surface, moduleId),
    isCollapsed ? "1" : "0",
  );
}
