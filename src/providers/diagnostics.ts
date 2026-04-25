import type {
  KnownProviderDiagnosticCode,
  ProviderDiagnostic,
  ProviderDiagnosticCategory,
  ProviderDiagnosticParams,
  ProviderDiagnosticSeverity,
  ProviderId,
  ProviderSourceKind,
  ProviderSourcePreference,
} from "./types";

type SourceAttemptFailureDiagnosticInput = {
  kind: ProviderSourceKind;
  code: string;
  detail: string;
};

type CredentialDiagnosticKind = "admin_api_key" | "workspace_config";

export const PROVIDER_DIAGNOSTIC_CODE_CATEGORIES = {
  "source.auto_selected_official_api": "source_selection",
  "source.auto_selected_session_page": "source_selection",
  "source.preference_selected_official_api": "source_selection",
  "source.preference_selected_session_page": "source_selection",
  "source.official_api_missing_credential": "source_fallback",
  "source.official_api_failed": "source_fallback",
  "source.session_page_unavailable": "source_fallback",
  "source.no_live_path": "source_fallback",
  "credential.admin_api_key_missing": "credential",
  "credential.workspace_config_missing": "credential",
  "host_access.missing": "host_access",
  "host_access.required_for_live_sync": "host_access",
  "page_session.open_page_required": "page_session",
  "page_session.logged_out": "page_session",
  "page_session.capture_unavailable": "page_session",
  "usage.threshold_warning": "usage_threshold",
  "usage.overage_detected": "usage_threshold",
  "usage.on_demand_off": "usage_threshold",
  "policy.live_source_unavailable": "policy_only",
  "policy.documented_limit_only": "policy_only",
  "sync.automatic_sync_overdue": "sync_stale",
  "sync.cached_state_stale": "sync_stale",
  "adapter.unexpected_error": "adapter_error",
  "adapter.unsupported_response": "adapter_error",
  "adapter.parse_failed": "adapter_error",
} satisfies Record<KnownProviderDiagnosticCode, ProviderDiagnosticCategory>;

export function isKnownProviderDiagnosticCode(
  code: string,
): code is KnownProviderDiagnosticCode {
  return code in PROVIDER_DIAGNOSTIC_CODE_CATEGORIES;
}

export function getProviderDiagnosticCategory(
  code: KnownProviderDiagnosticCode,
): ProviderDiagnosticCategory {
  return PROVIDER_DIAGNOSTIC_CODE_CATEGORIES[code];
}

export function createProviderDiagnostic(
  code: KnownProviderDiagnosticCode,
  severity: ProviderDiagnosticSeverity,
  rawMessage: string,
  params?: ProviderDiagnosticParams,
): ProviderDiagnostic {
  return {
    code,
    category: getProviderDiagnosticCategory(code),
    severity,
    rawMessage,
    ...(params ? { params } : {}),
  };
}

function getSourceSelectionDiagnosticCode(
  sourcePreference: ProviderSourcePreference,
  selectedKind: ProviderSourceKind,
): KnownProviderDiagnosticCode | null {
  if (selectedKind === "official_api") {
    return sourcePreference === "auto"
      ? "source.auto_selected_official_api"
      : "source.preference_selected_official_api";
  }

  if (selectedKind === "session_page") {
    return sourcePreference === "auto"
      ? "source.auto_selected_session_page"
      : "source.preference_selected_session_page";
  }

  return null;
}

function getSourceFallbackDiagnosticCode(
  failure: SourceAttemptFailureDiagnosticInput,
): KnownProviderDiagnosticCode {
  if (failure.kind === "official_api") {
    return failure.code === "credential_missing"
      ? "source.official_api_missing_credential"
      : "source.official_api_failed";
  }

  if (failure.kind === "session_page") {
    return "source.session_page_unavailable";
  }

  return "source.no_live_path";
}

function getCredentialDiagnosticCode(
  credentialKind: CredentialDiagnosticKind,
): KnownProviderDiagnosticCode {
  return credentialKind === "workspace_config"
    ? "credential.workspace_config_missing"
    : "credential.admin_api_key_missing";
}

export function createSourceSelectionDiagnostic({
  providerId,
  sourcePreference,
  selectedKind,
  hadFallback,
  rawMessage,
}: {
  providerId: ProviderId;
  sourcePreference: ProviderSourcePreference;
  selectedKind: ProviderSourceKind;
  hadFallback: boolean;
  rawMessage: string;
}): ProviderDiagnostic | null {
  const code = getSourceSelectionDiagnosticCode(sourcePreference, selectedKind);

  if (!code) {
    return null;
  }

  return createProviderDiagnostic(code, "info", rawMessage, {
    providerId,
    sourcePreference,
    selectedKind,
    hadFallback,
  });
}

export function createSourceFallbackDiagnostic({
  providerId,
  sourcePreference,
  failure,
  rawMessage,
}: {
  providerId: ProviderId;
  sourcePreference: ProviderSourcePreference;
  failure: SourceAttemptFailureDiagnosticInput;
  rawMessage: string;
}): ProviderDiagnostic {
  return createProviderDiagnostic(
    getSourceFallbackDiagnosticCode(failure),
    failure.code === "credential_missing" ? "warning" : "error",
    rawMessage,
    {
      providerId,
      sourcePreference,
      failedSourceKind: failure.kind,
      failureCode: failure.code,
    },
  );
}

export function createNoLiveSourceFallbackDiagnostic({
  providerId,
  sourcePreference,
  failureCount,
  rawMessage,
}: {
  providerId: ProviderId;
  sourcePreference: ProviderSourcePreference;
  failureCount: number;
  rawMessage: string;
}): ProviderDiagnostic {
  return createProviderDiagnostic("source.no_live_path", "error", rawMessage, {
    providerId,
    sourcePreference,
    failureCount,
  });
}

export function createCredentialDiagnostic({
  providerId,
  credentialKind,
  rawMessage,
}: {
  providerId: ProviderId;
  credentialKind: CredentialDiagnosticKind;
  rawMessage: string;
}): ProviderDiagnostic {
  return createProviderDiagnostic(
    getCredentialDiagnosticCode(credentialKind),
    "error",
    rawMessage,
    {
      providerId,
      credentialKind,
    },
  );
}

export function createHostAccessDiagnostic({
  providerId,
  sourceKind,
  hostLabel,
  rawMessage,
}: {
  providerId: ProviderId;
  sourceKind: ProviderSourceKind;
  hostLabel: string;
  rawMessage: string;
}): ProviderDiagnostic {
  return createProviderDiagnostic("host_access.missing", "warning", rawMessage, {
    providerId,
    sourceKind,
    hostLabel,
  });
}

export function getProviderDiagnosticRawMessage(
  diagnostic: ProviderDiagnostic | null | undefined,
  fallbackRawMessage: string | null | undefined,
): string | null {
  const rawMessage = diagnostic?.rawMessage.trim();

  if (rawMessage) {
    return rawMessage;
  }

  const fallback = fallbackRawMessage?.trim();

  return fallback ? fallback : null;
}
