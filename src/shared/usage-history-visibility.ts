import type {
  DisplaySurface,
  ProviderId,
  ProviderUsageHistoryModuleId,
  ProviderUsageHistoryModulePreference,
  UsageHistoryModulesBySurface,
} from "../providers/types";
import { normalizeProviderId } from "../providers/provider-definitions";
import { DISPLAY_SURFACES } from "./display-preferences";

export const PROVIDER_USAGE_HISTORY_MODULE_IDS = [
  "personal_usage_by_surface",
  "turns_history",
] as const satisfies readonly ProviderUsageHistoryModuleId[];

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function createDefaultUsageHistoryModulesBySurface(): UsageHistoryModulesBySurface {
  return {
    popup: {},
    sidebar: {},
    fullPage: {},
  };
}

export function createDefaultProviderUsageHistoryModules(): ProviderUsageHistoryModulePreference[] {
  return PROVIDER_USAGE_HISTORY_MODULE_IDS.map((id) => ({ id, visible: true }));
}

function normalizeProviderModulePreferences(
  value: unknown,
): ProviderUsageHistoryModulePreference[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const preferences = new Map<
    ProviderUsageHistoryModuleId,
    ProviderUsageHistoryModulePreference
  >();

  for (const candidate of value) {
    if (!isRecord(candidate)) {
      continue;
    }

    const id = PROVIDER_USAGE_HISTORY_MODULE_IDS.find(
      (moduleId) => moduleId === candidate.id,
    );

    if (!id || typeof candidate.visible !== "boolean" || preferences.has(id)) {
      continue;
    }

    preferences.set(id, { id, visible: candidate.visible });
  }

  return [...preferences.values()];
}

export function normalizeUsageHistoryModulesBySurface(
  value: unknown,
  providerIds: readonly ProviderId[],
): UsageHistoryModulesBySurface {
  const source = isRecord(value) ? value : {};
  const providerSet = new Set(providerIds);

  return DISPLAY_SURFACES.reduce<UsageHistoryModulesBySurface>(
    (normalized, surface) => {
      const surfaceSource = isRecord(source[surface]) ? source[surface] : {};

      for (const [rawProviderId, preferences] of Object.entries(surfaceSource)) {
        const providerId = normalizeProviderId(rawProviderId);
        if (!providerId || !providerSet.has(providerId)) {
          continue;
        }

        const normalizedPreferences = normalizeProviderModulePreferences(preferences);
        if (normalizedPreferences.length > 0) {
          normalized[surface][providerId] = normalizedPreferences;
        }
      }

      return normalized;
    },
    createDefaultUsageHistoryModulesBySurface(),
  );
}

export function resolveProviderUsageHistoryModules(
  value: UsageHistoryModulesBySurface,
  surface: DisplaySurface,
  providerId: ProviderId,
): ProviderUsageHistoryModulePreference[] {
  const storedPreferences = new Map(
    (value[surface][providerId] ?? []).map((preference) => [
      preference.id,
      preference,
    ]),
  );

  return createDefaultProviderUsageHistoryModules().map(
    (preference) => storedPreferences.get(preference.id) ?? preference,
  );
}

export function isProviderUsageHistoryModuleVisible(
  value: UsageHistoryModulesBySurface,
  surface: DisplaySurface,
  providerId: ProviderId,
  moduleId: ProviderUsageHistoryModuleId,
): boolean {
  return (
    resolveProviderUsageHistoryModules(value, surface, providerId).find(
      (preference) => preference.id === moduleId,
    )?.visible ?? true
  );
}

export function setProviderUsageHistoryModuleVisibility(
  value: UsageHistoryModulesBySurface,
  surface: DisplaySurface,
  providerId: ProviderId,
  moduleId: ProviderUsageHistoryModuleId,
  visible: boolean,
): UsageHistoryModulesBySurface {
  const preferences = resolveProviderUsageHistoryModules(
    value,
    surface,
    providerId,
  ).map((preference) =>
    preference.id === moduleId ? { ...preference, visible } : preference,
  );

  return {
    ...value,
    [surface]: {
      ...value[surface],
      [providerId]: preferences,
    },
  };
}
