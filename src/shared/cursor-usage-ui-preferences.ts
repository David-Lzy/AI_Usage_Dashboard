import type { DisplaySurface, ProviderId } from "../providers/types";
import {
  getSafeLocalStorage,
  getSafeStorageItem,
  setSafeStorageItem,
  type WebStorageLike,
} from "./local-storage";

export type CursorUsageUiModuleId = "billing_summary" | "usage_history";
export type CursorUsageUiModulePreference = {
  id: CursorUsageUiModuleId;
  visible: boolean;
};
export type CursorUsageUiPreferences = Record<
  DisplaySurface,
  CursorUsageUiModulePreference[]
>;

const STORAGE_KEY_PREFIX = "ai-usage-dashboard:cursor-usage:collapsed:";
const MODULE_PREFERENCES_STORAGE_KEY =
  "ai-usage-dashboard:cursor-usage:module-preferences";
const MODULE_IDS = [
  "billing_summary",
  "usage_history",
] as const satisfies readonly CursorUsageUiModuleId[];

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

function createDefaultSurfacePreferences(): CursorUsageUiModulePreference[] {
  return MODULE_IDS.map((id) => ({ id, visible: true }));
}

export function createDefaultCursorUsageUiPreferences(): CursorUsageUiPreferences {
  return {
    popup: createDefaultSurfacePreferences(),
    sidebar: createDefaultSurfacePreferences(),
    fullPage: createDefaultSurfacePreferences(),
  };
}

function normalizeSurfacePreferences(
  value: unknown,
): CursorUsageUiModulePreference[] {
  const seen = new Set<CursorUsageUiModuleId>();
  const normalized = Array.isArray(value)
    ? value.flatMap((candidate) => {
        if (
          typeof candidate !== "object" ||
          candidate === null ||
          !("id" in candidate) ||
          !("visible" in candidate)
        ) {
          return [];
        }
        const id = MODULE_IDS.find((moduleId) => moduleId === candidate.id);
        if (!id || typeof candidate.visible !== "boolean" || seen.has(id)) {
          return [];
        }
        seen.add(id);
        return [{ id, visible: candidate.visible }];
      })
    : [];

  for (const preference of createDefaultSurfacePreferences()) {
    if (!seen.has(preference.id)) {
      normalized.push(preference);
    }
  }
  return normalized;
}

export function normalizeCursorUsageUiPreferences(
  value: unknown,
): CursorUsageUiPreferences {
  const source =
    typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  return {
    popup: normalizeSurfacePreferences(source.popup),
    sidebar: normalizeSurfacePreferences(source.sidebar),
    fullPage: normalizeSurfacePreferences(source.fullPage),
  };
}

export function readCursorUsageUiPreferences(
  options?: CursorUsageUiPreferenceOptions,
): CursorUsageUiPreferences {
  const rawValue = getSafeStorageItem(
    resolveStorage(options),
    MODULE_PREFERENCES_STORAGE_KEY,
  );
  if (!rawValue) {
    return createDefaultCursorUsageUiPreferences();
  }
  try {
    return normalizeCursorUsageUiPreferences(JSON.parse(rawValue));
  } catch {
    return createDefaultCursorUsageUiPreferences();
  }
}

export function writeCursorUsageUiPreferences(
  value: CursorUsageUiPreferences,
  options?: CursorUsageUiPreferenceOptions,
): void {
  setSafeStorageItem(
    resolveStorage(options),
    MODULE_PREFERENCES_STORAGE_KEY,
    JSON.stringify(normalizeCursorUsageUiPreferences(value)),
  );
}

export function setCursorUsageModuleVisibility(
  value: CursorUsageUiPreferences,
  surface: DisplaySurface,
  moduleId: CursorUsageUiModuleId,
  visible: boolean,
): CursorUsageUiPreferences {
  return {
    ...value,
    [surface]: normalizeSurfacePreferences(value[surface]).map((preference) =>
      preference.id === moduleId ? { ...preference, visible } : preference,
    ),
  };
}

export function moveCursorUsageModulePreference(
  value: CursorUsageUiPreferences,
  surface: DisplaySurface,
  moduleId: CursorUsageUiModuleId,
  direction: "up" | "down",
): CursorUsageUiPreferences {
  const preferences = normalizeSurfacePreferences(value[surface]);
  const currentIndex = preferences.findIndex(
    (preference) => preference.id === moduleId,
  );
  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= preferences.length) {
    return value;
  }
  const nextPreferences = [...preferences];
  const [movedPreference] = nextPreferences.splice(currentIndex, 1);
  nextPreferences.splice(nextIndex, 0, movedPreference);
  return { ...value, [surface]: nextPreferences };
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
