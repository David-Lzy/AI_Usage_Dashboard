import type {
  AppState,
  ProviderId,
  ProviderSecrets,
  ProviderSourceBlueprint,
} from "../providers/types";
import {
  DEFAULT_FULL_PAGE_PROGRESS_STYLE,
  DEFAULT_POPUP_PROGRESS_STYLE,
  DEFAULT_SIDEBAR_PROGRESS_STYLE,
} from "./progress-display";
import {
  DEFAULT_POPUP_CIRCULAR_PROGRESS_ITEMS_PER_ROW,
  DEFAULT_POPUP_CORNER_STYLE,
  DEFAULT_POPUP_SHADOW_STYLE,
  DEFAULT_POPUP_SIZE_PRESET,
} from "./popup-appearance";
import {
  DEFAULT_ACTION_BADGE_ROTATION_INTERVAL_SECONDS,
  DEFAULT_SYNC_INTERVAL_MINUTES,
  DEFAULT_WARNING_THRESHOLD_PERCENT,
} from "./settings-preferences";
import {
  DEFAULT_PROGRESS_THICKNESS_PX,
  createDefaultProgressColorBands,
} from "./progress-appearance";
import { DEFAULT_SETTINGS_USER_LEVEL } from "./settings-user-level";
import { DEFAULT_UI_FONT_FAMILY } from "./ui-font-family";
import { DEFAULT_ACTION_BADGE_SELECTION } from "./action-badge-preferences";
import {
  DEFAULT_TOOLBAR_ICON_CUSTOM_IMAGE_DATA_URL,
  DEFAULT_TOOLBAR_ICON_MODE,
  DEFAULT_TOOLBAR_ICON_PROVIDER_ID,
} from "./toolbar-icon-preferences";
import {
  createDefaultProgressItemsBySurface,
  createDefaultProviderOrderBySurface,
} from "./display-preferences";
import {
  createPolicyOnlyDiagnostic,
  createSourceFallbackDiagnostic,
  createSourceSelectionDiagnostic,
  createUsageThresholdDiagnostic,
} from "../providers/diagnostics";
import { createEmptyPageBinding } from "./page-bindings";

export const APP_STATE_STORAGE_KEY = "ai-usage-dashboard.app-state";
export const PROVIDER_SECRETS_STORAGE_KEY = "ai-usage-dashboard.provider-secrets";

export const PROVIDER_SOURCE_BLUEPRINTS: Record<
  ProviderId,
  ProviderSourceBlueprint
> = {
  cursor: {
    preferredSourceKind: "official_api",
    fallbackOrder: ["official_api", "session_page"],
    credentialPersistence: "extension_local_only",
    cookiePersistence: "forbidden",
    manualCookieImport: "forbidden",
    sources: [
      {
        kind: "official_api",
        rolloutStage: "shipped",
        connectionMode: "credential",
        contractKind: "shipped_admin_analytics",
        priority: 1,
        label: "Cursor Team Admin API",
        routeHints: ["https://api.cursor.com/*"],
        usedAvailability: "exact",
        remainingAvailability: "window_only",
        resetAvailability: "exact",
        contractDetail:
          "Current shipped contract for Cursor team-admin accounts. This live admin API path is separate from the personal dashboard contract.",
        graduationGateLabel: null,
        graduationGateDetail: null,
        note: "Current release path for team-admin accounts.",
      },
      {
        kind: "session_page",
        rolloutStage: "shipped",
        connectionMode: "page_session",
        contractKind: "shipped_personal_partial",
        priority: 2,
        label: "Cursor personal dashboard usage page",
        routeHints: [
          "https://cursor.com/cn/dashboard/usage*",
          "https://cursor.com/dashboard/usage*",
          "https://cursor.com/*/dashboard/usage*",
        ],
        usedAvailability: "window_only",
        remainingAvailability: "unavailable",
        resetAvailability: "window_only",
        contractDetail:
          "Current shipped contract for Cursor personal users. The page exposes billing-period usage context and reset timing, but not an exact remaining included-request counter.",
        graduationGateLabel: null,
        graduationGateDetail: null,
        note:
          "Shipped personal-user path. The 2026-04-21 live page and view-source spike showed a Next flight-backed usage page that exposes current billing-period usage and spend controls, but no exact remaining included-request counter.",
      },
    ],
  },
  jetbrains: {
    preferredSourceKind: "session_page",
    fallbackOrder: ["session_page"],
    credentialPersistence: "not_applicable",
    cookiePersistence: "forbidden",
    manualCookieImport: "forbidden",
    sources: [
      {
        kind: "session_page",
        rolloutStage: "deferred",
        connectionMode: "page_session",
        contractKind: "deferred_org_console",
        priority: 1,
        label: "JetBrains Central Console usage page",
        routeHints: [
          "https://account.jetbrains.com/organization/ai/users-and-licensing",
          "https://account.jetbrains.com/*",
          "https://*.jetbrains.com/*",
        ],
        usedAvailability: "exact",
        remainingAvailability: "exact",
        resetAvailability: "window_only",
        contractDetail:
          "Deferred org-console contract. The repo retains this authenticated Console path, but the active RC does not currently promise JetBrains support.",
        graduationGateLabel: "Reverify org-visible Console session",
        graduationGateDetail:
          "Graduate this path only after a real JetBrains Users and licensing session is reverified in the active Chrome profile.",
        note:
          "Deferred from the active RC after the 2026-04-23 gate review. The repo still retains the authenticated Console path, but the current RC no longer promises JetBrains until a real org-visible Users and licensing session is reverified.",
      },
    ],
  },
  "claude-code": {
    preferredSourceKind: "official_api",
    fallbackOrder: ["official_api", "session_page"],
    credentialPersistence: "extension_local_only",
    cookiePersistence: "forbidden",
    manualCookieImport: "forbidden",
    sources: [
      {
        kind: "official_api",
        rolloutStage: "shipped",
        connectionMode: "credential",
        contractKind: "shipped_admin_analytics",
        priority: 1,
        label: "Claude Code Analytics Admin API",
        routeHints: ["https://api.anthropic.com/*", "https://platform.claude.com/*"],
        usedAvailability: "analytics_only",
        remainingAvailability: "unavailable",
        resetAvailability: "window_only",
        contractDetail:
          "Current shipped contract for Claude Code organization analytics. This admin analytics path is live, but it does not expose an exact remaining included quota.",
        graduationGateLabel: null,
        graduationGateDetail: null,
        note:
          "Current release path for organization analytics. Exact remaining included quota is not exposed.",
      },
      {
        kind: "session_page",
        rolloutStage: "shipped",
        connectionMode: "page_session",
        contractKind: "shipped_personal_partial",
        priority: 2,
        label: "Claude Team usage page",
        routeHints: ["https://claude.ai/settings/usage*"],
        usedAvailability: "window_only",
        remainingAvailability: "exact",
        resetAvailability: "window_only",
        contractDetail:
          "Current shipped Team-session contract. The logged-in Claude settings usage page can expose visible usage-window context, but the extension only reports fields that are visible in the page session.",
        graduationGateLabel: null,
        graduationGateDetail: null,
        note:
          "Graduated after a real Claude Team account became available. Upgrade-only or logged-out redirects still remain explicit page-session warning states.",
      },
    ],
  },
  gemini: {
    preferredSourceKind: "policy_only",
    fallbackOrder: ["policy_only", "session_page"],
    credentialPersistence: "not_applicable",
    cookiePersistence: "forbidden",
    manualCookieImport: "forbidden",
    sources: [
      {
        kind: "policy_only",
        rolloutStage: "shipped",
        connectionMode: "none",
        contractKind: "shipped_policy_only",
        priority: 1,
        label: "Documented Gemini quota policy",
        routeHints: [],
        usedAvailability: "unavailable",
        remainingAvailability: "documented_policy",
        resetAvailability: "documented_policy",
        contractDetail:
          "Current shipped contract for Gemini Code Assist. The product intentionally shows documented quota policy instead of claiming a live personal sync path.",
        graduationGateLabel: null,
        graduationGateDetail: null,
        note:
          "Current shipped behavior. No stable official per-user live usage source is selected in v1.",
      },
      {
        kind: "session_page",
        rolloutStage: "deferred",
        connectionMode: "page_session",
        contractKind: "deferred_project_metrics",
        priority: 2,
        label: "Google Cloud Gemini metrics page",
        routeHints: [
          "https://console.cloud.google.com/gemini-code-assist/metrics",
        ],
        usedAvailability: "analytics_only",
        remainingAvailability: "unavailable",
        resetAvailability: "window_only",
        contractDetail:
          "Deferred project-metrics contract. The observed Google Cloud route is project-scoped rather than a simple personal quota page.",
        graduationGateLabel: "Accept project-metrics support",
        graduationGateDetail:
          "Graduate this path only if the product explicitly accepts bound-tab project metrics as a supported contract.",
        note:
          "Deferred after the 2026-04-22 project-metrics spike. The live Chrome session confirmed a project-scoped `metrics?project=...` route with Google Cloud console `dynamicFrame` and `pangolin/iframe` markers, which is materially different from a simple personal usage page. Revisit only if the product explicitly adds bound-tab project metrics support.",
      },
    ],
  },
  codex: {
    preferredSourceKind: "official_api",
    fallbackOrder: ["official_api", "session_page"],
    credentialPersistence: "extension_local_only",
    cookiePersistence: "forbidden",
    manualCookieImport: "forbidden",
    sources: [
      {
        kind: "official_api",
        rolloutStage: "shipped",
        connectionMode: "credential",
        contractKind: "shipped_enterprise_analytics",
        priority: 1,
        label: "Codex Enterprise analytics API",
        routeHints: ["https://api.chatgpt.com/*"],
        usedAvailability: "analytics_only",
        remainingAvailability: "unavailable",
        resetAvailability: "window_only",
        contractDetail:
          "Current shipped contract for Codex Enterprise workspaces. This live analytics path is separate from the personal session-page contract and does not expose one absolute remaining credit balance.",
        graduationGateLabel: null,
        graduationGateDetail: null,
        note:
          "Current release path for Enterprise workspaces. Exact remaining workspace credits are not exposed.",
      },
      {
        kind: "session_page",
        rolloutStage: "shipped",
        connectionMode: "page_session",
        contractKind: "shipped_personal_partial",
        priority: 2,
        label: "Codex personal usage pages",
        routeHints: [
          "https://chatgpt.com/codex/cloud/settings/analytics*",
          "https://chatgpt.com/codex/settings/usage*",
          "https://chatgpt.com/codex/cloud/settings/usage*",
        ],
        usedAvailability: "window_only",
        remainingAvailability: "exact",
        resetAvailability: "exact",
        contractDetail:
          "Current shipped contract for Codex personal users. The page exposes real usage-window percentages and reset timing, but not one absolute remaining balance across all visible windows.",
        graduationGateLabel: null,
        graduationGateDetail: null,
        note:
          "Shipped personal-user path. The 2026-04-21 live-tab capture matched chatgpt.com/codex/cloud/settings/analytics#usage and exposed exact remaining percentages plus reset times in DOM. The extension attaches to the already-running logged-in ChatGPT tab and does not export cookies.",
      },
    ],
  },
};

export const SAMPLE_PROVIDER_SECRETS: ProviderSecrets = {
  cursor: {
    adminApiKey: null,
  },
  "claude-code": {
    adminApiKey: null,
  },
  codex: {
    analyticsApiKey: null,
    workspaceId: null,
  },
};

export const SAMPLE_APP_STATE: AppState = {
  providers: [
    {
      providerId: "cursor",
      providerLabel: "Cursor",
      planName: "Cursor Personal Dashboard",
      quotaUnit: "requests",
      quotaWindow: "monthly",
      used: null,
      remaining: null,
      total: null,
      resetAt: "Mar 23 - Apr 21",
      resetLabel: "Your usage per day across this billing period",
      syncedAt: "2026-04-20 10:42",
      syncSource: "page_parse",
      syncStatus: "ok",
      warningReason: "On-demand usage is off.",
      warningDiagnostic: createUsageThresholdDiagnostic({
        providerId: "cursor",
        usageThresholdKind: "on_demand_off",
        rawMessage: "On-demand usage is off.",
        unitLabel: "requests",
      }),
      lastSyncLabel: "Synced 2m ago",
      sourceSelectionReason: "Auto selected Session page.",
      sourceSelectionDiagnostic: createSourceSelectionDiagnostic({
        providerId: "cursor",
        sourcePreference: "auto",
        selectedKind: "session_page",
        hadFallback: true,
        rawMessage: "Auto selected Session page.",
      }),
      sourceFallbackReason: "Official API unavailable: no Cursor Admin API key is stored.",
      sourceFallbackDiagnostic: createSourceFallbackDiagnostic({
        providerId: "cursor",
        sourcePreference: "auto",
        failure: {
          kind: "official_api",
          code: "credential_missing",
          detail: "no Cursor Admin API key is stored",
        },
        rawMessage: "Official API unavailable: no Cursor Admin API key is stored.",
      }),
      usageFacts: [
        {
          label: "Billing period",
          value: "Mar 23 - Apr 21",
          detail: "Your usage per day across this billing period",
        },
        {
          label: "Total spend",
          value: "$0",
          detail: "Current selected period",
        },
        {
          label: "Included",
          value: "$0",
          detail: "Plan-included spend shown by Cursor",
        },
        {
          label: "On-demand",
          value: "$0",
          detail: "Usage-based spend shown by Cursor",
        },
      ],
      tone: "neutral",
    },
    {
      providerId: "jetbrains",
      providerLabel: "JetBrains AI",
      planName: "AI Pro",
      quotaUnit: "credits",
      quotaWindow: "monthly",
      used: 16,
      remaining: 4,
      total: 20,
      resetAt: "2026-04-26 09:00",
      resetLabel: "Resets in 6 days",
      syncedAt: "2026-04-20 10:40",
      syncSource: "page_parse",
      syncStatus: "warning",
      warningReason: "80% of included credits consumed",
      warningDiagnostic: createUsageThresholdDiagnostic({
        providerId: "jetbrains",
        usageThresholdKind: "threshold_warning",
        rawMessage: "80% of included credits consumed",
        usagePercent: 80,
        thresholdPercent: 80,
        unitLabel: "credits",
      }),
      lastSyncLabel: "Synced 4m ago",
      sourceSelectionReason:
        "JetBrains session-page sync is retained in the repo, but deferred from the active RC surface until a real org-visible Console session is reverified.",
      sourceFallbackReason: null,
      tone: "warning",
    },
    {
      providerId: "claude-code",
      providerLabel: "Claude Code",
      planName: "Analytics Admin API",
      quotaUnit: "sessions",
      quotaWindow: "daily",
      used: 5,
      remaining: null,
      total: null,
      resetAt: "2026-04-21 00:00 UTC",
      resetLabel: "Daily analytics snapshot; exact remaining quota unavailable",
      syncedAt: "2026-04-20 10:08",
      syncSource: "official",
      syncStatus: "warning",
      warningReason:
        "Analytics source does not expose exact remaining Claude Code quota",
      lastSyncLabel: "Analytics snapshot 34m ago",
      sourceSelectionReason:
        "Official API is the only shipped live source for Claude Code.",
      sourceFallbackReason: null,
      tone: "warning",
    },
    {
      providerId: "gemini",
      providerLabel: "Gemini Code Assist",
      planName: "Gemini Code Assist Enterprise (documented policy)",
      quotaUnit: "requests",
      quotaWindow: "daily",
      used: null,
      remaining: null,
      total: 2000,
      resetAt: "Daily per-user quota window",
      resetLabel:
        "Documented quota only; check Google Cloud Quotas for live project usage",
      syncedAt: "2026-04-20 10:12",
      syncSource: "official",
      syncStatus: "warning",
      warningReason:
        "120/min and 2000/day per user for Gemini CLI and agent mode. No stable official per-user live usage source is documented.",
      warningDiagnostic: createPolicyOnlyDiagnostic({
        providerId: "gemini",
        policyOnlyKind: "documented_limit_only",
        rawMessage:
          "120/min and 2000/day per user for Gemini CLI and agent mode. No stable official per-user live usage source is documented.",
      }),
      lastSyncLabel: "Documented quota snapshot 30m ago",
      sourceSelectionReason:
        "Policy only is the only shipped source for Gemini Code Assist.",
      sourceFallbackReason: null,
      tone: "warning",
    },
    {
      providerId: "codex",
      providerLabel: "Codex",
      planName: "Codex Analytics API (Enterprise workspace)",
      quotaUnit: "credits",
      quotaWindow: "daily",
      used: null,
      remaining: null,
      total: null,
      resetAt: "Previous UTC day analytics window",
      resetLabel:
        "Daily analytics snapshot; remaining workspace credits are checked in Settings > Billing",
      syncedAt: "2026-04-20 10:18",
      syncSource: "official",
      syncStatus: "warning",
      warningReason:
        "Enterprise analytics API selected. Exact remaining workspace credits are not exposed by the analytics endpoint.",
      lastSyncLabel: "Analytics snapshot 24m ago",
      sourceSelectionReason: "Auto selected Official API.",
      sourceSelectionDiagnostic: createSourceSelectionDiagnostic({
        providerId: "codex",
        sourcePreference: "auto",
        selectedKind: "official_api",
        hadFallback: false,
        rawMessage: "Auto selected Official API.",
      }),
      sourceFallbackReason: null,
      tone: "warning",
    },
  ],
  providerSettings: [
    {
      id: "cursor",
      label: "Cursor",
      enabled: true,
      status: "granted",
      credentialStatus: "missing",
      sourcePreference: "auto",
      pageBinding: createEmptyPageBinding(),
      hostsLabel: "api.cursor.com · cursor.com",
      hostOrigins: ["https://api.cursor.com/*", "https://cursor.com/*"],
      description:
        "Uses the team Admin API when a key is configured, or the logged-in personal usage page when no key is stored.",
    },
    {
      id: "jetbrains",
      label: "JetBrains AI",
      enabled: false,
      status: "missing",
      credentialStatus: "not_required",
      sourcePreference: "auto",
      pageBinding: createEmptyPageBinding(),
      hostsLabel: "account.jetbrains.com · jetbrains.com",
      hostOrigins: [
        "https://account.jetbrains.com/*",
        "https://*.jetbrains.com/*",
      ],
      description:
        "Retained repo path for JetBrains organization AI Credits usage pages. Deferred from the active RC until a real org-visible Users and licensing session is reverified.",
    },
    {
      id: "claude-code",
      label: "Claude Code",
      enabled: true,
      status: "granted",
      credentialStatus: "missing",
      sourcePreference: "auto",
      pageBinding: createEmptyPageBinding(),
      hostsLabel: "api.anthropic.com · platform.claude.com · claude.ai",
      hostOrigins: [
        "https://api.anthropic.com/*",
        "https://platform.claude.com/*",
        "https://claude.ai/*",
      ],
      description:
        "Uses the Claude Code Analytics Admin API when a key is configured, or the logged-in Claude Team usage page when no key is stored.",
    },
    {
      id: "gemini",
      label: "Gemini Code Assist",
      enabled: true,
      status: "granted",
      credentialStatus: "not_required",
      sourcePreference: "auto",
      pageBinding: createEmptyPageBinding(),
      hostsLabel: "No host access required",
      hostOrigins: [],
      description:
        "Uses documented Gemini quota policy only; no stable live per-user usage source is selected in v1.",
    },
    {
      id: "codex",
      label: "Codex",
      enabled: true,
      status: "granted",
      credentialStatus: "missing",
      sourcePreference: "auto",
      pageBinding: createEmptyPageBinding(),
      hostsLabel: "api.chatgpt.com + chatgpt.com",
      hostOrigins: ["https://api.chatgpt.com/*", "https://chatgpt.com/*"],
      description:
        "Targets the Codex Enterprise analytics API today and the logged-in ChatGPT Codex usage pages for the personal-user research track.",
    },
  ],
  settings: {
    syncIntervalMinutes: DEFAULT_SYNC_INTERVAL_MINUTES,
    warningThresholdPercent: DEFAULT_WARNING_THRESHOLD_PERCENT,
    locale: "system",
    userLevel: DEFAULT_SETTINGS_USER_LEVEL,
    themeMode: "system",
    themePreset: "default",
    themeCustomSeedHex: null,
    uiFontFamily: DEFAULT_UI_FONT_FAMILY,
    popupProgressStyle: DEFAULT_POPUP_PROGRESS_STYLE,
    sidebarProgressStyle: DEFAULT_SIDEBAR_PROGRESS_STYLE,
    fullPageProgressStyle: DEFAULT_FULL_PAGE_PROGRESS_STYLE,
    popupSizePreset: DEFAULT_POPUP_SIZE_PRESET,
    popupCornerStyle: DEFAULT_POPUP_CORNER_STYLE,
    popupShadowStyle: DEFAULT_POPUP_SHADOW_STYLE,
    popupCircularProgressItemsPerRow:
      DEFAULT_POPUP_CIRCULAR_PROGRESS_ITEMS_PER_ROW,
    actionBadgeSelection: DEFAULT_ACTION_BADGE_SELECTION,
    actionBadgeSelections: [DEFAULT_ACTION_BADGE_SELECTION],
    actionBadgeRotationIntervalSeconds:
      DEFAULT_ACTION_BADGE_ROTATION_INTERVAL_SECONDS,
    toolbarIconMode: DEFAULT_TOOLBAR_ICON_MODE,
    toolbarIconProviderId: DEFAULT_TOOLBAR_ICON_PROVIDER_ID,
    toolbarIconCustomImageDataUrl: DEFAULT_TOOLBAR_ICON_CUSTOM_IMAGE_DATA_URL,
    providerOrderBySurface: createDefaultProviderOrderBySurface(),
    progressItemsBySurface: createDefaultProgressItemsBySurface(),
    progressThicknessPx: DEFAULT_PROGRESS_THICKNESS_PX,
    progressColorBands: createDefaultProgressColorBands(),
  },
};
