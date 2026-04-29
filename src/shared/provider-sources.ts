import type {
  FieldAvailability,
  ProviderId,
  ProviderSourceContractKind,
  ProviderSourcePreference,
  ProviderSetting,
  ProviderSnapshot,
  ProviderSourceKind,
  ProviderSourcePlan,
  ProviderTone,
  SourceConnectionMode,
  SourceRolloutStage,
} from "../providers/types";
import { PROVIDER_SOURCE_BLUEPRINTS } from "./constants";

export type ProviderSourceStateKind =
  | "ready"
  | "policy_only"
  | "host_access_missing"
  | "credential_missing"
  | "open_page_required"
  | "logged_out"
  | "capture_unavailable"
  | "sync_error";

type ClassifiedSourceState = {
  kind: ProviderSourceStateKind;
  label: string;
  tone: ProviderTone;
  detail: string;
};

export type ProviderSourceFidelityKind =
  | "exact"
  | "window_only"
  | "analytics_only"
  | "policy_only"
  | "local_estimate";

export type ProviderSourceDisplay = {
  currentKind: ProviderSourceKind;
  currentLabel: string;
  currentPlan: ProviderSourcePlan;
  currentRolloutStageLabel: string;
  currentContractLabel: string;
  currentContractDetail: string;
  currentGraduationGateLabel: string | null;
  currentGraduationGateDetail: string | null;
  fallbackPlans: ProviderSourcePlan[];
  sessionPagePlan: ProviderSourcePlan | null;
  sessionPageRolloutStageLabel: string | null;
  sessionPageContractLabel: string | null;
  sessionPageContractDetail: string | null;
  sessionPageGraduationGateLabel: string | null;
  sessionPageGraduationGateDetail: string | null;
  sourcePreference: ProviderSourcePreference;
  sourcePreferenceLabel: string;
  sourcePreferenceOptions: ProviderSourcePreference[];
  sourceSelectionReason: string;
  sourceFallbackReason: string | null;
  stateKind: ProviderSourceStateKind;
  stateLabel: string;
  stateTone: ProviderTone;
  stateDetail: string;
  pageBindingLabel: string | null;
  pageBindingModeLabel: string | null;
  pageBindingDetail: string | null;
  fidelityKind: ProviderSourceFidelityKind;
  fidelityLabel: string;
  fidelityDetail: string;
  fidelityTone: ProviderTone;
  usedAvailabilityLabel: string;
  remainingAvailabilityLabel: string;
  resetAvailabilityLabel: string;
  availabilitySummary: string;
  sessionPageFidelityLabel: string | null;
  sessionPageFidelityDetail: string | null;
  sessionPageFidelityTone: ProviderTone | null;
  sessionPageAvailabilitySummary: string | null;
  accessModelLabel: string;
  accessModelDetail: string;
  credentialPersistenceLabel: string;
  credentialPersistenceDetail: string;
  cookiePolicyLabel: string;
  cookiePolicyDetail: string;
  manualCookieImportLabel: string;
  manualCookieImportDetail: string;
  hostAccessLabel: string;
  hostAccessDetail: string;
};

export type ProviderSourceDisplayCopy = {
  sourceKindLabels: Record<ProviderSourceKind, string>;
  sourcePreferenceLabels: Record<ProviderSourcePreference, string>;
  rolloutStageLabels: Record<SourceRolloutStage, string>;
  fieldAvailabilityLabels: Record<FieldAvailability, string>;
  sourceFidelity: Record<
    ProviderSourceFidelityKind,
    {
      label: string;
      detail: string;
    }
  >;
  connectionMode: Record<
    SourceConnectionMode,
    {
      label: string;
      detail: string;
    }
  >;
  sourceContractLabels: Record<ProviderSourceContractKind, string>;
  credentialPersistence: {
    extensionLocalOnlyLabel: string;
    extensionLocalOnlyDetail: string;
    notApplicableLabel: string;
    notApplicableDetail: string;
  };
  cookiePolicy: {
    forbiddenLabel: string;
    forbiddenDetail: string;
  };
  manualCookieImport: {
    forbiddenLabel: string;
    forbiddenDetail: string;
  };
  hostAccess: {
    notRequiredLabel: string;
    notRequiredDetail: string;
    requiredLabel: string;
    requiredDetail: (hostsLabel: string) => string;
  };
  sourceState: {
    readyLabel: string;
    policyOnlyLabel: string;
    hostAccessMissingLabel: string;
    hostAccessMissingFallbackDetail: string;
    credentialMissingLabel: string;
    credentialMissingFallbackDetail: string;
    loggedOutLabel: string;
    loggedOutFallbackDetail: string;
    openPageRequiredLabel: string;
    openPageRequiredFallbackDetail: string;
    captureUnavailableLabel: string;
    captureUnavailableFallbackDetail: string;
    syncErrorLabel: string;
    syncErrorFallbackDetail: string;
  };
  pageBinding: {
    boundTabLabel: string;
    autoReconnectLabel: string;
    targetFallback: string;
    lastAttachedSuffix: (updatedAt: string) => string;
    attachedLabel: string;
    attachedDetail: (
      modeLabel: string,
      targetLabel: string,
      lastSeenSuffix: string,
    ) => string;
    staleLabel: string;
    staleDetail: (
      modeLabel: string,
      targetLabel: string,
      lastSeenSuffix: string,
    ) => string;
    notBoundLabel: string;
    notBoundDetail: string;
  };
  availabilitySummary: (used: string, remaining: string, reset: string) => string;
};

const SOURCE_KIND_LABELS: Record<ProviderSourceKind, string> = {
  official_api: "Official API",
  session_page: "Session page",
  policy_only: "Policy only",
};

const SOURCE_PREFERENCE_LABELS: Record<ProviderSourcePreference, string> = {
  auto: "Auto",
  official_api: "Official API",
  session_page: "Session page",
};

const ROLLOUT_STAGE_LABELS: Record<SourceRolloutStage, string> = {
  shipped: "Shipped",
  planned: "Planned",
  deferred: "Deferred",
};

const FIELD_AVAILABILITY_LABELS: Record<FieldAvailability, string> = {
  exact: "Exact",
  window_only: "Window only",
  analytics_only: "Analytics",
  documented_policy: "Policy",
  unavailable: "Unavailable",
};

const SOURCE_FIDELITY_LABELS: Record<ProviderSourceFidelityKind, string> = {
  exact: "Exact vendor value",
  window_only: "Window-only vendor value",
  analytics_only: "Analytics snapshot",
  policy_only: "Documented policy",
  local_estimate: "Local estimate",
};

const CONNECTION_MODE_LABELS: Record<SourceConnectionMode, string> = {
  credential: "Stored credential",
  page_session: "Logged-in page session",
  none: "No live connection",
};

const SOURCE_CONTRACT_LABELS: Record<ProviderSourceContractKind, string> = {
  shipped_admin_analytics: "Shipped admin analytics",
  shipped_enterprise_analytics: "Shipped enterprise analytics",
  shipped_personal_partial: "Shipped personal partial",
  shipped_policy_only: "Shipped policy only",
  deferred_personal_page: "Deferred personal page",
  deferred_project_metrics: "Deferred project metrics",
  deferred_org_console: "Deferred org console path",
};

export const DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY: ProviderSourceDisplayCopy = {
  sourceKindLabels: SOURCE_KIND_LABELS,
  sourcePreferenceLabels: SOURCE_PREFERENCE_LABELS,
  rolloutStageLabels: ROLLOUT_STAGE_LABELS,
  fieldAvailabilityLabels: FIELD_AVAILABILITY_LABELS,
  sourceFidelity: {
    exact: {
      label: SOURCE_FIDELITY_LABELS.exact,
      detail:
        "This path exposes vendor-reported values directly for the tracked usage and remaining balance.",
    },
    window_only: {
      label: SOURCE_FIDELITY_LABELS.window_only,
      detail:
        "This path exposes vendor-reported values for the active window or partial context, not one absolute remaining balance.",
    },
    analytics_only: {
      label: SOURCE_FIDELITY_LABELS.analytics_only,
      detail:
        "This path exposes aggregated analytics or snapshot values, not a live remaining counter.",
    },
    policy_only: {
      label: SOURCE_FIDELITY_LABELS.policy_only,
      detail:
        "This path is documented policy only. No live page session or live API source is selected.",
    },
    local_estimate: {
      label: SOURCE_FIDELITY_LABELS.local_estimate,
      detail:
        "This path would rely on locally inferred counters instead of vendor-reported live usage.",
    },
  },
  connectionMode: {
    credential: {
      label: CONNECTION_MODE_LABELS.credential,
      detail:
        "This path runs from the extension using a credential saved in extension-managed local storage.",
    },
    page_session: {
      label: CONNECTION_MODE_LABELS.page_session,
      detail:
        "This path attaches to an already logged-in browser tab and reads normalized page data inside the current session.",
    },
    none: {
      label: CONNECTION_MODE_LABELS.none,
      detail:
        "This path does not use a live credential or page session. The extension shows documented policy only.",
    },
  },
  sourceContractLabels: SOURCE_CONTRACT_LABELS,
  credentialPersistence: {
    extensionLocalOnlyLabel: "Extension local only",
    extensionLocalOnlyDetail:
      "Any configured credential stays in extension-managed local storage on this browser profile only.",
    notApplicableLabel: "Not applicable",
    notApplicableDetail: "No credential is stored for this provider's shipped contract.",
  },
  cookiePolicy: {
    forbiddenLabel: "Forbidden",
    forbiddenDetail: "Raw cookies are not persisted in extension storage.",
  },
  manualCookieImport: {
    forbiddenLabel: "Forbidden",
    forbiddenDetail:
      "The product does not ask the user to paste cookies or auth headers into extension settings.",
  },
  hostAccess: {
    notRequiredLabel: "Not required",
    notRequiredDetail:
      "No optional host permission is required for this provider's shipped contract.",
    requiredLabel: "Required",
    requiredDetail: (hostsLabel: string) =>
      `Live access depends on Chrome host permission for ${hostsLabel}.`,
  },
  sourceState: {
    readyLabel: "Ready to sync",
    policyOnlyLabel: "No live sync",
    hostAccessMissingLabel: "Host access missing",
    hostAccessMissingFallbackDetail:
      "Grant the required host access before live sync can run.",
    credentialMissingLabel: "Credential missing",
    credentialMissingFallbackDetail:
      "Add the required provider credential before live sync can run.",
    loggedOutLabel: "Logged-out page",
    loggedOutFallbackDetail:
      "Log in on the provider page again before refreshing the dashboard.",
    openPageRequiredLabel: "Open page required",
    openPageRequiredFallbackDetail:
      "Open the required logged-in provider page, then refresh again.",
    captureUnavailableLabel: "Page capture unavailable",
    captureUnavailableFallbackDetail:
      "Reload the open provider page, then refresh again.",
    syncErrorLabel: "Sync issue",
    syncErrorFallbackDetail:
      "The current provider source failed unexpectedly during refresh.",
  },
  pageBinding: {
    boundTabLabel: "Bound tab",
    autoReconnectLabel: "Auto reconnect",
    targetFallback: "the last matched provider page",
    lastAttachedSuffix: (updatedAt: string) => ` Last attached ${updatedAt}.`,
    attachedLabel: "Attached",
    attachedDetail: (
      modeLabel: string,
      targetLabel: string,
      lastSeenSuffix: string,
    ) => `${modeLabel} is currently tracking ${targetLabel}.${lastSeenSuffix}`,
    staleLabel: "Stale binding",
    staleDetail: (
      modeLabel: string,
      targetLabel: string,
      lastSeenSuffix: string,
    ) =>
      `${modeLabel} last pointed to ${targetLabel}, but the current session no longer exposes a usable page there.${lastSeenSuffix}`,
    notBoundLabel: "Not bound",
    notBoundDetail:
      "No provider page is pinned yet. Auto discovery can still search current tabs, or you can use Find or open page to attach one explicitly.",
  },
  availabilitySummary: (used: string, remaining: string, reset: string) =>
    `Used: ${used} · Remaining: ${remaining} · Reset: ${reset}`,
};

function lower(value: string | null | undefined): string {
  return (value ?? "").toLowerCase();
}

function includesAny(value: string, patterns: string[]): boolean {
  return patterns.some((pattern) => value.includes(pattern));
}

export function getSourceKindLabel(
  kind: ProviderSourceKind,
  copy: ProviderSourceDisplayCopy = DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
): string {
  return copy.sourceKindLabels[kind];
}

export function getSourcePreferenceLabel(
  preference: ProviderSourcePreference,
  copy: ProviderSourceDisplayCopy = DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
): string {
  return copy.sourcePreferenceLabels[preference];
}

export function getRolloutStageLabel(
  stage: SourceRolloutStage,
  copy: ProviderSourceDisplayCopy = DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
): string {
  return copy.rolloutStageLabels[stage];
}

export function getFieldAvailabilityLabel(
  availability: FieldAvailability,
  copy: ProviderSourceDisplayCopy = DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
): string {
  return copy.fieldAvailabilityLabels[availability];
}

export function getSourceFidelityLabel(
  kind: ProviderSourceFidelityKind,
  copy: ProviderSourceDisplayCopy = DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
): string {
  return copy.sourceFidelity[kind].label;
}

export function getConnectionModeLabel(
  mode: SourceConnectionMode,
  copy: ProviderSourceDisplayCopy = DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
): string {
  return copy.connectionMode[mode].label;
}

export function getSourceContractLabel(
  kind: ProviderSourceContractKind,
  copy: ProviderSourceDisplayCopy = DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
): string {
  return copy.sourceContractLabels[kind];
}

export function getProviderSourceBlueprint(providerId: ProviderId) {
  return PROVIDER_SOURCE_BLUEPRINTS[providerId];
}

function getSelectableSourceKinds(providerId: ProviderId): ProviderSourceKind[] {
  return getProviderSourceBlueprint(providerId).sources
    .filter(
      (source) =>
        source.rolloutStage === "shipped" && source.kind !== "policy_only",
    )
    .sort((left, right) => left.priority - right.priority)
    .map((source) => source.kind);
}

export function getSourcePreferenceOptions(
  providerId: ProviderId,
): ProviderSourcePreference[] {
  const selectableKinds = getSelectableSourceKinds(providerId);

  if (selectableKinds.length < 2) {
    return ["auto"];
  }

  return [
    "auto",
    ...selectableKinds.filter(
      (kind): kind is Exclude<ProviderSourcePreference, "auto"> =>
        kind === "official_api" || kind === "session_page",
    ),
  ];
}

export function normalizeSourcePreference(
  providerId: ProviderId,
  value: unknown,
): ProviderSourcePreference {
  const options = getSourcePreferenceOptions(providerId);

  return options.includes(value as ProviderSourcePreference)
    ? (value as ProviderSourcePreference)
    : "auto";
}

export function getSourceAttemptOrder(
  providerId: ProviderId,
  preference: ProviderSourcePreference,
): ProviderSourceKind[] {
  const blueprint = getProviderSourceBlueprint(providerId);
  const shippedKinds = getSelectableSourceKinds(providerId);

  if (shippedKinds.length === 0) {
    return [];
  }

  if (preference === "auto") {
    return [
      blueprint.preferredSourceKind,
      ...blueprint.fallbackOrder,
      ...shippedKinds,
    ].filter(
      (kind, index, values): kind is ProviderSourceKind =>
        kind !== "policy_only" &&
        shippedKinds.includes(kind) &&
        values.indexOf(kind) === index,
    );
  }

  return [preference, ...blueprint.fallbackOrder, ...shippedKinds].filter(
    (kind, index, values): kind is ProviderSourceKind =>
      kind !== "policy_only" &&
      shippedKinds.includes(kind) &&
      values.indexOf(kind) === index,
  );
}

export function inferCurrentSourceKind(
  provider: Pick<ProviderSnapshot, "providerId" | "syncSource">,
): ProviderSourceKind {
  if (provider.providerId === "gemini") {
    return "policy_only";
  }

  return provider.syncSource === "page_parse" ? "session_page" : "official_api";
}

export function getProviderSourcePlan(
  providerId: ProviderId,
  kind: ProviderSourceKind,
): ProviderSourcePlan {
  const blueprint = getProviderSourceBlueprint(providerId);
  const matchedPlan = blueprint.sources.find((source) => source.kind === kind);

  if (!matchedPlan) {
    throw new Error(`Missing ${kind} source plan for provider ${providerId}.`);
  }

  return matchedPlan;
}

export function getSessionPagePlan(
  providerId: ProviderId,
): ProviderSourcePlan | null {
  return (
    getProviderSourceBlueprint(providerId).sources.find(
      (source) => source.kind === "session_page",
    ) ?? null
  );
}

export function getOpenableRouteHint(routeHints: string[]): string | null {
  for (const routeHint of routeHints) {
    if (!routeHint.startsWith("https://")) {
      continue;
    }

    const normalizedRoute = routeHint.replace(/\*+$/, "");

    if (!normalizedRoute.includes("*")) {
      return normalizedRoute;
    }
  }

  return null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeComparableUrl(value: string): string | null {
  try {
    return new URL(value).toString();
  } catch {
    return null;
  }
}

function normalizeComparableUrlWithoutHash(value: string): string | null {
  const normalizedUrl = normalizeComparableUrl(value);

  if (!normalizedUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(normalizedUrl);
    parsedUrl.hash = "";
    return parsedUrl.toString();
  } catch {
    return normalizedUrl.split("#")[0] ?? normalizedUrl;
  }
}

export function doesUrlMatchRouteHint(url: string, routeHint: string): boolean {
  const normalizedUrl = normalizeComparableUrl(url);
  const normalizedRouteHint = normalizeComparableUrl(routeHint.replace(/\*+$/, ""));

  if (!normalizedUrl || !routeHint.startsWith("https://")) {
    return false;
  }

  if (routeHint.includes("*")) {
    const wildcardPattern = routeHint
      .split("*")
      .map((part) => escapeRegExp(part))
      .join(".*");

    return new RegExp(`^${wildcardPattern}$`).test(normalizedUrl);
  }

  if (!normalizedRouteHint) {
    return false;
  }

  return (
    normalizedUrl === normalizedRouteHint ||
    normalizeComparableUrlWithoutHash(normalizedUrl) ===
      normalizeComparableUrlWithoutHash(normalizedRouteHint)
  );
}

export function doesUrlMatchRouteHints(
  url: string,
  routeHints: string[],
): boolean {
  return routeHints.some((routeHint) => doesUrlMatchRouteHint(url, routeHint));
}

function inferSourceFidelityKind(
  sourcePlan: ProviderSourcePlan,
): ProviderSourceFidelityKind {
  const note = lower(sourcePlan.note);
  const availabilities = [
    sourcePlan.usedAvailability,
    sourcePlan.remainingAvailability,
    sourcePlan.resetAvailability,
  ];

  if (
    sourcePlan.kind === "policy_only" ||
    availabilities.includes("documented_policy")
  ) {
    return "policy_only";
  }

  if (
    includesAny(note, [
      "local estimate",
      "local counter",
      "locally counted",
      "inferred",
    ])
  ) {
    return "local_estimate";
  }

  if (availabilities.includes("analytics_only")) {
    return "analytics_only";
  }

  if (
    sourcePlan.usedAvailability === "exact" &&
    (sourcePlan.remainingAvailability === "exact" ||
      sourcePlan.remainingAvailability === "unavailable") &&
    (sourcePlan.resetAvailability === "exact" ||
      sourcePlan.resetAvailability === "window_only" ||
      sourcePlan.resetAvailability === "unavailable")
  ) {
    return "exact";
  }

  return "window_only";
}

function buildSourceFidelityDetail(
  kind: ProviderSourceFidelityKind,
  copy: ProviderSourceDisplayCopy = DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
): string {
  return copy.sourceFidelity[kind].detail;
}

function getFidelityTone(kind: ProviderSourceFidelityKind): ProviderTone {
  return kind === "exact" ? "neutral" : "warning";
}

function formatAvailabilitySummary(
  sourcePlan: ProviderSourcePlan,
  copy: ProviderSourceDisplayCopy = DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
): string {
  return copy.availabilitySummary(
    getFieldAvailabilityLabel(sourcePlan.usedAvailability, copy),
    getFieldAvailabilityLabel(sourcePlan.remainingAvailability, copy),
    getFieldAvailabilityLabel(sourcePlan.resetAvailability, copy),
  );
}

function buildAccessModelDetail(
  mode: SourceConnectionMode,
  copy: ProviderSourceDisplayCopy = DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
): string {
  return copy.connectionMode[mode].detail;
}

function buildCredentialPersistenceDisplay(
  providerId: ProviderId,
  copy: ProviderSourceDisplayCopy = DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
): {
  label: string;
  detail: string;
} {
  const blueprint = getProviderSourceBlueprint(providerId);

  if (blueprint.credentialPersistence === "extension_local_only") {
    return {
      label: copy.credentialPersistence.extensionLocalOnlyLabel,
      detail: copy.credentialPersistence.extensionLocalOnlyDetail,
    };
  }

  return {
    label: copy.credentialPersistence.notApplicableLabel,
    detail: copy.credentialPersistence.notApplicableDetail,
  };
}

function buildCookiePolicyDisplay(
  copy: ProviderSourceDisplayCopy = DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
): {
  label: string;
  detail: string;
} {
  return {
    label: copy.cookiePolicy.forbiddenLabel,
    detail: copy.cookiePolicy.forbiddenDetail,
  };
}

function buildManualCookieImportDisplay(
  copy: ProviderSourceDisplayCopy = DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
): {
  label: string;
  detail: string;
} {
  return {
    label: copy.manualCookieImport.forbiddenLabel,
    detail: copy.manualCookieImport.forbiddenDetail,
  };
}

function buildHostAccessDisplay(
  setting: ProviderSetting,
  copy: ProviderSourceDisplayCopy = DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
): {
  label: string;
  detail: string;
} {
  if ((setting.hostOrigins?.length ?? 0) === 0) {
    return {
      label: copy.hostAccess.notRequiredLabel,
      detail: copy.hostAccess.notRequiredDetail,
    };
  }

  return {
    label: copy.hostAccess.requiredLabel,
    detail: copy.hostAccess.requiredDetail(setting.hostsLabel),
  };
}

function createPolicyOnlySourceState(
  currentPlan: ProviderSourcePlan,
  copy: ProviderSourceDisplayCopy,
): ClassifiedSourceState {
  return {
    kind: "policy_only",
    label: copy.sourceState.policyOnlyLabel,
    tone: "warning",
    detail: currentPlan.note,
  };
}

function createHostAccessMissingSourceState(
  warningReason: string,
  copy: ProviderSourceDisplayCopy,
): ClassifiedSourceState {
  return {
    kind: "host_access_missing",
    label: copy.sourceState.hostAccessMissingLabel,
    tone: "warning",
    detail: warningReason || copy.sourceState.hostAccessMissingFallbackDetail,
  };
}

function createCredentialMissingSourceState(
  warningReason: string,
  copy: ProviderSourceDisplayCopy,
): ClassifiedSourceState {
  return {
    kind: "credential_missing",
    label: copy.sourceState.credentialMissingLabel,
    tone: "error",
    detail: warningReason || copy.sourceState.credentialMissingFallbackDetail,
  };
}

function createLoggedOutSourceState(
  warningReason: string,
  copy: ProviderSourceDisplayCopy,
): ClassifiedSourceState {
  return {
    kind: "logged_out",
    label: copy.sourceState.loggedOutLabel,
    tone: "warning",
    detail: warningReason || copy.sourceState.loggedOutFallbackDetail,
  };
}

function createOpenPageRequiredSourceState(
  warningReason: string,
  copy: ProviderSourceDisplayCopy,
): ClassifiedSourceState {
  return {
    kind: "open_page_required",
    label: copy.sourceState.openPageRequiredLabel,
    tone: "warning",
    detail: warningReason || copy.sourceState.openPageRequiredFallbackDetail,
  };
}

function createSyncErrorSourceState(
  warningReason: string,
  copy: ProviderSourceDisplayCopy,
): ClassifiedSourceState {
  return {
    kind: "sync_error",
    label: copy.sourceState.syncErrorLabel,
    tone: "error",
    detail: warningReason || copy.sourceState.syncErrorFallbackDetail,
  };
}

function createCaptureUnavailableSourceState(
  warningReason: string,
  copy: ProviderSourceDisplayCopy,
): ClassifiedSourceState {
  return {
    kind: "capture_unavailable",
    label: copy.sourceState.captureUnavailableLabel,
    tone: "error",
    detail: warningReason || copy.sourceState.captureUnavailableFallbackDetail,
  };
}

function createReadySourceState(
  currentPlan: ProviderSourcePlan,
  copy: ProviderSourceDisplayCopy,
): ClassifiedSourceState {
  return {
    kind: "ready",
    label: copy.sourceState.readyLabel,
    tone: "neutral",
    detail: currentPlan.note,
  };
}

function classifySourceStateFromWarningDiagnostic(
  provider: ProviderSnapshot,
  currentPlan: ProviderSourcePlan,
  copy: ProviderSourceDisplayCopy,
): ClassifiedSourceState | null {
  const warningDiagnostic = provider.warningDiagnostic;
  const warningReason = provider.warningReason ?? "";

  if (!warningDiagnostic) {
    return null;
  }

  if (warningDiagnostic.category === "policy_only") {
    return createPolicyOnlySourceState(currentPlan, copy);
  }

  if (warningDiagnostic.category === "host_access") {
    return createHostAccessMissingSourceState(warningReason, copy);
  }

  if (warningDiagnostic.category === "credential") {
    return createCredentialMissingSourceState(warningReason, copy);
  }

  if (warningDiagnostic.category === "page_session") {
    if (warningDiagnostic.code === "page_session.logged_out") {
      return createLoggedOutSourceState(warningReason, copy);
    }

    if (warningDiagnostic.code === "page_session.open_page_required") {
      return createOpenPageRequiredSourceState(warningReason, copy);
    }

    if (
      warningDiagnostic.code === "page_session.capture_unavailable" &&
      provider.syncStatus === "error"
    ) {
      return createCaptureUnavailableSourceState(warningReason, copy);
    }
  }

  if (warningDiagnostic.category === "sync_stale") {
    if (
      warningDiagnostic.code === "sync.automatic_sync_overdue" &&
      provider.syncStatus === "error"
    ) {
      return createSyncErrorSourceState(warningReason, copy);
    }

    if (warningDiagnostic.code === "sync.cached_state_stale") {
      return createReadySourceState(currentPlan, copy);
    }
  }

  if (warningDiagnostic.category === "usage_threshold") {
    return createReadySourceState(currentPlan, copy);
  }

  if (
    warningDiagnostic.category === "adapter_error" &&
    provider.syncStatus === "error"
  ) {
    return createSyncErrorSourceState(warningReason, copy);
  }

  return null;
}

function classifySourceState(
  provider: ProviderSnapshot,
  setting: ProviderSetting,
  currentPlan: ProviderSourcePlan,
  copy: ProviderSourceDisplayCopy = DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
): ClassifiedSourceState {
  const warningReason = provider.warningReason ?? "";
  const lowerReason = lower(warningReason);
  const requiresHostAccess = setting.hostOrigins.length > 0;
  const typedSourceState = classifySourceStateFromWarningDiagnostic(
    provider,
    currentPlan,
    copy,
  );

  if (typedSourceState) {
    return typedSourceState;
  }

  if (currentPlan.kind === "policy_only") {
    return createPolicyOnlySourceState(currentPlan, copy);
  }

  if (
    requiresHostAccess &&
    (setting.status === "missing" ||
      includesAny(lowerReason, [
        "host access missing",
        "access is not configured",
        "grant ",
      ]))
  ) {
    return createHostAccessMissingSourceState(warningReason, copy);
  }

  if (
    includesAny(lowerReason, [
      "api key",
      "workspace id",
      "credential",
      "config required",
    ]) ||
    (currentPlan.connectionMode === "credential" &&
      setting.credentialStatus === "missing" &&
      provider.syncStatus === "error")
  ) {
    return createCredentialMissingSourceState(warningReason, copy);
  }

  if (
    currentPlan.kind === "session_page" &&
    includesAny(lowerReason, [
      "log in",
      "logged in",
      "session not detected",
      "sign in",
    ])
  ) {
    return createLoggedOutSourceState(warningReason, copy);
  }

  if (
    currentPlan.kind === "session_page" &&
    includesAny(lowerReason, [
      "open the",
      "open that page",
      "reopen",
      "did not find",
      "could not be inspected",
    ])
  ) {
    return createOpenPageRequiredSourceState(warningReason, copy);
  }

  if (provider.syncStatus === "error") {
    return createSyncErrorSourceState(warningReason, copy);
  }

  return createReadySourceState(currentPlan, copy);
}

function buildPageBindingDisplay(
  setting: ProviderSetting,
  sessionPagePlan: ProviderSourcePlan | null,
  copy: ProviderSourceDisplayCopy = DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
): {
  label: string | null;
  modeLabel: string | null;
  detail: string | null;
} {
  if (!sessionPagePlan) {
    return {
      label: null,
      modeLabel: null,
      detail: null,
    };
  }

  const modeLabel =
    setting.pageBinding.mode === "bound"
      ? copy.pageBinding.boundTabLabel
      : copy.pageBinding.autoReconnectLabel;
  const targetLabel =
    setting.pageBinding.matchedTitle ??
    setting.pageBinding.matchedUrl ??
    copy.pageBinding.targetFallback;
  const lastSeenSuffix = setting.pageBinding.updatedAt
    ? copy.pageBinding.lastAttachedSuffix(setting.pageBinding.updatedAt)
    : "";

  if (setting.pageBinding.status === "bound") {
    return {
      label: copy.pageBinding.attachedLabel,
      modeLabel,
      detail: copy.pageBinding.attachedDetail(
        modeLabel,
        targetLabel,
        lastSeenSuffix,
      ),
    };
  }

  if (setting.pageBinding.status === "stale") {
    return {
      label: copy.pageBinding.staleLabel,
      modeLabel,
      detail: copy.pageBinding.staleDetail(
        modeLabel,
        targetLabel,
        lastSeenSuffix,
      ),
    };
  }

  return {
    label: copy.pageBinding.notBoundLabel,
    modeLabel,
    detail: copy.pageBinding.notBoundDetail,
  };
}

export function buildProviderSourceDisplay(
  provider: ProviderSnapshot,
  setting: ProviderSetting,
  copy: ProviderSourceDisplayCopy = DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY,
): ProviderSourceDisplay {
  const blueprint = getProviderSourceBlueprint(provider.providerId);
  const currentKind = inferCurrentSourceKind(provider);
  const currentPlan = getProviderSourcePlan(provider.providerId, currentKind);
  const sessionPagePlan = getSessionPagePlan(provider.providerId);
  const sourcePreference = normalizeSourcePreference(
    provider.providerId,
    setting.sourcePreference,
  );
  const fallbackPlans = blueprint.fallbackOrder
    .filter((kind) => kind !== currentKind)
    .map((kind) => getProviderSourcePlan(provider.providerId, kind));
  const state = classifySourceState(provider, setting, currentPlan, copy);
  const pageBinding = buildPageBindingDisplay(setting, sessionPagePlan, copy);
  const fidelityKind = inferSourceFidelityKind(currentPlan);
  const fidelityLabel = getSourceFidelityLabel(fidelityKind, copy);
  const fidelityDetail = buildSourceFidelityDetail(fidelityKind, copy);
  const sessionPageFidelityKind = sessionPagePlan
    ? inferSourceFidelityKind(sessionPagePlan)
    : null;
  const credentialPersistence = buildCredentialPersistenceDisplay(
    provider.providerId,
    copy,
  );
  const cookiePolicy = buildCookiePolicyDisplay(copy);
  const manualCookieImport = buildManualCookieImportDisplay(copy);
  const hostAccess = buildHostAccessDisplay(setting, copy);

  return {
    currentKind,
    currentLabel: getSourceKindLabel(currentKind, copy),
    currentPlan,
    currentRolloutStageLabel: getRolloutStageLabel(
      currentPlan.rolloutStage,
      copy,
    ),
    currentContractLabel: getSourceContractLabel(
      currentPlan.contractKind,
      copy,
    ),
    currentContractDetail: currentPlan.contractDetail,
    currentGraduationGateLabel: currentPlan.graduationGateLabel,
    currentGraduationGateDetail: currentPlan.graduationGateDetail,
    fallbackPlans,
    sessionPagePlan,
    sessionPageRolloutStageLabel: sessionPagePlan
      ? getRolloutStageLabel(sessionPagePlan.rolloutStage, copy)
      : null,
    sessionPageContractLabel: sessionPagePlan
      ? getSourceContractLabel(sessionPagePlan.contractKind, copy)
      : null,
    sessionPageContractDetail: sessionPagePlan?.contractDetail ?? null,
    sessionPageGraduationGateLabel: sessionPagePlan?.graduationGateLabel ?? null,
    sessionPageGraduationGateDetail:
      sessionPagePlan?.graduationGateDetail ?? null,
    sourcePreference,
    sourcePreferenceLabel: getSourcePreferenceLabel(sourcePreference, copy),
    sourcePreferenceOptions: getSourcePreferenceOptions(provider.providerId),
    sourceSelectionReason: provider.sourceSelectionReason,
    sourceFallbackReason: provider.sourceFallbackReason,
    stateKind: state.kind,
    stateLabel: state.label,
    stateTone: state.tone,
    stateDetail: state.detail,
    pageBindingLabel: pageBinding.label,
    pageBindingModeLabel: pageBinding.modeLabel,
    pageBindingDetail: pageBinding.detail,
    fidelityKind,
    fidelityLabel,
    fidelityDetail,
    fidelityTone: getFidelityTone(fidelityKind),
    usedAvailabilityLabel: getFieldAvailabilityLabel(
      currentPlan.usedAvailability,
      copy,
    ),
    remainingAvailabilityLabel: getFieldAvailabilityLabel(
      currentPlan.remainingAvailability,
      copy,
    ),
    resetAvailabilityLabel: getFieldAvailabilityLabel(
      currentPlan.resetAvailability,
      copy,
    ),
    availabilitySummary: formatAvailabilitySummary(currentPlan, copy),
    sessionPageFidelityLabel: sessionPageFidelityKind
      ? getSourceFidelityLabel(sessionPageFidelityKind, copy)
      : null,
    sessionPageFidelityDetail: sessionPageFidelityKind
      ? buildSourceFidelityDetail(sessionPageFidelityKind, copy)
      : null,
    sessionPageFidelityTone: sessionPageFidelityKind
      ? getFidelityTone(sessionPageFidelityKind)
      : null,
    sessionPageAvailabilitySummary: sessionPagePlan
      ? formatAvailabilitySummary(sessionPagePlan, copy)
      : null,
    accessModelLabel: getConnectionModeLabel(currentPlan.connectionMode, copy),
    accessModelDetail: buildAccessModelDetail(currentPlan.connectionMode, copy),
    credentialPersistenceLabel: credentialPersistence.label,
    credentialPersistenceDetail: credentialPersistence.detail,
    cookiePolicyLabel: cookiePolicy.label,
    cookiePolicyDetail: cookiePolicy.detail,
    manualCookieImportLabel: manualCookieImport.label,
    manualCookieImportDetail: manualCookieImport.detail,
    hostAccessLabel: hostAccess.label,
    hostAccessDetail: hostAccess.detail,
  };
}
