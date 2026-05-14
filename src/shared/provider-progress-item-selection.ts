import type {
  DisplaySurface,
  ProgressItemsBySurface,
  ProviderSnapshot,
} from "../providers/types";
import { resolveProgressItemPreferences } from "./display-preferences";
import {
  buildProviderProgressItems,
  type ProviderProgressItem,
} from "./provider-progress-items";

export function selectVisibleProviderProgressItems(
  provider: ProviderSnapshot,
  surface: DisplaySurface,
  progressItemsBySurface: ProgressItemsBySurface,
): ProviderProgressItem[] {
  const progressItems = buildProviderProgressItems(provider);
  const progressItemMap = new Map(progressItems.map((item) => [item.id, item]));
  const preferences = resolveProgressItemPreferences(
    progressItemsBySurface[surface][provider.providerId],
    progressItems.map((item) => item.id),
  );

  return preferences
    .filter((preference) => preference.visible)
    .map((preference) => progressItemMap.get(preference.id) ?? null)
    .filter((item): item is ProviderProgressItem => item !== null);
}

export function hasVisibleProviderProgressItems(
  provider: ProviderSnapshot,
  surface: DisplaySurface,
  progressItemsBySurface: ProgressItemsBySurface,
): boolean {
  return (
    selectVisibleProviderProgressItems(
      provider,
      surface,
      progressItemsBySurface,
    ).length > 0
  );
}
