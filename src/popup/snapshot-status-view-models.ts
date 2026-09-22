import type { ProviderTone } from "../providers/types";
import type { RuntimeI18n } from "../shared/i18n";
import { buildPopupLocalizedCopy } from "../shared/popup-localized-copy";
import type { ProviderViewModel } from "../shared/provider-view-models";
import { normalizeSnapshotTimestamp } from "../shared/snapshot-freshness";
import { buildProviderDetailLocalizedCopy } from "../shared/provider-detail-localized-copy";
import type { PopupSnapshotStatus } from "./view-model-types";

function captureTime(provider: ProviderViewModel): string {
  return normalizeSnapshotTimestamp(provider.lastSuccessAt) ?? "";
}

function getNewestVisibleProvider(
  visibleProviders: ProviderViewModel[],
): ProviderViewModel | null {
  if (visibleProviders.length === 0) {
    return null;
  }

  return visibleProviders.reduce((newest, provider) =>
    captureTime(provider).localeCompare(captureTime(newest)) > 0 ? provider : newest,
  );
}

function getOldestVisibleProvider(
  visibleProviders: ProviderViewModel[],
): ProviderViewModel | null {
  if (visibleProviders.length === 0) {
    return null;
  }

  return visibleProviders.reduce((oldest, provider) =>
    captureTime(provider).localeCompare(captureTime(oldest)) < 0 ? provider : oldest,
  );
}

function buildNoProviderSnapshotStatus(): PopupSnapshotStatus {
  return {
    label: "No providers",
    tone: "warning",
    headline: "No visible providers",
    detail:
      "No shared popup snapshot exists yet. Enable one provider to start caching state here.",
  };
}

export function buildSnapshotStatus(
  visibleProviders: ProviderViewModel[],
): PopupSnapshotStatus {
  if (visibleProviders.length === 0) {
    return buildNoProviderSnapshotStatus();
  }

  const newestProvider = getNewestVisibleProvider(visibleProviders);
  const oldestProvider = getOldestVisibleProvider(visibleProviders);

  if (!newestProvider || !oldestProvider) {
    return buildNoProviderSnapshotStatus();
  }

  const hasError = visibleProviders.some(
    (provider) => provider.displaySyncStatus === "error",
  );
  const hasWarnings = visibleProviders.some(
    (provider) =>
      provider.displaySyncStatus === "warning" ||
      provider.permissionStatus === "missing",
  );
  const isAligned = Boolean(captureTime(oldestProvider)) && captureTime(newestProvider) === captureTime(oldestProvider);

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

  return {
    label,
    tone,
    headline: captureTime(newestProvider) || "Unknown",
    detail: !captureTime(newestProvider) ? "Last sync: Unknown" : isAligned
      ? visibleProviders.length === 1
        ? "The visible provider shares the same cached snapshot window."
        : `All ${visibleProviders.length} visible providers share the same cached snapshot window.`
      : `Newest visible snapshot: ${newestProvider.providerLabel} (${captureTime(newestProvider) || "Unknown"}). Oldest visible snapshot: ${oldestProvider.providerLabel} (${captureTime(oldestProvider) || "Unknown"}).`,
  };
}

export function buildLocalizedSnapshotStatus(
  visibleProviders: ProviderViewModel[],
  i18n: RuntimeI18n,
  copy: ReturnType<typeof buildPopupLocalizedCopy>,
): PopupSnapshotStatus {
  if (visibleProviders.length === 0) {
    return {
      label: copy.snapshotStatus.noProvidersLabel,
      tone: "warning",
      headline: copy.snapshotStatus.noProvidersHeadline,
      detail: copy.snapshotStatus.noProvidersDetail,
    };
  }

  const newestProvider = getNewestVisibleProvider(visibleProviders);
  const oldestProvider = getOldestVisibleProvider(visibleProviders);

  if (!newestProvider || !oldestProvider) {
    return {
      label: copy.snapshotStatus.noProvidersLabel,
      tone: "warning",
      headline: copy.snapshotStatus.noProvidersHeadline,
      detail: copy.snapshotStatus.noProvidersDetail,
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
  const isAligned = Boolean(captureTime(oldestProvider)) && captureTime(newestProvider) === captureTime(oldestProvider);
  const label = hasError
    ? copy.snapshotStatus.syncIssueLabel
    : hasWarnings || !isAligned
      ? copy.snapshotStatus.mixedStateLabel
      : copy.snapshotStatus.alignedLabel;
  const tone: ProviderTone = hasError
    ? "error"
    : hasWarnings || !isAligned
      ? "warning"
      : "neutral";
  const detailCopy = buildProviderDetailLocalizedCopy(i18n);
  const unknown = detailCopy.values.unknown;
  const newestLastSyncLabel = i18n.formatTemporalValue(captureTime(newestProvider)) ?? unknown;
  const oldestLastSyncLabel = i18n.formatTemporalValue(captureTime(oldestProvider)) ?? unknown;

  return {
    label,
    tone,
    headline: newestLastSyncLabel,
    detail: !captureTime(newestProvider) ? `${detailCopy.fieldLabels.lastSync}: ${unknown}` : isAligned
      ? visibleProviders.length === 1
        ? copy.snapshotStatus.alignedSingleDetail
        : copy.snapshotStatus.alignedManyDetail(visibleProviders.length)
      : copy.snapshotStatus.mixedDetail(
          newestProvider.providerLabel,
          newestLastSyncLabel,
          oldestProvider.providerLabel,
          oldestLastSyncLabel,
        ),
  };
}
