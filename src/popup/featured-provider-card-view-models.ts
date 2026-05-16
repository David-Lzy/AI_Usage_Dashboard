import type { ProviderTone } from "../providers/types";
import type { RuntimeI18n } from "../shared/i18n";
import { buildRuntimeCommonCopy } from "../shared/i18n";
import type { buildPopupLocalizedCopy } from "../shared/popup-localized-copy";
import type { ProviderViewModel } from "../sidepanel/view-models";
import type {
  PopupFeaturedProviderCard,
  PopupGuidanceAction,
  PopupUsageProgressCircle,
} from "./view-model-types";

function buildPopupFeaturedStatusLabel(provider: ProviderViewModel): string {
  if (provider.permissionStatus === "missing") {
    return "Needs access";
  }

  switch (provider.currentSourceStateKind) {
    case "credential_missing":
      return "Needs setup";
    case "open_page_required":
      return "Open page";
    case "logged_out":
      return "Sign in";
    case "capture_unavailable":
      return "Reload page";
    case "sync_error":
      return "Needs review";
    case "policy_only":
      return "Contract-only";
    case "ready":
      return provider.displaySyncStatus === "ok"
        ? "Healthy"
        : provider.displaySyncStatus === "warning"
          ? "Warning"
          : "Sync issue";
  }

  return "Healthy";
}

function buildPopupFeaturedPrimaryDetail(provider: ProviderViewModel): string {
  if (provider.permissionStatus === "missing") {
    return "Current path is blocked on host access.";
  }

  switch (provider.currentSourceStateKind) {
    case "credential_missing":
      return "Current path still needs stored credentials.";
    case "open_page_required":
      return "Current path still needs a live page session.";
    case "logged_out":
      return "Current path needs the signed-in page again.";
    case "capture_unavailable":
      return "Current page session is open but cannot be read.";
    case "sync_error":
      return "Settings setup is clear, but this provider still needs review.";
    case "policy_only":
      return "Current contract is policy-only in this profile.";
    case "ready":
      return "Current path is live-ready in this profile.";
  }

  return "Current path is live-ready in this profile.";
}

function formatPopupUsageWindowDetail(
  window: NonNullable<ProviderViewModel["usageWindows"]>[number],
  i18n?: RuntimeI18n,
): string {
  const remaining =
    window.remaining === null
      ? null
      : i18n
        ? i18n.formatPercentValue(window.remaining)
        : `${window.remaining}%`;
  const remainingLabel = i18n
    ? buildRuntimeCommonCopy(i18n).remaining
    : "remaining";

  return remaining
    ? `${window.normalizedLabel}: ${remaining} ${remainingLabel}`
    : window.normalizedLabel;
}

function formatPopupUsageBalanceDetail(
  balance: NonNullable<ProviderViewModel["usageBalances"]>[number],
  i18n?: RuntimeI18n,
): string {
  const remaining =
    balance.remaining === null
      ? null
      : i18n
        ? i18n.formatNumber(balance.remaining)
        : String(balance.remaining);
  const unitLabel = i18n
    ? buildRuntimeCommonCopy(i18n).quotaUnitLabel(balance.quotaUnit)
    : balance.quotaUnit;

  return remaining
    ? `${balance.normalizedLabel}: ${remaining} ${unitLabel}`
    : balance.normalizedLabel;
}

function getMostConstrainedUsageWindow(provider: ProviderViewModel) {
  const windows = provider.usageWindows ?? [];
  const windowsWithRemaining = windows.filter(
    (window) => window.remaining !== null,
  );

  if (windowsWithRemaining.length === 0) {
    return windows[0] ?? null;
  }

  return windowsWithRemaining.reduce((mostConstrained, window) => {
    const mostConstrainedRemaining =
      mostConstrained.remaining ?? Number.POSITIVE_INFINITY;
    const currentRemaining = window.remaining ?? Number.POSITIVE_INFINITY;

    return currentRemaining < mostConstrainedRemaining
      ? window
      : mostConstrained;
  });
}

function buildPopupCompactUsageContextDetail(
  provider: ProviderViewModel,
  i18n?: RuntimeI18n,
): string | null {
  const usageWindow = getMostConstrainedUsageWindow(provider);
  const usageBalance =
    provider.usageBalances?.find((balance) => balance.remaining !== null) ??
    provider.usageBalances?.[0] ??
    null;
  const usageParts = [
    usageWindow ? formatPopupUsageWindowDetail(usageWindow, i18n) : null,
    usageBalance ? formatPopupUsageBalanceDetail(usageBalance, i18n) : null,
  ].filter((part): part is string => Boolean(part));

  return usageParts.length > 0 ? usageParts.join(" · ") : null;
}

function getPopupUsageProgressTone(remainingPercent: number): ProviderTone {
  if (remainingPercent <= 30) {
    return "error";
  }

  if (remainingPercent <= 50) {
    return "warning";
  }

  return "neutral";
}

function buildPopupUsageProgressCircles(
  provider: ProviderViewModel,
  i18n?: RuntimeI18n,
): PopupUsageProgressCircle[] {
  const remainingLabel = i18n
    ? buildRuntimeCommonCopy(i18n).remaining
    : "remaining";

  return (provider.usageWindows ?? [])
    .filter((window) => window.remaining !== null)
    .map((window) => {
      const remainingPercent = Math.min(
        100,
        Math.max(0, window.remaining ?? 0),
      );
      const valueLabel = i18n
        ? i18n.formatPercentValue(remainingPercent)
        : `${remainingPercent}%`;

      return {
        label: window.normalizedLabel,
        valueLabel,
        ariaLabel: `${window.normalizedLabel}: ${valueLabel} ${remainingLabel}`,
        remainingPercent,
        tone: getPopupUsageProgressTone(remainingPercent),
      };
    });
}

function buildPopupFeaturedSecondaryDetail(
  provider: ProviderViewModel,
  i18n?: RuntimeI18n,
): string {
  if (provider.permissionStatus === "missing") {
    return (
      provider.hostAccessRequirementDetail ||
      provider.currentSourceStateDetail ||
      provider.currentSourceAvailabilitySummary
    );
  }

  if (
    provider.currentSourceStateKind === "policy_only" ||
    provider.currentSourceStateKind === "ready"
  ) {
    return (
      buildPopupCompactUsageContextDetail(provider, i18n) ??
      provider.usageSummary ??
      provider.currentSourceAvailabilitySummary
    );
  }

  return (
    provider.warningReason ??
    provider.currentSourceStateDetail ??
    provider.currentSourceAvailabilitySummary
  );
}

function buildPopupFeaturedMetaChips(provider: ProviderViewModel): string[] {
  return [provider.currentSourceContractLabel, provider.lastSyncLabel];
}

function buildLocalizedPopupFeaturedMetaChips(
  provider: ProviderViewModel,
  i18n: RuntimeI18n,
): string[] {
  return [
    provider.currentSourceContractLabel,
    i18n.localizeRelativeRuntimeLabel(provider.lastSyncLabel),
  ];
}

function buildPopupFeaturedAction(provider: ProviderViewModel): PopupGuidanceAction {
  if (
    provider.permissionStatus === "missing" ||
    provider.currentSourceStateKind === "credential_missing"
  ) {
    return {
      kind: "settings",
      label: "Open settings",
    };
  }

  if (provider.currentSourceStateKind === "policy_only") {
    return {
      kind: "settings",
      label: "Open settings",
    };
  }

  if (
    provider.openableSessionPageUrl !== null &&
    (provider.currentSourceStateKind === "open_page_required" ||
      provider.currentSourceStateKind === "logged_out" ||
      provider.currentSourceStateKind === "capture_unavailable")
  ) {
    return {
      kind: "source-page",
      label: "Open source page",
      providerId: provider.providerId,
      sourceStateKind: provider.currentSourceStateKind,
    };
  }

  const hasProductReviewIssue =
    provider.currentSourceStateKind !== "ready" ||
    (provider.displaySyncStatus !== "ok" &&
      provider.warningDiagnostic?.category !== "usage_threshold");

  if (hasProductReviewIssue) {
    return {
      kind: "provider-detail",
      label: "Review detail",
      providerId: provider.providerId,
    };
  }

  return {
    kind: "provider-detail",
    label: "Open detail",
    providerId: provider.providerId,
  };
}

export function buildPopupFeaturedProviderCard(
  provider: ProviderViewModel,
): PopupFeaturedProviderCard {
  return {
    provider,
    statusLabel: buildPopupFeaturedStatusLabel(provider),
    metaChips: buildPopupFeaturedMetaChips(provider),
    primaryDetail: buildPopupFeaturedPrimaryDetail(provider),
    secondaryDetail: buildPopupFeaturedSecondaryDetail(provider),
    usageProgressCircles: buildPopupUsageProgressCircles(provider),
    action: buildPopupFeaturedAction(provider),
    secondaryAction: {
      kind: "hide-provider",
      label: "Stop showing",
      providerId: provider.providerId,
    },
  };
}

function buildLocalizedFeaturedStatusLabel(
  provider: ProviderViewModel,
  copy: ReturnType<typeof buildPopupLocalizedCopy>,
): string {
  if (provider.permissionStatus === "missing") {
    return copy.featuredCard.statusNeedsAccess;
  }

  switch (provider.currentSourceStateKind) {
    case "credential_missing":
      return copy.featuredCard.statusNeedsSetup;
    case "open_page_required":
      return copy.featuredCard.statusOpenPage;
    case "logged_out":
      return copy.featuredCard.statusSignIn;
    case "capture_unavailable":
      return copy.featuredCard.statusReloadPage;
    case "sync_error":
      return copy.featuredCard.statusNeedsReview;
    case "policy_only":
      return copy.featuredCard.statusContractOnly;
    case "ready":
      return provider.displaySyncStatus === "ok"
        ? copy.featuredCard.statusHealthy
        : provider.displaySyncStatus === "warning"
          ? copy.featuredCard.statusWarning
          : copy.featuredCard.statusSyncIssue;
  }

  return copy.featuredCard.statusHealthy;
}

function buildLocalizedFeaturedPrimaryDetail(
  provider: ProviderViewModel,
  copy: ReturnType<typeof buildPopupLocalizedCopy>,
): string {
  if (provider.permissionStatus === "missing") {
    return copy.featuredCard.primaryBlockedHostAccess;
  }

  switch (provider.currentSourceStateKind) {
    case "credential_missing":
      return copy.featuredCard.primaryNeedsCredentials;
    case "open_page_required":
      return copy.featuredCard.primaryNeedsLivePage;
    case "logged_out":
      return copy.featuredCard.primaryNeedsSignedInPage;
    case "capture_unavailable":
      return copy.featuredCard.primaryPageUnreadable;
    case "sync_error":
      return copy.featuredCard.primaryNeedsReview;
    case "policy_only":
      return copy.featuredCard.primaryPolicyOnly;
    case "ready":
      return copy.featuredCard.primaryLiveReady;
  }

  return copy.featuredCard.primaryLiveReady;
}

export function buildLocalizedFeaturedProviderCard(
  provider: ProviderViewModel,
  i18n: RuntimeI18n,
  copy: ReturnType<typeof buildPopupLocalizedCopy>,
): PopupFeaturedProviderCard {
  return {
    provider,
    statusLabel: buildLocalizedFeaturedStatusLabel(provider, copy),
    metaChips: buildLocalizedPopupFeaturedMetaChips(provider, i18n),
    primaryDetail: buildLocalizedFeaturedPrimaryDetail(provider, copy),
    secondaryDetail: buildPopupFeaturedSecondaryDetail(provider, i18n),
    usageProgressCircles: buildPopupUsageProgressCircles(provider, i18n),
    action:
      provider.permissionStatus === "missing" ||
      provider.currentSourceStateKind === "credential_missing"
        ? {
            kind: "settings",
            label: i18n.t("common.actions.open_settings"),
          }
        : provider.currentSourceStateKind === "policy_only"
          ? {
              kind: "settings",
              label: i18n.t("common.actions.open_settings"),
            }
          : provider.openableSessionPageUrl !== null &&
              (provider.currentSourceStateKind === "open_page_required" ||
                provider.currentSourceStateKind === "logged_out" ||
                provider.currentSourceStateKind === "capture_unavailable")
            ? {
                kind: "source-page",
                label: copy.featuredCard.openSourcePageAction,
                providerId: provider.providerId,
                sourceStateKind: provider.currentSourceStateKind,
              }
          : provider.currentSourceStateKind !== "ready" ||
              (provider.displaySyncStatus !== "ok" &&
                provider.warningDiagnostic?.category !== "usage_threshold")
            ? {
                kind: "provider-detail",
                label: copy.featuredCard.reviewDetailAction,
                providerId: provider.providerId,
              }
            : {
                kind: "provider-detail",
                label: copy.featuredCard.openDetailAction,
                providerId: provider.providerId,
              },
    secondaryAction: {
      kind: "hide-provider",
      label: copy.featuredCard.hideProviderAction,
      providerId: provider.providerId,
    },
  };
}
