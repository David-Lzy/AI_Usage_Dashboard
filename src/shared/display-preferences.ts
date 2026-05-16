import type {
  DisplaySurface,
  ProgressItemsBySurface,
  ProviderId,
  ProviderOrderBySurface,
  ProviderProgressItemPreference,
} from "../providers/types";
import { normalizeProviderId } from "../providers/provider-definitions";

export const DISPLAY_SURFACES = ["popup", "sidebar", "fullPage"] as const;

type KnownProgressItemIdsByProvider = Partial<Record<ProviderId, readonly string[]>>;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOwnRecordKey(record: UnknownRecord, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function createKnownProviderSet(providerIds: readonly ProviderId[]): Set<ProviderId> {
  return new Set(providerIds);
}

export function createDefaultProviderOrderBySurface(): ProviderOrderBySurface {
  return {
    popup: [],
    sidebar: [],
    fullPage: [],
  };
}

export function createDefaultProgressItemsBySurface(): ProgressItemsBySurface {
  return {
    popup: {},
    sidebar: {},
    fullPage: {},
  };
}

function normalizeProviderOrder(
  value: unknown,
  providerIds: readonly ProviderId[],
): ProviderId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const knownProviders = createKnownProviderSet(providerIds);
  const seenProviders = new Set<ProviderId>();
  const orderedProviders: ProviderId[] = [];

  for (const candidate of value) {
    if (typeof candidate !== "string") {
      continue;
    }

    const normalizedCandidate = normalizeProviderId(candidate);

    if (!normalizedCandidate || !knownProviders.has(normalizedCandidate)) {
      continue;
    }

    const providerId = normalizedCandidate;

    if (seenProviders.has(providerId)) {
      continue;
    }

    seenProviders.add(providerId);
    orderedProviders.push(providerId);
  }

  if (orderedProviders.length === 0) {
    return [];
  }

  for (const providerId of providerIds) {
    if (!seenProviders.has(providerId)) {
      orderedProviders.push(providerId);
    }
  }

  return orderedProviders;
}

export function normalizeProviderOrderBySurface(
  value: unknown,
  providerIds: readonly ProviderId[],
): ProviderOrderBySurface {
  const source = isRecord(value) ? value : {};

  return DISPLAY_SURFACES.reduce<ProviderOrderBySurface>(
    (normalized, surface) => ({
      ...normalized,
      [surface]: normalizeProviderOrder(source[surface], providerIds),
    }),
    createDefaultProviderOrderBySurface(),
  );
}

export function resolveProviderOrder(
  providerOrder: readonly ProviderId[],
  providerIds: readonly ProviderId[],
): ProviderId[] {
  const normalizedProviderOrder = normalizeProviderOrder(providerOrder, providerIds);
  return normalizedProviderOrder.length > 0
    ? normalizedProviderOrder
    : [...providerIds];
}

export function moveProviderInOrder(
  providerOrder: readonly ProviderId[],
  providerIds: readonly ProviderId[],
  providerId: ProviderId,
  direction: "up" | "down",
): ProviderId[] {
  const resolvedProviderOrder = resolveProviderOrder(providerOrder, providerIds);
  const currentIndex = resolvedProviderOrder.indexOf(providerId);

  if (currentIndex === -1) {
    return resolvedProviderOrder;
  }

  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (nextIndex < 0 || nextIndex >= resolvedProviderOrder.length) {
    return resolvedProviderOrder;
  }

  const nextProviderOrder = [...resolvedProviderOrder];
  const [movedProviderId] = nextProviderOrder.splice(currentIndex, 1);
  nextProviderOrder.splice(nextIndex, 0, movedProviderId);
  return nextProviderOrder;
}

export function reorderProviderBefore(
  providerOrder: readonly ProviderId[],
  providerIds: readonly ProviderId[],
  movedProviderId: ProviderId,
  targetProviderId: ProviderId,
): ProviderId[] {
  const resolvedProviderOrder = resolveProviderOrder(providerOrder, providerIds);

  if (movedProviderId === targetProviderId) {
    return resolvedProviderOrder;
  }

  const currentIndex = resolvedProviderOrder.indexOf(movedProviderId);
  const targetIndex = resolvedProviderOrder.indexOf(targetProviderId);

  if (currentIndex === -1 || targetIndex === -1) {
    return resolvedProviderOrder;
  }

  const nextProviderOrder = [...resolvedProviderOrder];
  const [movedProvider] = nextProviderOrder.splice(currentIndex, 1);
  const insertionIndex = nextProviderOrder.indexOf(targetProviderId);
  nextProviderOrder.splice(insertionIndex, 0, movedProvider);
  return nextProviderOrder;
}

function normalizeProgressItemPreferences(
  value: unknown,
  knownItemIds: readonly string[],
): ProviderProgressItemPreference[] {
  if (!Array.isArray(value) || knownItemIds.length === 0) {
    return [];
  }

  const knownItems = new Set(knownItemIds);
  const seenItems = new Set<string>();
  const normalizedItems: ProviderProgressItemPreference[] = [];

  for (const candidate of value) {
    if (!isRecord(candidate) || typeof candidate.id !== "string") {
      continue;
    }

    if (!knownItems.has(candidate.id) || seenItems.has(candidate.id)) {
      continue;
    }

    seenItems.add(candidate.id);
    normalizedItems.push({
      id: candidate.id,
      visible:
        typeof candidate.visible === "boolean" ? candidate.visible : true,
    });
  }

  if (normalizedItems.length === 0) {
    return [];
  }

  for (const itemId of knownItemIds) {
    if (!seenItems.has(itemId)) {
      normalizedItems.push({
        id: itemId,
        visible: true,
      });
    }
  }

  return normalizedItems;
}

function createVisibleProgressItemPreferences(
  itemIds: readonly string[],
): ProviderProgressItemPreference[] {
  return itemIds.map((id) => ({
    id,
    visible: true,
  }));
}

export function resolveProgressItemPreferences(
  preferences: readonly ProviderProgressItemPreference[] | undefined,
  knownItemIds: readonly string[],
): ProviderProgressItemPreference[] {
  const normalizedPreferences = normalizeProgressItemPreferences(
    preferences,
    knownItemIds,
  );

  return normalizedPreferences.length > 0
    ? normalizedPreferences
    : createVisibleProgressItemPreferences(knownItemIds);
}

export function setProgressItemVisibility(
  preferences: readonly ProviderProgressItemPreference[] | undefined,
  knownItemIds: readonly string[],
  itemId: string,
  visible: boolean,
): ProviderProgressItemPreference[] {
  const resolvedPreferences = resolveProgressItemPreferences(
    preferences,
    knownItemIds,
  );

  if (!knownItemIds.includes(itemId)) {
    return resolvedPreferences;
  }

  return resolvedPreferences.map((preference) =>
    preference.id === itemId ? { ...preference, visible } : preference,
  );
}

export function moveProgressItemPreference(
  preferences: readonly ProviderProgressItemPreference[] | undefined,
  knownItemIds: readonly string[],
  itemId: string,
  direction: "up" | "down",
): ProviderProgressItemPreference[] {
  const resolvedPreferences = resolveProgressItemPreferences(
    preferences,
    knownItemIds,
  );
  const currentIndex = resolvedPreferences.findIndex(
    (preference) => preference.id === itemId,
  );

  if (currentIndex === -1) {
    return resolvedPreferences;
  }

  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (nextIndex < 0 || nextIndex >= resolvedPreferences.length) {
    return resolvedPreferences;
  }

  const nextPreferences = [...resolvedPreferences];
  const [movedPreference] = nextPreferences.splice(currentIndex, 1);
  nextPreferences.splice(nextIndex, 0, movedPreference);
  return nextPreferences;
}

export function reorderProgressItemPreferenceBefore(
  preferences: readonly ProviderProgressItemPreference[] | undefined,
  knownItemIds: readonly string[],
  movedItemId: string,
  targetItemId: string,
): ProviderProgressItemPreference[] {
  const resolvedPreferences = resolveProgressItemPreferences(
    preferences,
    knownItemIds,
  );

  if (movedItemId === targetItemId) {
    return resolvedPreferences;
  }

  const currentIndex = resolvedPreferences.findIndex(
    (preference) => preference.id === movedItemId,
  );
  const targetIndex = resolvedPreferences.findIndex(
    (preference) => preference.id === targetItemId,
  );

  if (currentIndex === -1 || targetIndex === -1) {
    return resolvedPreferences;
  }

  const nextPreferences = [...resolvedPreferences];
  const [movedPreference] = nextPreferences.splice(currentIndex, 1);
  const insertionIndex = nextPreferences.findIndex(
    (preference) => preference.id === targetItemId,
  );
  nextPreferences.splice(insertionIndex, 0, movedPreference);
  return nextPreferences;
}

function getKnownProgressItemIds(
  providerId: ProviderId,
  knownProgressItemIdsByProvider: KnownProgressItemIdsByProvider,
): readonly string[] {
  return knownProgressItemIdsByProvider[providerId] ?? [];
}

export function normalizeProgressItemsBySurface(
  value: unknown,
  providerIds: readonly ProviderId[],
  knownProgressItemIdsByProvider: KnownProgressItemIdsByProvider = {},
): ProgressItemsBySurface {
  const source = isRecord(value) ? value : {};
  const normalized = createDefaultProgressItemsBySurface();

  for (const surface of DISPLAY_SURFACES) {
    const surfaceSource = isRecord(source[surface]) ? source[surface] : {};

    for (const [rawProviderId, preferences] of Object.entries(surfaceSource)) {
      const providerId = normalizeProviderId(rawProviderId);

      if (!providerId || !providerIds.includes(providerId)) {
        continue;
      }

      const normalizedItems = normalizeProgressItemPreferences(
        preferences,
        getKnownProgressItemIds(providerId, knownProgressItemIdsByProvider),
      );

      if (normalizedItems.length > 0) {
        normalized[surface][providerId] = normalizedItems;
      }
    }
  }

  return normalized;
}
