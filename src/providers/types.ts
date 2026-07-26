import type {
  DashboardSourceId,
  CustomSourceSetting,
  CustomSourceSyncState,
} from "../shared/custom-sources";

export type ProviderBrandId =
  | "cursor"
  | "jetbrains"
  | "claude-code"
  | "gemini"
  | "codex"
  | "sub2api";

export type ProviderId =
  | "cursor-personal-page"
  | "cursor-team-api"
  | "jetbrains-org-page"
  | "claude-code-team-page"
  | "claude-code-admin-api"
  | "gemini-policy"
  | "codex-personal-page"
  | "codex-enterprise-api"
  | "sub2api-api-key";

export type ProviderAccountId = string;

export type LegacyProviderId = Exclude<ProviderBrandId, "sub2api">;

export type ApiKeyProviderId =
  | "cursor-team-api"
  | "claude-code-admin-api"
  | "codex-enterprise-api";

export type CredentialProviderId = ApiKeyProviderId | "sub2api-api-key";

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
  | "shipped_api_gateway_metering"
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

export type ThemeMode = "system" | "light" | "dark" | "time";
export type ResetTimeDisplayMode =
  | "date"
  | "weekday"
  | "date_and_weekday";
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
export type ProviderOrderBySurface = Record<DisplaySurface, DashboardSourceId[]>;
export type ProviderProgressItemPreference = {
  id: string;
  visible: boolean;
};
export type ProgressItemsBySurface = Record<
  DisplaySurface,
  Partial<Record<DashboardSourceId, ProviderProgressItemPreference[]>>
>;
export type ProviderUsageHistoryModuleId =
  | "personal_usage_by_surface"
  | "turns_history";
export type ProviderUsageHistoryModulePreference = {
  id: ProviderUsageHistoryModuleId;
  visible: boolean;
};
export type UsageHistoryModulesBySurface = Record<
  DisplaySurface,
  Partial<Record<ProviderId, ProviderUsageHistoryModulePreference[]>>
>;
export type ApiGatewayMeteringModuleId =
  | "summary"
  | "trend"
  | "model_breakdown"
  | "limit_windows";
export type ApiGatewayMeteringModulePreference = {
  id: ApiGatewayMeteringModuleId;
  visible: boolean;
};
export type ApiGatewayMeteringDisplayPreferences = Record<
  DisplaySurface,
  ApiGatewayMeteringModulePreference[]
>;
export type ProviderServiceStatusVendorId = "openai" | "anthropic" | "cursor";
export type ProviderServiceStatusLevel =
  | "operational"
  | "degraded"
  | "outage"
  | "maintenance"
  | "unknown";
export type ProviderServiceStatusFailureReason =
  | "permission_missing"
  | "offline"
  | "timeout"
  | "rate_limited"
  | "http_error"
  | "invalid_response"
  | null;
export type ProviderServiceStatusComponent = {
  id: string;
  name: string;
  level: ProviderServiceStatusLevel;
  updatedAt: string | null;
};
export type ProviderServiceStatusIncident = {
  id: string;
  name: string;
  level: ProviderServiceStatusLevel;
  status: string;
  updatedAt: string | null;
  url: string;
};
export type ProviderServiceStatus = {
  vendorId: ProviderServiceStatusVendorId;
  brandId: ProviderBrandId;
  level: ProviderServiceStatusLevel;
  description: string | null;
  statusPageUrl: string;
  checkedAt: string;
  sourceUpdatedAt: string | null;
  retryAt: string | null;
  stale: boolean;
  failureReason: ProviderServiceStatusFailureReason;
  components: ProviderServiceStatusComponent[];
  incidents: ProviderServiceStatusIncident[];
};
export type ProviderServiceStatusVisibilityBySurface = Record<
  DisplaySurface,
  Partial<Record<ProviderBrandId, boolean>>
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
  usageHistory?: ProviderUsageHistory;
  cursorUsage?: CursorUsageBilling;
  apiGatewayMetering?: ApiGatewayMeteringSnapshot;
  tone: ProviderTone;
};

export type ApiGatewayMeteringScope = "api_key" | "account";
export type ApiGatewayBillingMode =
  | "wallet"
  | "quota"
  | "subscription"
  | "unrestricted";

export type ApiGatewayMoney = {
  amount: number;
  unit: string;
};

export type ApiGatewayUsageMetric = {
  requests: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  cacheCreationTokens: number | null;
  cacheReadTokens: number | null;
  totalTokens: number | null;
  referenceCost: ApiGatewayMoney | null;
  actualCost: ApiGatewayMoney | null;
};

export type ApiGatewayUsageSummary = {
  today: ApiGatewayUsageMetric | null;
  total: ApiGatewayUsageMetric | null;
  averageDurationMs: number | null;
  requestsPerMinute: number | null;
  tokensPerMinute: number | null;
};

export type ApiGatewayAllowance = {
  limit: ApiGatewayMoney | null;
  used: ApiGatewayMoney | null;
  remaining: ApiGatewayMoney | null;
};

export type ApiGatewaySubscriptionAllowance = {
  dailyUsage: ApiGatewayMoney | null;
  weeklyUsage: ApiGatewayMoney | null;
  monthlyUsage: ApiGatewayMoney | null;
  dailyLimit: ApiGatewayMoney | null;
  weeklyLimit: ApiGatewayMoney | null;
  monthlyLimit: ApiGatewayMoney | null;
  expiresAt: string | null;
};

export type ApiGatewayRateLimitWindow = ApiGatewayAllowance & {
  id: string;
  windowStart: string | null;
  resetAt: string | null;
};

export type ApiGatewayDailyUsage = {
  date: string;
  totals: ApiGatewayUsageMetric;
};

export type ApiGatewayModelUsage = {
  id: string;
  label: string;
  totals: ApiGatewayUsageMetric;
};

export type ApiGatewayMeteringSnapshot = {
  schemaVersion: 1;
  accountId: ProviderAccountId;
  productKind: "metered_api_gateway";
  displayLabel: string;
  origin: string;
  transport: "http" | "https";
  scope: ApiGatewayMeteringScope;
  billingMode: ApiGatewayBillingMode | null;
  capturedAt: string;
  stale: boolean;
  isValid: boolean | null;
  status: string | null;
  planName: string | null;
  remaining: ApiGatewayMoney | null;
  balance: ApiGatewayMoney | null;
  quota: ApiGatewayAllowance | null;
  subscription: ApiGatewaySubscriptionAllowance | null;
  rateLimits: ApiGatewayRateLimitWindow[];
  usage: ApiGatewayUsageSummary | null;
  dailyUsage: ApiGatewayDailyUsage[];
  modelUsage: ApiGatewayModelUsage[];
  modelSeriesTruncated: boolean;
};

export type CursorUsageMetric = {
  requests: number;
  inputTokens: number | null;
  outputTokens: number | null;
  cacheReadTokens: number | null;
  apiValueCents: number | null;
  chargedCents: number | null;
};

export type CursorUsageBreakdown = CursorUsageMetric & {
  id: string;
  label: string;
};

export type CursorUsageDailyAggregate = {
  date: string;
  totals: CursorUsageMetric;
  byModel: CursorUsageBreakdown[];
  byKind: CursorUsageBreakdown[];
};

export type CursorUsageAggregateHistory = {
  rangeStart: string;
  rangeEnd: string;
  granularity: "day";
  sourceEventCount: number;
  capturedEventCount: number;
  complete: boolean;
  days: CursorUsageDailyAggregate[];
};

export type CursorUsagePool = {
  enabled: boolean;
  usedCents: number | null;
  limitCents: number | null;
  remainingCents: number | null;
};

export type CursorPlanUsagePool = CursorUsagePool & {
  includedUsageCents: number | null;
  bonusUsageCents: number | null;
  totalUsageCents: number | null;
  autoPercentUsed: number | null;
  apiPercentUsed: number | null;
  totalPercentUsed: number | null;
};

export type CursorUsageBilling = {
  capturedAt: string;
  billingCapturedAt: string | null;
  historyCapturedAt: string | null;
  billingCycleStart: string | null;
  billingCycleEnd: string | null;
  membershipType: string | null;
  limitType: string | null;
  isUnlimited: boolean | null;
  currency: "USD";
  planName: string | null;
  planIncludedAmountCents: number | null;
  planPriceLabel: string | null;
  planOwner: string | null;
  plan: CursorPlanUsagePool | null;
  onDemand: CursorUsagePool | null;
  noUsageBasedAllowed: boolean | null;
  history: CursorUsageAggregateHistory | null;
};

export type ProviderUsageHistoryValue = {
  id: string;
  label: string;
  value: number;
};

export type ProviderUsageHistoryPoint = {
  date: string;
  values: ProviderUsageHistoryValue[];
};

export type ProviderUsageHistory = {
  capturedAt: string;
  rangeStart: string;
  rangeEnd: string;
  granularity: "day";
  personalUsageBySurface: {
    unit: "percent";
    points: ProviderUsageHistoryPoint[];
  } | null;
  turns: {
    total: number | null;
    byModel: ProviderUsageHistoryPoint[];
    bySurface: ProviderUsageHistoryPoint[];
  } | null;
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
  resetTimeDisplayMode: ResetTimeDisplayMode;
  quotaPaceForecastEnabled: boolean;
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
  usageHistoryModulesBySurface: UsageHistoryModulesBySurface;
  providerServiceStatusVisibilityBySurface: ProviderServiceStatusVisibilityBySurface;
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
  providerAccounts?: ProviderAccountsByProvider;
  providerServiceStatuses?: ProviderServiceStatus[];
  customSources?: CustomSourceSetting[];
  customSourceStates?: CustomSourceSyncState[];
};

export type ProviderAccountMetadata = {
  id: ProviderAccountId;
  label: string;
  createdAt: string | null;
  lastSuccessAt: string | null;
  apiGatewayConnection?: ApiGatewayConnectionMetadata;
  apiGatewayMeteringDisplayPreferences?: ApiGatewayMeteringDisplayPreferences;
};

export type ApiGatewayConnectionMetadata = {
  schemaVersion: 1;
  displayLabel: string;
  baseUrl: string;
  insecureTransportAcknowledged: boolean;
};

export type ProviderInactiveAccountState = {
  snapshot: ProviderSnapshot;
  setting: ProviderSetting;
};

export type ProviderAccountCollection = {
  activeAccountId: ProviderAccountId;
  accounts: ProviderAccountMetadata[];
  /** Active data stays in AppState.providers/providerSettings to avoid duplication. */
  inactiveAccounts: Record<ProviderAccountId, ProviderInactiveAccountState>;
};

export type ProviderAccountsByProvider = Partial<
  Record<ProviderId, ProviderAccountCollection>
>;

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
  "sub2api-api-key": {
    apiKey: string | null;
  };
};
