import type {
  AppState,
  DisplaySurface,
  ProviderTone,
  ProgressItemsBySurface,
  SyncStatus,
} from "../providers/types";
import { resolveProgressItemPreferences } from "./display-preferences";
import type {
  CustomSourceId,
  CustomSourceMetric,
  CustomSourceSetting,
  CustomSourceSnapshot,
  CustomSourceSyncState,
  DashboardSourceId,
} from "./custom-sources";

export type CustomSourceProgressItemKind =
  | "primary_quota"
  | "usage_window"
  | "usage_balance";

export type CustomSourceProgressItemAvailability =
  | "progress"
  | "value_only"
  | "unavailable";

export type CustomSourceProgressItem = {
  id: string;
  kind: CustomSourceProgressItemKind;
  sourceId: CustomSourceId;
  sourceLabel: string;
  label: string;
  quotaUnit: string;
  used: number | null;
  remaining: number | null;
  total: number | null;
  resetAt: string | null;
  resetLabel: string | null;
  detail: string | null;
  tone: ProviderTone;
  availability: CustomSourceProgressItemAvailability;
};

export type CustomSourceViewModel = {
  sourceId: CustomSourceId;
  label: string;
  description: string | null;
  endpointUrl: string;
  refreshIntervalMinutes: number;
  displayEnabled: boolean;
  syncStatus: SyncStatus;
  displayTone: ProviderTone;
  statusLabel: string;
  lastSyncLabel: string;
  warningReason: string | null;
  stale: boolean;
  hasSnapshot: boolean;
  usageSummary: string | null;
  quota: CustomSourceSnapshot["quota"];
  windows: CustomSourceSnapshot["windows"];
  balances: CustomSourceSnapshot["balances"];
  facts: CustomSourceSnapshot["facts"];
  progressItems: CustomSourceProgressItem[];
};

export type CustomSourceProgressItemIdsBySource = Partial<
  Record<DashboardSourceId, string[]>
>;

function encodeProgressItemPart(value: string | null | undefined): string {
  return encodeURIComponent(value ?? "");
}

function hasFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function statusToTone(status: SyncStatus): ProviderTone {
  return status === "ok" ? "neutral" : status;
}

function getProgressItemAvailability(
  used: number | null,
  remaining: number | null,
  total: number | null,
): CustomSourceProgressItemAvailability {
  if (hasFiniteNumber(total) && (hasFiniteNumber(used) || hasFiniteNumber(remaining))) {
    return "progress";
  }

  if (hasFiniteNumber(used) || hasFiniteNumber(remaining) || hasFiniteNumber(total)) {
    return "value_only";
  }

  return "unavailable";
}

function normalizeProgressTotal(
  quotaUnit: string,
  used: number | null,
  remaining: number | null,
  total: number | null,
): number | null {
  if (
    quotaUnit.toLowerCase() === "percent" &&
    (hasFiniteNumber(used) || hasFiniteNumber(remaining))
  ) {
    return 100;
  }

  return total;
}

function getMetricTone(
  metric: Pick<CustomSourceMetric, "unit" | "remaining" | "total">,
  fallbackTone: ProviderTone,
): ProviderTone {
  if (!hasFiniteNumber(metric.remaining)) {
    return fallbackTone;
  }

  const total =
    metric.unit.toLowerCase() === "percent"
      ? 100
      : hasFiniteNumber(metric.total)
        ? metric.total
        : null;

  if (!total || total <= 0) {
    return fallbackTone;
  }

  const remainingPercent = (metric.remaining / total) * 100;

  if (remainingPercent <= 10) {
    return "error";
  }

  if (remainingPercent <= 50) {
    return "warning";
  }

  return fallbackTone === "error" ? "warning" : "neutral";
}

function buildMetricProgressItem(
  source: CustomSourceSnapshot,
  metric: CustomSourceMetric,
  options: {
    id: string;
    kind: CustomSourceProgressItemKind;
    fallbackTone: ProviderTone;
  },
): CustomSourceProgressItem | null {
  const total = normalizeProgressTotal(
    metric.unit,
    metric.used,
    metric.remaining,
    metric.total,
  );
  const availability = getProgressItemAvailability(
    metric.used,
    metric.remaining,
    total,
  );

  if (availability === "unavailable") {
    return null;
  }

  return {
    id: options.id,
    kind: options.kind,
    sourceId: source.sourceId,
    sourceLabel: source.label,
    label: metric.label,
    quotaUnit: metric.unit,
    used: metric.used,
    remaining: metric.remaining,
    total,
    resetAt: metric.resetAt,
    resetLabel: metric.resetLabel,
    detail: metric.window,
    tone: getMetricTone(metric, options.fallbackTone),
    availability,
  };
}

function buildWindowProgressItemId(
  metric: CustomSourceMetric,
  index: number,
): string {
  return ["window", metric.label, metric.window ?? "", String(index)]
    .map(encodeProgressItemPart)
    .join(":");
}

function buildBalanceProgressItemId(
  metric: CustomSourceMetric,
  index: number,
): string {
  return ["balance", metric.label, String(index)]
    .map(encodeProgressItemPart)
    .join(":");
}

export function buildCustomSourceProgressItems(
  snapshot: CustomSourceSnapshot,
): CustomSourceProgressItem[] {
  const fallbackTone = snapshot.tone;
  const progressItems: CustomSourceProgressItem[] = [];

  if (snapshot.quota) {
    const primaryItem = buildMetricProgressItem(snapshot, snapshot.quota, {
      id: "primary",
      kind: "primary_quota",
      fallbackTone,
    });

    if (primaryItem) {
      progressItems.push(primaryItem);
    }
  }

  progressItems.push(
    ...snapshot.windows
      .map((metric, index) =>
        buildMetricProgressItem(snapshot, metric, {
          id: buildWindowProgressItemId(metric, index),
          kind: "usage_window",
          fallbackTone,
        }),
      )
      .filter((item): item is CustomSourceProgressItem => item !== null),
  );

  progressItems.push(
    ...snapshot.balances
      .map((metric, index) =>
        buildMetricProgressItem(snapshot, metric, {
          id: buildBalanceProgressItemId(metric, index),
          kind: "usage_balance",
          fallbackTone,
        }),
      )
      .filter((item): item is CustomSourceProgressItem => item !== null),
  );

  return progressItems;
}

function formatLastSyncLabel(
  syncState: CustomSourceSyncState | null,
  snapshot: CustomSourceSnapshot | null,
): string {
  if (snapshot?.lastSyncLabel) {
    return snapshot.lastSyncLabel;
  }

  if (syncState?.lastSuccessAt) {
    return `Last synced ${syncState.lastSuccessAt}`;
  }

  if (syncState?.lastAttemptAt) {
    return `Last attempted ${syncState.lastAttemptAt}`;
  }

  return "Not synced yet";
}

function getStatusLabel(
  syncState: CustomSourceSyncState | null,
  snapshot: CustomSourceSnapshot | null,
): string {
  if (!snapshot) {
    return "Not synced";
  }

  if (syncState?.stale) {
    return "Stale";
  }

  switch (syncState?.status ?? snapshot.syncStatus) {
    case "ok":
      return "Healthy";
    case "warning":
      return "Warning";
    case "error":
      return "Sync issue";
  }
}

function buildCustomSourceViewModel(
  setting: CustomSourceSetting,
  syncState: CustomSourceSyncState | null,
): CustomSourceViewModel {
  const snapshot = syncState?.snapshot ?? null;
  const syncStatus = syncState?.status ?? snapshot?.syncStatus ?? "warning";
  const displayTone = snapshot?.tone ?? statusToTone(syncStatus);
  const progressItems = snapshot ? buildCustomSourceProgressItems(snapshot) : [];

  return {
    sourceId: setting.id,
    label: snapshot?.label ?? setting.label,
    description: snapshot?.description ?? setting.description,
    endpointUrl: setting.endpointUrl,
    refreshIntervalMinutes: setting.refreshIntervalMinutes,
    displayEnabled: setting.displayEnabled,
    syncStatus,
    displayTone,
    statusLabel: getStatusLabel(syncState, snapshot),
    lastSyncLabel: formatLastSyncLabel(syncState, snapshot),
    warningReason:
      syncState?.lastFailureReason ?? snapshot?.warningReason ?? null,
    stale: syncState?.stale ?? false,
    hasSnapshot: snapshot !== null,
    usageSummary: snapshot?.usageSummary ?? null,
    quota: snapshot?.quota ?? null,
    windows: snapshot?.windows ?? [],
    balances: snapshot?.balances ?? [],
    facts: snapshot?.facts ?? [],
    progressItems,
  };
}

function applyCustomSourceOrderPreference(
  sources: CustomSourceViewModel[],
  providerOrder: readonly DashboardSourceId[],
): CustomSourceViewModel[] {
  if (providerOrder.length === 0) {
    return sources;
  }

  const providerOrderIndex = new Map(
    providerOrder.map((sourceId, index) => [sourceId, index]),
  );

  return [...sources].sort((left, right) => {
    const leftIndex = providerOrderIndex.get(left.sourceId);
    const rightIndex = providerOrderIndex.get(right.sourceId);

    if (leftIndex !== undefined && rightIndex !== undefined) {
      return leftIndex - rightIndex;
    }

    if (leftIndex !== undefined) {
      return -1;
    }

    if (rightIndex !== undefined) {
      return 1;
    }

    return 0;
  });
}

export function getVisibleCustomSources(
  state: AppState,
  surface?: DisplaySurface,
): CustomSourceViewModel[] {
  const syncStateBySourceId = new Map(
    (state.customSourceStates ?? []).map((syncState) => [
      syncState.sourceId,
      syncState,
    ]),
  );
  const sources = (state.customSources ?? [])
    .filter((source) => source.displayEnabled)
    .map((source) =>
      buildCustomSourceViewModel(
        source,
        syncStateBySourceId.get(source.id) ?? null,
      ),
    );

  return surface
    ? applyCustomSourceOrderPreference(
        sources,
        state.settings.providerOrderBySurface[surface],
      )
    : sources;
}

export function hasCustomSourceAttention(source: CustomSourceViewModel): boolean {
  return (
    source.syncStatus !== "ok" ||
    source.displayTone !== "neutral" ||
    source.stale ||
    source.warningReason !== null ||
    !source.hasSnapshot
  );
}

export function selectVisibleCustomSourceProgressItems(
  source: CustomSourceViewModel,
  surface: DisplaySurface,
  progressItemsBySurface: ProgressItemsBySurface,
): CustomSourceProgressItem[] {
  const progressItemMap = new Map(
    source.progressItems.map((item) => [item.id, item]),
  );
  const preferences = resolveProgressItemPreferences(
    progressItemsBySurface[surface][source.sourceId],
    source.progressItems.map((item) => item.id),
  );

  return preferences
    .filter((preference) => preference.visible)
    .map((preference) => progressItemMap.get(preference.id) ?? null)
    .filter((item): item is CustomSourceProgressItem => item !== null);
}

export function hasVisibleCustomSourceProgressItems(
  source: CustomSourceViewModel,
  surface: DisplaySurface,
  progressItemsBySurface: ProgressItemsBySurface,
): boolean {
  return selectVisibleCustomSourceProgressItems(
    source,
    surface,
    progressItemsBySurface,
  ).length > 0;
}

export function buildCustomSourceProgressItemIdsBySource(
  customSources: readonly CustomSourceSetting[],
  customSourceStates: readonly CustomSourceSyncState[],
): CustomSourceProgressItemIdsBySource {
  const syncStateBySourceId = new Map(
    customSourceStates.map((syncState) => [syncState.sourceId, syncState]),
  );

  return Object.fromEntries(
    customSources.map((source) => {
      const snapshot = syncStateBySourceId.get(source.id)?.snapshot ?? null;
      const itemIds = snapshot
        ? buildCustomSourceProgressItems(snapshot).map((item) => item.id)
        : ["primary"];

      return [source.id, itemIds];
    }),
  );
}
