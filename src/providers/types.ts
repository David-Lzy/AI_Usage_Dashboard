export type ProviderId =
  | "cursor"
  | "jetbrains"
  | "claude-code"
  | "gemini"
  | "codex";

export type ApiKeyProviderId = "cursor" | "claude-code";

export type ProviderTone = "neutral" | "warning" | "error";

export type QuotaUnit = "requests" | "credits" | "sessions" | "percent";

export type QuotaWindow = "monthly" | "rolling" | "daily" | "workspace";

export type SyncSource = "official" | "page_parse";

export type ProviderSourceKind =
  | "official_api"
  | "session_page"
  | "policy_only";

export type ProviderSourcePreference =
  | "auto"
  | "official_api"
  | "session_page";

export type ProviderDiagnosticSeverity = "info" | "warning" | "error";

export type ProviderDiagnosticCategory =
  | "source_selection"
  | "source_fallback"
  | "credential"
  | "host_access"
  | "page_session"
  | "usage_threshold"
  | "policy_only"
  | "sync_stale"
  | "adapter_error";

export type KnownProviderDiagnosticCode =
  | "source.auto_selected_official_api"
  | "source.auto_selected_session_page"
  | "source.preference_selected_official_api"
  | "source.preference_selected_session_page"
  | "source.official_api_missing_credential"
  | "source.official_api_failed"
  | "source.session_page_unavailable"
  | "source.no_live_path"
  | "credential.admin_api_key_missing"
  | "credential.workspace_config_missing"
  | "host_access.missing"
  | "host_access.required_for_live_sync"
  | "page_session.open_page_required"
  | "page_session.logged_out"
  | "page_session.capture_unavailable"
  | "usage.threshold_warning"
  | "usage.overage_detected"
  | "usage.on_demand_off"
  | "policy.live_source_unavailable"
  | "policy.documented_limit_only"
  | "sync.automatic_sync_overdue"
  | "sync.cached_state_stale"
  | "adapter.unexpected_error"
  | "adapter.unsupported_response"
  | "adapter.parse_failed";

export type ProviderDiagnosticCode =
  | KnownProviderDiagnosticCode
  | (string & {});

export type ProviderDiagnosticParams = Record<
  string,
  string | number | boolean | null
>;

export type ProviderDiagnostic = {
  code: ProviderDiagnosticCode;
  category: ProviderDiagnosticCategory;
  severity: ProviderDiagnosticSeverity;
  rawMessage: string;
  params?: ProviderDiagnosticParams;
};

export type SourceRolloutStage = "shipped" | "planned" | "deferred";

export type SourceConnectionMode = "credential" | "page_session" | "none";

export type ProviderSourceContractKind =
  | "shipped_admin_analytics"
  | "shipped_enterprise_analytics"
  | "shipped_personal_partial"
  | "shipped_policy_only"
  | "deferred_personal_page"
  | "deferred_project_metrics"
  | "deferred_org_console";

export type FieldAvailability =
  | "exact"
  | "window_only"
  | "analytics_only"
  | "documented_policy"
  | "unavailable";

export type SyncStatus = "ok" | "warning" | "error";

export type PermissionStatus = "granted" | "missing";

export type CredentialStatus = "configured" | "missing" | "not_required";

export type SummaryTone = "neutral" | "warning" | "error";

export type SyncTrigger = "manual" | "alarm" | "bootstrap";

export type ProviderPageBindingStatus = "unbound" | "bound" | "stale";

export type ThemeMode = "system" | "light" | "dark";
export type ThemePreset = "default" | "meadow" | "sunset" | "custom";
export type AppLocalePreference = "system" | "en" | "zh-CN";

export type ProviderPageBinding = {
  mode: "auto" | "bound";
  status: ProviderPageBindingStatus;
  tabId: number | null;
  matchedUrl: string | null;
  matchedTitle: string | null;
  updatedAt: string | null;
};

export type ProviderSourcePlan = {
  kind: ProviderSourceKind;
  rolloutStage: SourceRolloutStage;
  connectionMode: SourceConnectionMode;
  contractKind: ProviderSourceContractKind;
  priority: number;
  label: string;
  routeHints: string[];
  usedAvailability: FieldAvailability;
  remainingAvailability: FieldAvailability;
  resetAvailability: FieldAvailability;
  contractDetail: string;
  graduationGateLabel: string | null;
  graduationGateDetail: string | null;
  note: string;
};

export type ProviderSourceBlueprint = {
  preferredSourceKind: ProviderSourceKind;
  fallbackOrder: ProviderSourceKind[];
  credentialPersistence: "extension_local_only" | "not_applicable";
  cookiePersistence: "forbidden";
  manualCookieImport: "forbidden";
  sources: ProviderSourcePlan[];
};

export type ProviderSnapshot = {
  providerId: ProviderId;
  providerLabel: string;
  planName: string;
  quotaUnit: QuotaUnit;
  quotaWindow: QuotaWindow;
  used: number | null;
  remaining: number | null;
  total: number | null;
  resetAt: string;
  resetLabel: string;
  syncedAt: string;
  syncSource: SyncSource;
  syncStatus: SyncStatus;
  warningReason: string | null;
  lastSyncLabel: string;
  sourceSelectionReason: string;
  sourceFallbackReason: string | null;
  warningDiagnostic?: ProviderDiagnostic | null;
  sourceSelectionDiagnostic?: ProviderDiagnostic | null;
  sourceFallbackDiagnostic?: ProviderDiagnostic | null;
  tone: ProviderTone;
};

export type ProviderSetting = {
  id: ProviderId;
  label: string;
  enabled: boolean;
  status: PermissionStatus;
  credentialStatus: CredentialStatus;
  sourcePreference: ProviderSourcePreference;
  pageBinding: ProviderPageBinding;
  hostsLabel: string;
  hostOrigins: string[];
  description: string;
};

export type ProviderSyncOutcome = {
  snapshot: ProviderSnapshot;
  setting?: ProviderSetting;
};

export type AppSettings = {
  syncIntervalMinutes: number;
  warningThresholdPercent: number;
  locale: AppLocalePreference;
  themeMode: ThemeMode;
  themePreset: ThemePreset;
  themeCustomSeedHex: string | null;
};

export type SummaryItem = {
  label: string;
  value: string;
  tone: SummaryTone;
};

export type AppState = {
  providers: ProviderSnapshot[];
  providerSettings: ProviderSetting[];
  settings: AppSettings;
};

export type ProviderSecrets = {
  cursor: {
    adminApiKey: string | null;
  };
  "claude-code": {
    adminApiKey: string | null;
  };
  codex: {
    analyticsApiKey: string | null;
    workspaceId: string | null;
  };
};
