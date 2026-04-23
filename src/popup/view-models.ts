import type { AppState, ProviderTone, SummaryItem } from "../providers/types";
import {
  buildSummaryItems,
  getVisibleProviders,
  type ProviderViewModel,
} from "../sidepanel/view-models";

export type PopupSnapshotStatus = {
  label: string;
  tone: ProviderTone;
  headline: string;
  detail: string;
};

export type PopupViewModel = {
  summaryItems: SummaryItem[];
  visibleProviders: ProviderViewModel[];
  featuredProviders: ProviderViewModel[];
  snapshotStatus: PopupSnapshotStatus;
};

function needsAttention(provider: ProviderViewModel): boolean {
  return (
    provider.permissionStatus === "missing" ||
    provider.displaySyncStatus !== "ok" ||
    (provider.currentSourceStateKind !== "ready" &&
      provider.currentSourceStateKind !== "policy_only")
  );
}

function getNewestVisibleProvider(
  visibleProviders: ProviderViewModel[],
): ProviderViewModel | null {
  if (visibleProviders.length === 0) {
    return null;
  }

  return visibleProviders.reduce((newest, provider) =>
    provider.syncedAt.localeCompare(newest.syncedAt) > 0 ? provider : newest,
  );
}

function getOldestVisibleProvider(
  visibleProviders: ProviderViewModel[],
): ProviderViewModel | null {
  if (visibleProviders.length === 0) {
    return null;
  }

  return visibleProviders.reduce((oldest, provider) =>
    provider.syncedAt.localeCompare(oldest.syncedAt) < 0 ? provider : oldest,
  );
}

function buildSnapshotStatus(
  visibleProviders: ProviderViewModel[],
): PopupSnapshotStatus {
  if (visibleProviders.length === 0) {
    return {
      label: "No providers",
      tone: "warning",
      headline: "No visible providers",
      detail:
        "Enable at least one provider in settings so the popup can summarize a shared cached snapshot.",
    };
  }

  const newestProvider = getNewestVisibleProvider(visibleProviders);
  const oldestProvider = getOldestVisibleProvider(visibleProviders);

  if (!newestProvider || !oldestProvider) {
    return {
      label: "No providers",
      tone: "warning",
      headline: "No visible providers",
      detail:
        "Enable at least one provider in settings so the popup can summarize a shared cached snapshot.",
    };
  }

  const hasError = visibleProviders.some(
    (provider) => provider.displaySyncStatus === "error",
  );
  const hasWarnings = visibleProviders.some(
    (provider) =>
      provider.displaySyncStatus === "warning" ||
      provider.permissionStatus === "missing",
  );
  const isAligned = newestProvider.syncedAt === oldestProvider.syncedAt;

  const label = hasError
    ? "Sync issue"
    : hasWarnings || !isAligned
      ? "Mixed state"
      : "Aligned";
  const tone: ProviderTone = hasError
    ? "error"
    : hasWarnings || !isAligned
      ? "warning"
      : "neutral";

  const stateLead = hasError
    ? "At least one visible provider currently has a sync issue."
    : hasWarnings
      ? "Visible providers still need review."
      : "Visible providers are currently healthy.";
  const freshnessLead = isAligned
    ? `All ${visibleProviders.length} visible providers share the same cached snapshot window.`
    : `Newest visible snapshot: ${newestProvider.providerLabel} (${newestProvider.lastSyncLabel}). Oldest visible snapshot: ${oldestProvider.providerLabel} (${oldestProvider.lastSyncLabel}).`;

  return {
    label,
    tone,
    headline: newestProvider.lastSyncLabel,
    detail: `${stateLead} ${freshnessLead}`,
  };
}

export function buildPopupViewModel(state: AppState): PopupViewModel {
  const visibleProviders = getVisibleProviders(state);
  const summaryItems = buildSummaryItems(state);
  const featuredProviders = visibleProviders.filter(needsAttention);

  return {
    summaryItems,
    visibleProviders,
    snapshotStatus: buildSnapshotStatus(visibleProviders),
    featuredProviders:
      featuredProviders.length > 0
        ? featuredProviders.slice(0, 3)
        : visibleProviders.slice(0, 3),
  };
}
