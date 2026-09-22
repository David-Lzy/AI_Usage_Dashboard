import type { AppState } from "../providers/types";
import { isCodexBarManagedCustomSource as isManagedCustomSource } from "../shared/custom-sources";

function same(value: unknown, other: unknown): boolean {
  return JSON.stringify(value) === JSON.stringify(other);
}

function newerOrUnchanged(
  before: unknown,
  latest: unknown,
  completedTime: string | null | undefined,
  latestTime: string | null | undefined,
): boolean {
  if (same(before, latest)) return true;
  const incoming = Date.parse(completedTime ?? "");
  const saved = Date.parse(latestTime ?? "");
  return Number.isFinite(incoming) && Number.isFinite(saved) && incoming > saved;
}

/** Merge only ancillary-owned fields; network work never owns user settings. */
export function mergeBackgroundSyncState(
  before: AppState,
  completed: AppState,
  latest: AppState,
  options: { allowManagedSources?: boolean; removeManagedSources?: boolean } = {},
): AppState {
  const beforeSources = before.customSources ?? [];
  const completedSources = completed.customSources ?? [];
  const latestSources = latest.customSources ?? [];
  const allowManaged = options.allowManagedSources !== false && same(
    beforeSources.filter(isManagedCustomSource),
    latestSources.filter(isManagedCustomSource),
  );
  const sources = options.removeManagedSources
    ? latestSources.filter((source) => !isManagedCustomSource(source))
    : allowManaged
    ? [
        ...latestSources.filter((source) => !isManagedCustomSource(source)),
        ...completedSources.filter(isManagedCustomSource),
      ]
    : latestSources;
  const beforeSettings = new Map(beforeSources.map((source) => [source.id, source]));
  const beforeStates = new Map((before.customSourceStates ?? []).map(
    (entry) => [entry.sourceId, entry],
  ));
  const latestStates = new Map((latest.customSourceStates ?? []).map(
    (entry) => [entry.sourceId, entry],
  ));
  const settings = new Map(sources.map((source) => [source.id, source]));
  for (const incoming of completed.customSourceStates ?? []) {
    const setting = settings.get(incoming.sourceId);
    const previous = beforeStates.get(incoming.sourceId);
    const saved = latestStates.get(incoming.sourceId);
    if (
      !setting || same(incoming, previous) ||
      (isManagedCustomSource(setting)
        ? !allowManaged
        : !same(setting, beforeSettings.get(setting.id))) ||
      !newerOrUnchanged(previous, saved, incoming.lastAttemptAt, saved?.lastAttemptAt)
    ) continue;
    latestStates.set(incoming.sourceId, incoming);
  }

  const beforeStatuses = new Map((before.providerServiceStatuses ?? []).map(
    (status) => [status.vendorId, status],
  ));
  const statuses = new Map((latest.providerServiceStatuses ?? []).map(
    (status) => [status.vendorId, status],
  ));
  if (same(
    before.settings.providerServiceStatusVisibilityBySurface,
    latest.settings.providerServiceStatusVisibilityBySurface,
  )) {
    for (const incoming of completed.providerServiceStatuses ?? []) {
      const previous = beforeStatuses.get(incoming.vendorId);
      const saved = statuses.get(incoming.vendorId);
      if (!same(incoming, previous) && newerOrUnchanged(
        previous, saved, incoming.checkedAt, saved?.checkedAt,
      )) statuses.set(incoming.vendorId, incoming);
    }
  }
  return {
    ...latest,
    customSources: sources,
    customSourceStates: [...latestStates.values()].filter((entry) =>
      settings.has(entry.sourceId),
    ),
    providerServiceStatuses: [...statuses.values()],
  };
}
