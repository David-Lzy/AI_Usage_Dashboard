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
  | "sync_error";

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
  currentContractLabel: string;
  currentContractDetail: string;
  currentGraduationGateLabel: string | null;
  currentGraduationGateDetail: string | null;
  fallbackPlans: ProviderSourcePlan[];
  sessionPagePlan: ProviderSourcePlan | null;
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

function lower(value: string | null | undefined): string {
  return (value ?? "").toLowerCase();
}

function includesAny(value: string, patterns: string[]): boolean {
  return patterns.some((pattern) => value.includes(pattern));
}

export function getSourceKindLabel(kind: ProviderSourceKind): string {
  return SOURCE_KIND_LABELS[kind];
}

export function getSourcePreferenceLabel(
  preference: ProviderSourcePreference,
): string {
  return SOURCE_PREFERENCE_LABELS[preference];
}

export function getRolloutStageLabel(stage: SourceRolloutStage): string {
  return ROLLOUT_STAGE_LABELS[stage];
}

export function getFieldAvailabilityLabel(
  availability: FieldAvailability,
): string {
  return FIELD_AVAILABILITY_LABELS[availability];
}

export function getSourceFidelityLabel(
  kind: ProviderSourceFidelityKind,
): string {
  return SOURCE_FIDELITY_LABELS[kind];
}

export function getConnectionModeLabel(mode: SourceConnectionMode): string {
  return CONNECTION_MODE_LABELS[mode];
}

export function getSourceContractLabel(
  kind: ProviderSourceContractKind,
): string {
  return SOURCE_CONTRACT_LABELS[kind];
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
  const matchedRoute = routeHints.find((routeHint) => routeHint.startsWith("https://"));
  return matchedRoute ? matchedRoute.replace(/\*+$/, "") : null;
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
): string {
  switch (kind) {
    case "exact":
      return "This path exposes vendor-reported values directly for the tracked usage and remaining balance.";
    case "window_only":
      return "This path exposes vendor-reported values for the active window or partial context, not one absolute remaining balance.";
    case "analytics_only":
      return "This path exposes aggregated analytics or snapshot values, not a live remaining counter.";
    case "policy_only":
      return "This path is documented policy only. No live page session or live API source is selected.";
    case "local_estimate":
      return "This path would rely on locally inferred counters instead of vendor-reported live usage.";
  }
}

function getFidelityTone(kind: ProviderSourceFidelityKind): ProviderTone {
  return kind === "exact" ? "neutral" : "warning";
}

function formatAvailabilitySummary(sourcePlan: ProviderSourcePlan): string {
  return [
    `Used: ${getFieldAvailabilityLabel(sourcePlan.usedAvailability)}`,
    `Remaining: ${getFieldAvailabilityLabel(sourcePlan.remainingAvailability)}`,
    `Reset: ${getFieldAvailabilityLabel(sourcePlan.resetAvailability)}`,
  ].join(" · ");
}

function buildAccessModelDetail(mode: SourceConnectionMode): string {
  switch (mode) {
    case "credential":
      return "This path runs from the extension using a credential saved in extension-managed local storage.";
    case "page_session":
      return "This path attaches to an already logged-in browser tab and reads normalized page data inside the current session.";
    case "none":
      return "This path does not use a live credential or page session. The extension shows documented policy only.";
  }
}

function buildCredentialPersistenceDisplay(
  providerId: ProviderId,
): {
  label: string;
  detail: string;
} {
  const blueprint = getProviderSourceBlueprint(providerId);

  if (blueprint.credentialPersistence === "extension_local_only") {
    return {
      label: "Extension local only",
      detail:
        "Any configured credential stays in extension-managed local storage on this browser profile only.",
    };
  }

  return {
    label: "Not applicable",
    detail: "No credential is stored for this provider's shipped contract.",
  };
}

function buildCookiePolicyDisplay(): {
  label: string;
  detail: string;
} {
  return {
    label: "Forbidden",
    detail: "Raw cookies are not persisted in extension storage.",
  };
}

function buildManualCookieImportDisplay(): {
  label: string;
  detail: string;
} {
  return {
    label: "Forbidden",
    detail:
      "The product does not ask the user to paste cookies or auth headers into extension settings.",
  };
}

function buildHostAccessDisplay(setting: ProviderSetting): {
  label: string;
  detail: string;
} {
  if ((setting.hostOrigins?.length ?? 0) === 0) {
    return {
      label: "Not required",
      detail:
        "No optional host permission is required for this provider's shipped contract.",
    };
  }

  return {
    label: "Required",
    detail: `Live access depends on Chrome host permission for ${setting.hostsLabel}.`,
  };
}

function classifySourceState(
  provider: ProviderSnapshot,
  setting: ProviderSetting,
  currentPlan: ProviderSourcePlan,
): {
  kind: ProviderSourceStateKind;
  label: string;
  tone: ProviderTone;
  detail: string;
} {
  const warningReason = provider.warningReason ?? "";
  const lowerReason = lower(warningReason);
  const requiresHostAccess = setting.hostOrigins.length > 0;

  if (currentPlan.kind === "policy_only") {
    return {
      kind: "policy_only",
      label: "No live sync",
      tone: "warning",
      detail: currentPlan.note,
    };
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
    return {
      kind: "host_access_missing",
      label: "Host access missing",
      tone: "warning",
      detail:
        warningReason || "Grant the required host access before live sync can run.",
    };
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
    return {
      kind: "credential_missing",
      label: "Credential missing",
      tone: "error",
      detail:
        warningReason ||
        "Add the required provider credential before live sync can run.",
    };
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
    return {
      kind: "logged_out",
      label: "Logged-out page",
      tone: "warning",
      detail:
        warningReason ||
        "Log in on the provider page again before refreshing the dashboard.",
    };
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
    return {
      kind: "open_page_required",
      label: "Open page required",
      tone: "warning",
      detail:
        warningReason ||
        "Open the required logged-in provider page, then refresh again.",
    };
  }

  if (provider.syncStatus === "error") {
    return {
      kind: "sync_error",
      label: "Sync issue",
      tone: "error",
      detail:
        warningReason ||
        "The current provider source failed unexpectedly during refresh.",
    };
  }

  return {
    kind: "ready",
    label: "Ready to sync",
    tone: "neutral",
    detail: currentPlan.note,
  };
}

function buildPageBindingDisplay(
  setting: ProviderSetting,
  sessionPagePlan: ProviderSourcePlan | null,
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
    setting.pageBinding.mode === "bound" ? "Bound tab" : "Auto reconnect";
  const targetLabel =
    setting.pageBinding.matchedTitle ??
    setting.pageBinding.matchedUrl ??
    "the last matched provider page";
  const lastSeenSuffix = setting.pageBinding.updatedAt
    ? ` Last attached ${setting.pageBinding.updatedAt}.`
    : "";

  if (setting.pageBinding.status === "bound") {
    return {
      label: "Attached",
      modeLabel,
      detail: `${modeLabel} is currently tracking ${targetLabel}.${lastSeenSuffix}`,
    };
  }

  if (setting.pageBinding.status === "stale") {
    return {
      label: "Stale binding",
      modeLabel,
      detail: `${modeLabel} last pointed to ${targetLabel}, but the current session no longer exposes a usable page there.${lastSeenSuffix}`,
    };
  }

  return {
    label: "Not bound",
    modeLabel,
    detail:
      "No provider page is pinned yet. Auto discovery can still search current tabs, or you can use Find or open page to attach one explicitly.",
  };
}

export function buildProviderSourceDisplay(
  provider: ProviderSnapshot,
  setting: ProviderSetting,
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
  const state = classifySourceState(provider, setting, currentPlan);
  const pageBinding = buildPageBindingDisplay(setting, sessionPagePlan);
  const fidelityKind = inferSourceFidelityKind(currentPlan);
  const fidelityLabel = getSourceFidelityLabel(fidelityKind);
  const fidelityDetail = buildSourceFidelityDetail(fidelityKind);
  const sessionPageFidelityKind = sessionPagePlan
    ? inferSourceFidelityKind(sessionPagePlan)
    : null;
  const credentialPersistence = buildCredentialPersistenceDisplay(
    provider.providerId,
  );
  const cookiePolicy = buildCookiePolicyDisplay();
  const manualCookieImport = buildManualCookieImportDisplay();
  const hostAccess = buildHostAccessDisplay(setting);

  return {
    currentKind,
    currentLabel: getSourceKindLabel(currentKind),
    currentPlan,
    currentContractLabel: getSourceContractLabel(currentPlan.contractKind),
    currentContractDetail: currentPlan.contractDetail,
    currentGraduationGateLabel: currentPlan.graduationGateLabel,
    currentGraduationGateDetail: currentPlan.graduationGateDetail,
    fallbackPlans,
    sessionPagePlan,
    sessionPageContractLabel: sessionPagePlan
      ? getSourceContractLabel(sessionPagePlan.contractKind)
      : null,
    sessionPageContractDetail: sessionPagePlan?.contractDetail ?? null,
    sessionPageGraduationGateLabel: sessionPagePlan?.graduationGateLabel ?? null,
    sessionPageGraduationGateDetail:
      sessionPagePlan?.graduationGateDetail ?? null,
    sourcePreference,
    sourcePreferenceLabel: getSourcePreferenceLabel(sourcePreference),
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
    usedAvailabilityLabel: getFieldAvailabilityLabel(currentPlan.usedAvailability),
    remainingAvailabilityLabel: getFieldAvailabilityLabel(
      currentPlan.remainingAvailability,
    ),
    resetAvailabilityLabel: getFieldAvailabilityLabel(currentPlan.resetAvailability),
    availabilitySummary: formatAvailabilitySummary(currentPlan),
    sessionPageFidelityLabel: sessionPageFidelityKind
      ? getSourceFidelityLabel(sessionPageFidelityKind)
      : null,
    sessionPageFidelityDetail: sessionPageFidelityKind
      ? buildSourceFidelityDetail(sessionPageFidelityKind)
      : null,
    sessionPageAvailabilitySummary: sessionPagePlan
      ? formatAvailabilitySummary(sessionPagePlan)
      : null,
    accessModelLabel: getConnectionModeLabel(currentPlan.connectionMode),
    accessModelDetail: buildAccessModelDetail(currentPlan.connectionMode),
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
