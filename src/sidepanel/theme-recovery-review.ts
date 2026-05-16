import { buildActionBadgeModel } from "../background/action-badge";
import type {
  AppState,
  ProviderId,
  ProviderTone,
  SyncStatus,
} from "../providers/types";
import { buildPopupViewModel } from "../popup/view-models";
import { resolveThemeMode, type ResolvedThemeMode } from "../shared/theme";
import { getProviderViewModel, getVisibleProviders } from "./view-models";

export const THEME_RECOVERY_REVIEW_TARGET_PROVIDER_IDS = [
  "cursor-personal-page",
  "codex-personal-page",
] as const satisfies readonly ProviderId[];

export type ThemeRecoveryReviewTargetProviderId =
  (typeof THEME_RECOVERY_REVIEW_TARGET_PROVIDER_IDS)[number];

export type ThemeRecoveryReviewStage =
  | "needs_access"
  | "mixed"
  | "recovered"
  | "sync_issue";

export type ThemeRecoveryReviewTone = ProviderTone;

export type ThemeRecoveryReviewRequestContext = {
  requestId: string;
  requestCreatedAt: string;
  requestBoundWorkspaceRoute: string;
};

export type ThemeRecoveryTargetSnapshot = {
  providerId: ThemeRecoveryReviewTargetProviderId;
  providerLabel: string;
  visible: boolean;
  displaySyncStatus: SyncStatus;
  permissionStatus: "granted" | "missing";
  currentSourceLabel: string;
  currentSourceStateKind:
    | "ready"
    | "policy_only"
    | "host_access_missing"
    | "credential_missing"
    | "open_page_required"
    | "logged_out"
    | "capture_unavailable"
    | "sync_error";
  currentSourceStateLabel: string;
  currentSourceStateDetail: string;
  currentSourceStateTone: ProviderTone;
  lastSyncLabel: string;
  recoveryLabel: string;
  recoveryTone: ThemeRecoveryReviewTone;
  recoveryDetail: string;
  hostAccessLabel: string;
  isRecovered: boolean;
};

export type ThemeRecoveryReviewSnapshot = {
  generatedAt: string;
  requestContext: ThemeRecoveryReviewRequestContext | null;
  themeMode: AppState["settings"]["themeMode"];
  themePreset: AppState["settings"]["themePreset"];
  themeResolved: ResolvedThemeMode;
  themeCustomSeedHex: string | null;
  popupSnapshotLabel: string;
  popupSnapshotTone: ProviderTone;
  popupSnapshotHeadline: string;
  popupSnapshotDetail: string;
  computedActionBadge: {
    text: string;
    title: string;
  };
  scopeIsolationLabel: string;
  scopeIsolationDetail: string;
  missingTargetProviderIds: ThemeRecoveryReviewTargetProviderId[];
  extraVisibleProviderLabels: string[];
  overallStage: ThemeRecoveryReviewStage;
  overallLabel: string;
  overallTone: ThemeRecoveryReviewTone;
  overallDetail: string;
  targetProviders: ThemeRecoveryTargetSnapshot[];
};

export type ThemeRecoveryLiveBadgeSnapshot = {
  available: boolean;
  text: string;
  title: string;
  sourceLabel: string;
};

export type ThemeRecoveryReviewExport = ThemeRecoveryReviewSnapshot & {
  liveActionBadge: ThemeRecoveryLiveBadgeSnapshot | null;
};

function getTargetProviderIds(): ThemeRecoveryReviewTargetProviderId[] {
  return [...THEME_RECOVERY_REVIEW_TARGET_PROVIDER_IDS];
}

function buildTargetRecoverySnapshot(
  state: AppState,
  providerId: ThemeRecoveryReviewTargetProviderId,
): ThemeRecoveryTargetSnapshot {
  const visibleProviderIds = new Set(
    getVisibleProviders(state).map((provider) => provider.providerId),
  );
  const provider = getProviderViewModel(state, providerId);

  if (!provider) {
    return {
      providerId,
      providerLabel: providerId,
      visible: false,
      displaySyncStatus: "warning",
      permissionStatus: "missing",
      currentSourceLabel: "Unavailable",
      currentSourceStateKind: "sync_error",
      currentSourceStateLabel: "Unavailable",
      currentSourceStateDetail:
        "No provider snapshot is currently available for this recovery target.",
      currentSourceStateTone: "warning",
      lastSyncLabel: "No snapshot",
      recoveryLabel: "Missing from state",
      recoveryTone: "warning",
      recoveryDetail:
        "This recovery target is missing from the current app state and cannot be reviewed yet.",
      hostAccessLabel: "Missing",
      isRecovered: false,
    };
  }

  const visible = visibleProviderIds.has(providerId);
  const hasSyncIssue =
    provider.displaySyncStatus === "error" ||
    provider.currentSourceStateKind === "sync_error" ||
    provider.currentSourceStateKind === "capture_unavailable";
  const needsAccess =
    provider.permissionStatus === "missing" ||
    provider.currentSourceStateKind === "host_access_missing";
  const recovered =
    visible &&
    provider.permissionStatus === "granted" &&
    provider.displaySyncStatus === "ok" &&
    (provider.currentSourceStateKind === "ready" ||
      provider.currentSourceStateKind === "policy_only");

  let recoveryLabel = "Needs review";
  let recoveryTone: ThemeRecoveryReviewTone = "warning";
  let recoveryDetail = provider.currentSourceStateDetail;

  if (!visible) {
    recoveryLabel = "Hidden from scope";
    recoveryDetail =
      "Enable this provider and keep it visible before trusting the shared popup snapshot.";
  } else if (hasSyncIssue) {
    recoveryLabel = "Sync issue";
    recoveryTone = "error";
    recoveryDetail =
      provider.warningReason ??
      "This provider is still reporting a sync issue instead of a recovered healthy state.";
  } else if (needsAccess) {
    recoveryLabel = "Needs access";
    recoveryDetail =
      "Grant the required host access in Settings or through the native prompt before treating this provider as recovered.";
  } else if (recovered) {
    recoveryLabel = "Healthy";
    recoveryTone = "neutral";
    recoveryDetail =
      "This target is visible, granted, and currently reporting a ready healthy state under the saved theme.";
  }

  return {
    providerId,
    providerLabel: provider.providerLabel,
    visible,
    displaySyncStatus: provider.displaySyncStatus,
    permissionStatus: provider.permissionStatus,
    currentSourceLabel: provider.currentSourceLabel,
    currentSourceStateKind: provider.currentSourceStateKind,
    currentSourceStateLabel: provider.currentSourceStateLabel,
    currentSourceStateDetail: provider.currentSourceStateDetail,
    currentSourceStateTone: provider.currentSourceStateTone,
    lastSyncLabel: provider.lastSyncLabel,
    recoveryLabel,
    recoveryTone,
    recoveryDetail,
    hostAccessLabel:
      provider.permissionStatus === "granted" ? "Granted" : "Missing",
    isRecovered: recovered,
  };
}

function buildScopeIsolation(
  state: AppState,
  targetProviders: ThemeRecoveryTargetSnapshot[],
): {
  label: string;
  detail: string;
  missingTargetProviderIds: ThemeRecoveryReviewTargetProviderId[];
  extraVisibleProviderLabels: string[];
} {
  const visibleProviders = getVisibleProviders(state);
  const targetProviderIds = new Set<ProviderId>(getTargetProviderIds());
  const missingTargetProviderIds = targetProviders
    .filter((provider) => !provider.visible)
    .map((provider) => provider.providerId);
  const extraVisibleProviderLabels = visibleProviders
    .filter((provider) => !targetProviderIds.has(provider.providerId))
    .map((provider) => provider.providerLabel);

  if (missingTargetProviderIds.length > 0) {
    return {
      label: "Scope incomplete",
      detail: `Enable the missing target providers before trusting the shared recovery summary: ${missingTargetProviderIds.join(", ")}.`,
      missingTargetProviderIds,
      extraVisibleProviderLabels,
    };
  }

  if (extraVisibleProviderLabels.length > 0) {
    return {
      label: "Additional providers visible",
      detail: `Hide the extra providers before trusting popup alignment for this recovery pass: ${extraVisibleProviderLabels.join(", ")}.`,
      missingTargetProviderIds,
      extraVisibleProviderLabels,
    };
  }

  return {
    label: "Cursor + Codex isolated",
    detail:
      "Only the target session-page providers are visible, so popup alignment and action-badge recovery can be interpreted directly.",
    missingTargetProviderIds,
    extraVisibleProviderLabels,
  };
}

function buildOverallStage(
  scopeIsolation: {
    label: string;
    detail: string;
    missingTargetProviderIds: ThemeRecoveryReviewTargetProviderId[];
    extraVisibleProviderLabels: string[];
  },
  targetProviders: ThemeRecoveryTargetSnapshot[],
  popupSnapshotLabel: string,
): {
  stage: ThemeRecoveryReviewStage;
  label: string;
  tone: ThemeRecoveryReviewTone;
  detail: string;
} {
  if (scopeIsolation.missingTargetProviderIds.length > 0) {
    return {
      stage: "mixed",
      label: "Scope incomplete",
      tone: "warning",
      detail: scopeIsolation.detail,
    };
  }

  if (
    targetProviders.some(
      (provider) =>
        provider.displaySyncStatus === "error" ||
        provider.currentSourceStateKind === "sync_error",
    )
  ) {
    return {
      stage: "sync_issue",
      label: "Sync issue",
      tone: "error",
      detail:
        "At least one target provider is still reporting a sync issue instead of a recovered healthy state.",
    };
  }

  if (
    targetProviders.some(
      (provider) =>
        provider.permissionStatus === "missing" ||
        provider.currentSourceStateKind === "host_access_missing",
    )
  ) {
    return {
      stage: "needs_access",
      label: "Needs access",
      tone: "warning",
      detail:
        "At least one target provider still needs host access before this recovery pass can be considered complete.",
    };
  }

  if (scopeIsolation.extraVisibleProviderLabels.length > 0) {
    return {
      stage: "mixed",
      label: "Needs scope cleanup",
      tone: "warning",
      detail: scopeIsolation.detail,
    };
  }

  if (
    targetProviders.every((provider) => provider.isRecovered) &&
    popupSnapshotLabel === "Aligned"
  ) {
    return {
      stage: "recovered",
      label: "Recovered",
      tone: "neutral",
      detail:
        "The target providers are healthy, isolated, and the popup snapshot is aligned under the same saved theme state.",
    };
  }

  return {
    stage: "mixed",
    label: "Needs review",
    tone: "warning",
    detail:
      "The target providers look healthier, but the popup summary is not yet aligned enough to treat this as a completed recovery pass.",
  };
}

export function buildThemeRecoveryReviewSnapshot(
  state: AppState,
  resolvedThemeMode: ResolvedThemeMode = resolveThemeMode(state.settings.themeMode),
  generatedAt = new Date().toISOString(),
  requestContext: ThemeRecoveryReviewRequestContext | null = null,
): ThemeRecoveryReviewSnapshot {
  const popupViewModel = buildPopupViewModel(state);
  const computedActionBadge = buildActionBadgeModel(state);
  const targetProviders = getTargetProviderIds().map((providerId) =>
    buildTargetRecoverySnapshot(state, providerId),
  );
  const scopeIsolation = buildScopeIsolation(state, targetProviders);
  const overallStage = buildOverallStage(
    scopeIsolation,
    targetProviders,
    popupViewModel.snapshotStatus.label,
  );

  return {
    generatedAt,
    requestContext,
    themeMode: state.settings.themeMode,
    themePreset: state.settings.themePreset,
    themeResolved: resolvedThemeMode,
    themeCustomSeedHex: state.settings.themeCustomSeedHex,
    popupSnapshotLabel: popupViewModel.snapshotStatus.label,
    popupSnapshotTone: popupViewModel.snapshotStatus.tone,
    popupSnapshotHeadline: popupViewModel.snapshotStatus.headline,
    popupSnapshotDetail: popupViewModel.snapshotStatus.detail,
    computedActionBadge: {
      text: computedActionBadge.text,
      title: computedActionBadge.title,
    },
    scopeIsolationLabel: scopeIsolation.label,
    scopeIsolationDetail: scopeIsolation.detail,
    missingTargetProviderIds: scopeIsolation.missingTargetProviderIds,
    extraVisibleProviderLabels: scopeIsolation.extraVisibleProviderLabels,
    overallStage: overallStage.stage,
    overallLabel: overallStage.label,
    overallTone: overallStage.tone,
    overallDetail: overallStage.detail,
    targetProviders,
  };
}

function formatActionBadgeText(text: string): string {
  return text.trim().length > 0 ? text.trim() : "cleared";
}

export function buildThemeRecoveryReviewExport(
  snapshot: ThemeRecoveryReviewSnapshot,
  liveActionBadge: ThemeRecoveryLiveBadgeSnapshot | null,
): ThemeRecoveryReviewExport {
  return {
    ...snapshot,
    liveActionBadge,
  };
}

export function buildThemeRecoveryReviewSummary(
  snapshot: ThemeRecoveryReviewSnapshot,
  liveActionBadge: ThemeRecoveryLiveBadgeSnapshot | null = null,
): string {
  const badge = liveActionBadge?.available
    ? {
        text: liveActionBadge.text,
        title: liveActionBadge.title,
        sourceLabel: liveActionBadge.sourceLabel,
      }
    : {
        text: snapshot.computedActionBadge.text,
        title: snapshot.computedActionBadge.title,
        sourceLabel: "Computed from current app state",
      };
  const seedLine =
    snapshot.themePreset === "custom" && snapshot.themeCustomSeedHex
      ? `\nSeed: ${snapshot.themeCustomSeedHex}`
      : "";
  const requestBindingLine = snapshot.requestContext
    ? `\nRequest binding: ${snapshot.requestContext.requestId} @ ${snapshot.requestContext.requestCreatedAt}`
    : "";
  const providerLines = snapshot.targetProviders
    .map(
      (provider) =>
        `- ${provider.providerLabel}: ${provider.recoveryLabel} · Host access ${provider.hostAccessLabel.toLowerCase()} · ${provider.currentSourceStateLabel} · ${provider.lastSyncLabel}`,
    )
    .join("\n");
  const detailLines = Array.from(
    new Set([
      snapshot.overallDetail,
      snapshot.scopeIsolationDetail,
      snapshot.popupSnapshotDetail,
    ]),
  )
    .map((line) => `- ${line}`)
    .join("\n");

  return `# Theme Recovery Review Snapshot

Generated at: ${snapshot.generatedAt}
Theme: ${snapshot.themeMode} (resolved ${snapshot.themeResolved}) · Preset: ${snapshot.themePreset}${seedLine}
${requestBindingLine}
Review stage: ${snapshot.overallLabel}
Scope: ${snapshot.scopeIsolationLabel}
Popup snapshot: ${snapshot.popupSnapshotLabel} · ${snapshot.popupSnapshotHeadline}
Action badge: ${formatActionBadgeText(badge.text)} · ${badge.title}
Action badge source: ${badge.sourceLabel}

Target providers:
${providerLines}

Review detail:
${detailLines}
`;
}

export function serializeThemeRecoveryReviewExport(
  exportValue: ThemeRecoveryReviewExport,
): string {
  return `${JSON.stringify(exportValue, null, 2)}\n`;
}
