export type ProviderBrandId =
  | "cursor"
  | "jetbrains"
  | "claude-code"
  | "gemini"
  | "codex";

export type ProviderId =
  | "cursor-personal-page"
  | "cursor-team-api"
  | "jetbrains-org-page"
  | "claude-code-team-page"
  | "claude-code-admin-api"
  | "gemini-policy"
  | "codex-personal-page"
  | "codex-enterprise-api";

export type LegacyProviderId = ProviderBrandId;

export type ApiKeyProviderId =
  | "cursor-team-api"
  | "claude-code-admin-api"
  | "codex-enterprise-api";

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
export type UiFontFamily = "default" | "system" | "serif" | "mono";
export type MotionMode = "system" | "full" | "reduced";
export type AppLocalePreference =
  | "system"
  | "en"
  | "zh-CN"
  | "zh-TW"
  | "ja"
  | "ko"
  | "es-419"
  | "pt-BR"
  | "fr"
  | "de"
  | "it"
  | "ru"
  | "ar"
  | "hi"
  | "id";
export type SettingsUserLevel = "basic" | "advanced" | "developer" | "debug";
export type ProgressDisplayStyle =
  | "line"
  | "circle"
  | "circle-soft"
  | "circle-gauge";
export type PopupSizePreset = "compact" | "balanced" | "wide";
export type PopupCornerStyle = "square" | "soft" | "rounded";
export type PopupShadowStyle = "none" | "soft" | "elevated";
export type PopupCircularProgressItemsPerRow = 1 | 2 | 3 | 4;
export type ActionBadgeSelection = "attention" | (string & {});
export type ActionBadgeSelections = ActionBadgeSelection[];
export type ActionBadgeSelectionMode = "auto" | "manual";
export type DisplaySurface = "popup" | "sidebar" | "fullPage";
export type ProviderOrderBySurface = Record<DisplaySurface, ProviderId[]>;
export type ProviderProgressItemPreference = {
  id: string;
  visible: boolean;
};
export type ProgressItemsBySurface = Record<
  DisplaySurface,
  Partial<Record<ProviderId, ProviderProgressItemPreference[]>>
>;
export type ProgressColorBand = {
  id: string;
  minimumPercent: number;
  maximumPercent: number;
  colorHex: string;
};
export type ProgressGradientStop = {
  id: string;
  positionPercent: number;
  colorHex: string;
};
export type ProgressColorAppearance =
  | {
      mode: "traditional";
      bands: ProgressColorBand[];
    }
  | {
      mode: "gradient";
      stops: ProgressGradientStop[];
    };

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
  usageWindows?: ProviderUsageWindow[];
  usageBalances?: ProviderUsageBalance[];
  usageFacts?: ProviderUsageFact[];
  usageSummary?: string | null;
  tone: ProviderTone;
};

export type ProviderUsageWindow = {
  label: string;
  normalizedLabel: string;
  kind:
    | "rolling_5h"
    | "weekly"
    | "model_rolling_5h"
    | "model_weekly"
    | "unknown";
  modelLabel: string | null;
  quotaUnit: "percent";
  used: number | null;
  remaining: number | null;
  total: number | null;
  resetAt: string | null;
  resetLabel: string | null;
};

export type ProviderUsageBalance = {
  label: string;
  normalizedLabel: string;
  kind: "flex_credit_balance" | "unknown";
  quotaUnit: "credits";
  remaining: number | null;
  total: number | null;
  detail: string | null;
};

export type ProviderUsageFact = {
  label: string;
  value: string;
  detail: string | null;
  tone?: ProviderTone;
};

export type ProviderSetting = {
  id: ProviderId;
  brandId: ProviderBrandId;
  label: string;
  displayEnabled: boolean;
  /** @deprecated Storage migration input only. New runtime code must use displayEnabled. */
  enabled?: boolean;
  status: PermissionStatus;
  credentialStatus: CredentialStatus;
  sourceKind: ProviderSourceKind;
  connectionMode: SourceConnectionMode;
  sourcePreference: ProviderSourcePreference;
  pageBinding: ProviderPageBinding;
  hostsLabel: string;
  hostOrigins: string[];
  description: string;
};

export type ToolbarIconMode =
  | "default"
  | "match-badge"
  | "provider"
  | "custom";

export type ProviderSyncOutcome = {
  snapshot: ProviderSnapshot;
  setting?: ProviderSetting;
};

export type AppSettings = {
  syncIntervalMinutes: number;
  warningThresholdPercent: number;
  locale: AppLocalePreference;
  userLevel: SettingsUserLevel;
  themeMode: ThemeMode;
  themePreset: ThemePreset;
  themeCustomSeedHex: string | null;
  uiFontFamily: UiFontFamily;
  motionMode: MotionMode;
  popupProgressStyle: ProgressDisplayStyle;
  sidebarProgressStyle: ProgressDisplayStyle;
  fullPageProgressStyle: ProgressDisplayStyle;
  popupSizePreset: PopupSizePreset;
  popupCornerStyle: PopupCornerStyle;
  popupShadowStyle: PopupShadowStyle;
  popupCircularProgressItemsPerRow: PopupCircularProgressItemsPerRow;
  actionBadgeSelectionMode: ActionBadgeSelectionMode;
  actionBadgeSelection: ActionBadgeSelection;
  actionBadgeSelections: ActionBadgeSelections;
  actionBadgeRotationIntervalSeconds: number;
  toolbarIconMode: ToolbarIconMode;
  toolbarIconProviderId: ProviderId | null;
  toolbarIconCustomImageDataUrl: string | null;
  providerOrderBySurface: ProviderOrderBySurface;
  progressItemsBySurface: ProgressItemsBySurface;
  progressThicknessPx: number;
  progressColorBands: ProgressColorBand[];
  progressColorAppearance: ProgressColorAppearance;
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
  "cursor-team-api": {
    adminApiKey: string | null;
  };
  "claude-code-admin-api": {
    adminApiKey: string | null;
  };
  "codex-enterprise-api": {
    analyticsApiKey: string | null;
    workspaceId: string | null;
  };
};
