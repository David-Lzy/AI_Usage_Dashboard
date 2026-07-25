import type {
  FieldAvailability,
  ProviderSourceContractKind,
  ProviderSourceKind,
  ProviderSourcePreference,
  SourceConnectionMode,
  SourceRolloutStage,
} from "../providers/types";

export type ProviderSourceFidelityKind =
  | "exact"
  | "window_only"
  | "analytics_only"
  | "policy_only"
  | "local_estimate";

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
  sourceContractLabels: Partial<Record<ProviderSourceContractKind, string>>;
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
  shipped_api_gateway_metering: "Shipped API gateway metering",
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
