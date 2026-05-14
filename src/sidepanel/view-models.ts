import type {
  AppState,
  DisplaySurface,
  ProviderPageBinding,
  PermissionStatus,
  ProviderId,
  ProviderSetting,
  ProviderSnapshot,
  ProviderTone,
  SummaryItem,
  SyncStatus,
} from "../providers/types";
import {
  buildProviderSourceDisplay,
  getOpenableRouteHint,
  type ProviderSourceDisplayCopy,
} from "../shared/provider-sources";
import { createEmptyPageBinding } from "../shared/page-bindings";

export type ProviderViewModel = ProviderSnapshot & {
  permissionStatus: PermissionStatus;
  hostsLabel: string;
  description: string;
  displaySyncStatus: SyncStatus;
  displayTone: ProviderTone;
  sourcePreferenceLabel: string;
  currentSourceLabel: string;
  currentSourceContractLabel: string;
  currentSourceContractDetail: string;
  currentSourceGraduationGateLabel: string | null;
  currentSourceGraduationGateDetail: string | null;
  currentSourceFidelityLabel: string;
  currentSourceFidelityDetail: string;
  currentSourceFidelityTone: ProviderTone;
  currentSourceAvailabilitySummary: string;
  currentSourceUsedAvailabilityLabel: string;
  currentSourceRemainingAvailabilityLabel: string;
  currentSourceResetAvailabilityLabel: string;
  currentAccessModelLabel: string;
  currentAccessModelDetail: string;
  credentialPersistenceLabel: string;
  credentialPersistenceDetail: string;
  cookiePolicyLabel: string;
  cookiePolicyDetail: string;
  manualCookieImportLabel: string;
  manualCookieImportDetail: string;
  hostAccessRequirementLabel: string;
  hostAccessRequirementDetail: string;
  sourceSelectionReason: string;
  sourceFallbackReason: string | null;
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
  currentSourceNote: string;
  sessionPageContractLabel: string | null;
  sessionPageContractDetail: string | null;
  sessionPageGraduationGateLabel: string | null;
  sessionPageGraduationGateDetail: string | null;
  openableSessionPageUrl: string | null;
  fallbackSourceLabels: string[];
  pageBinding: ProviderPageBinding;
  pageBindingLabel: string | null;
  pageBindingModeLabel: string | null;
  pageBindingDetail: string | null;
};

export type DashboardSummaryLabels = {
  visible: string;
  healthy: string;
  needsAccess: string;
  needsAttention: string;
};

const DEFAULT_DASHBOARD_SUMMARY_LABELS: DashboardSummaryLabels = {
  visible: "Visible",
  healthy: "Healthy",
  needsAccess: "Needs Access",
  needsAttention: "Needs Attention",
};

type SummaryValueFormatter = (value: number) => string;

const DEFAULT_SUMMARY_VALUE_FORMATTER: SummaryValueFormatter = (value) =>
  String(value);

const SYNC_STATUS_PRIORITY: Record<SyncStatus, number> = {
  error: 0,
  warning: 1,
  ok: 2,
};

const TONE_PRIORITY: Record<ProviderTone, number> = {
  error: 0,
  warning: 1,
  neutral: 2,
};

function findProviderSetting(
  providerSettings: ProviderSetting[],
  providerId: ProviderId,
): ProviderSetting | null {
  return (
    providerSettings.find((provider) => provider.id === providerId) ?? null
  );
}

function getDisplaySyncStatus(
  syncStatus: SyncStatus,
  permissionStatus: PermissionStatus,
): SyncStatus {
  if (permissionStatus === "missing" && syncStatus === "ok") {
    return "warning";
  }

  return syncStatus;
}

function getDisplayTone(
  tone: ProviderTone,
  permissionStatus: PermissionStatus,
): ProviderTone {
  if (permissionStatus === "missing" && tone === "neutral") {
    return "warning";
  }

  return tone;
}

function getUsageRatio(provider: ProviderSnapshot): number {
  if (provider.used === null || provider.total === null || provider.total === 0) {
    return -1;
  }

  return provider.used / provider.total;
}

function toProviderViewModel(
  provider: ProviderSnapshot,
  setting: ProviderSetting | null,
  sourceDisplayCopy?: ProviderSourceDisplayCopy,
): ProviderViewModel {
  const permissionStatus = setting?.status ?? "missing";
  const sourceDisplay = buildProviderSourceDisplay(
    provider,
    setting ?? {
      id: provider.providerId,
      label: provider.providerLabel,
      enabled: true,
      status: "missing",
      credentialStatus: "not_required",
      sourcePreference: "auto",
      pageBinding: createEmptyPageBinding(),
      hostsLabel: "Host access not configured",
      hostOrigins: [],
      description: "No provider configuration available.",
    },
    sourceDisplayCopy,
  );
  const openableSessionPageUrl =
    sourceDisplay.sessionPagePlan?.rolloutStage === "shipped"
      ? getOpenableRouteHint(sourceDisplay.sessionPagePlan.routeHints)
      : null;

  return {
    ...provider,
    permissionStatus,
    hostsLabel: setting?.hostsLabel ?? "Host access not configured",
    description: setting?.description ?? "No provider configuration available.",
    displaySyncStatus: getDisplaySyncStatus(provider.syncStatus, permissionStatus),
    displayTone: getDisplayTone(provider.tone, permissionStatus),
    sourcePreferenceLabel: sourceDisplay.sourcePreferenceLabel,
    currentSourceLabel: sourceDisplay.currentLabel,
    currentSourceContractLabel: sourceDisplay.currentContractLabel,
    currentSourceContractDetail: sourceDisplay.currentContractDetail,
    currentSourceGraduationGateLabel: sourceDisplay.currentGraduationGateLabel,
    currentSourceGraduationGateDetail: sourceDisplay.currentGraduationGateDetail,
    currentSourceFidelityLabel: sourceDisplay.fidelityLabel,
    currentSourceFidelityDetail: sourceDisplay.fidelityDetail,
    currentSourceFidelityTone: sourceDisplay.fidelityTone,
    currentSourceAvailabilitySummary: sourceDisplay.availabilitySummary,
    currentSourceUsedAvailabilityLabel: sourceDisplay.usedAvailabilityLabel,
    currentSourceRemainingAvailabilityLabel:
      sourceDisplay.remainingAvailabilityLabel,
    currentSourceResetAvailabilityLabel: sourceDisplay.resetAvailabilityLabel,
    currentAccessModelLabel: sourceDisplay.accessModelLabel,
    currentAccessModelDetail: sourceDisplay.accessModelDetail,
    credentialPersistenceLabel: sourceDisplay.credentialPersistenceLabel,
    credentialPersistenceDetail: sourceDisplay.credentialPersistenceDetail,
    cookiePolicyLabel: sourceDisplay.cookiePolicyLabel,
    cookiePolicyDetail: sourceDisplay.cookiePolicyDetail,
    manualCookieImportLabel: sourceDisplay.manualCookieImportLabel,
    manualCookieImportDetail: sourceDisplay.manualCookieImportDetail,
    hostAccessRequirementLabel: sourceDisplay.hostAccessLabel,
    hostAccessRequirementDetail: sourceDisplay.hostAccessDetail,
    sourceSelectionReason: sourceDisplay.sourceSelectionReason,
    sourceFallbackReason: sourceDisplay.sourceFallbackReason,
    currentSourceStateKind: sourceDisplay.stateKind,
    currentSourceStateLabel: sourceDisplay.stateLabel,
    currentSourceStateDetail: sourceDisplay.stateDetail,
    currentSourceStateTone: sourceDisplay.stateTone,
    currentSourceNote: sourceDisplay.currentPlan.note,
    sessionPageContractLabel: sourceDisplay.sessionPageContractLabel,
    sessionPageContractDetail: sourceDisplay.sessionPageContractDetail,
    sessionPageGraduationGateLabel:
      sourceDisplay.sessionPageGraduationGateLabel,
    sessionPageGraduationGateDetail:
      sourceDisplay.sessionPageGraduationGateDetail,
    openableSessionPageUrl,
    fallbackSourceLabels: sourceDisplay.fallbackPlans.map(
      (sourcePlan) => sourcePlan.label,
    ),
    pageBinding: setting?.pageBinding ?? createEmptyPageBinding(),
    pageBindingLabel: sourceDisplay.pageBindingLabel,
    pageBindingModeLabel: sourceDisplay.pageBindingModeLabel,
    pageBindingDetail: sourceDisplay.pageBindingDetail,
  };
}

function compareProviders(
  left: ProviderViewModel,
  right: ProviderViewModel,
): number {
  const syncStatusDelta =
    SYNC_STATUS_PRIORITY[left.displaySyncStatus] -
    SYNC_STATUS_PRIORITY[right.displaySyncStatus];

  if (syncStatusDelta !== 0) {
    return syncStatusDelta;
  }

  if (left.permissionStatus !== right.permissionStatus) {
    return left.permissionStatus === "missing" ? -1 : 1;
  }

  const toneDelta =
    TONE_PRIORITY[left.displayTone] - TONE_PRIORITY[right.displayTone];

  if (toneDelta !== 0) {
    return toneDelta;
  }

  const usageDelta = getUsageRatio(right) - getUsageRatio(left);

  if (usageDelta !== 0) {
    return usageDelta;
  }

  return left.providerLabel.localeCompare(right.providerLabel);
}

function applyProviderOrderPreference(
  providers: ProviderViewModel[],
  providerOrder: ProviderId[],
): ProviderViewModel[] {
  if (providerOrder.length === 0) {
    return providers;
  }

  const providerOrderIndex = new Map(
    providerOrder.map((providerId, index) => [providerId, index]),
  );

  return [...providers].sort((left, right) => {
    const leftIndex = providerOrderIndex.get(left.providerId);
    const rightIndex = providerOrderIndex.get(right.providerId);

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

export function getVisibleProviders(
  state: AppState,
  sourceDisplayCopy?: ProviderSourceDisplayCopy,
  surface?: DisplaySurface,
): ProviderViewModel[] {
  const providers = state.providers
    .filter((provider) => {
      const setting = findProviderSetting(state.providerSettings, provider.providerId);
      return setting?.enabled ?? false;
    })
    .map((provider) =>
      toProviderViewModel(
        provider,
        findProviderSetting(state.providerSettings, provider.providerId),
        sourceDisplayCopy,
      ),
    )
    .sort(compareProviders);

  return surface
    ? applyProviderOrderPreference(
        providers,
        state.settings.providerOrderBySurface[surface],
      )
    : providers;
}

export function getProviderViewModel(
  state: AppState,
  providerId: ProviderId,
  sourceDisplayCopy?: ProviderSourceDisplayCopy,
): ProviderViewModel | null {
  const provider =
    state.providers.find((entry) => entry.providerId === providerId) ?? null;

  if (!provider) {
    return null;
  }

  return toProviderViewModel(
    provider,
    findProviderSetting(state.providerSettings, providerId),
    sourceDisplayCopy,
  );
}

export function buildSummaryItems(
  state: AppState,
  labels: DashboardSummaryLabels = DEFAULT_DASHBOARD_SUMMARY_LABELS,
  formatValue: SummaryValueFormatter = DEFAULT_SUMMARY_VALUE_FORMATTER,
): SummaryItem[] {
  const visibleProviders = getVisibleProviders(state);
  const healthyCount = visibleProviders.filter(
    (provider) =>
      provider.displaySyncStatus === "ok" &&
      provider.permissionStatus === "granted",
  ).length;
  const attentionCount = visibleProviders.filter(
    (provider) => provider.displaySyncStatus !== "ok",
  ).length;
  const accessGapCount = visibleProviders.filter(
    (provider) => provider.permissionStatus === "missing",
  ).length;

  return [
    {
      label: labels.visible,
      value: formatValue(visibleProviders.length),
      tone: "neutral",
    },
    {
      label: labels.healthy,
      value: formatValue(healthyCount),
      tone: healthyCount > 0 ? "neutral" : "warning",
    },
    {
      label: labels.needsAccess,
      value: formatValue(accessGapCount),
      tone: accessGapCount > 0 ? "warning" : "neutral",
    },
    {
      label: labels.needsAttention,
      value: formatValue(attentionCount),
      tone: attentionCount > 0 ? "error" : "neutral",
    },
  ];
}
