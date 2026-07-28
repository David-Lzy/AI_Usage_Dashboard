// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 David-Lzy (https://github.com/David-Lzy). All rights reserved.
// Source: https://github.com/David-Lzy/AI_Usage_Dashboard

import type {
  AppState,
  ProviderId,
  ProviderSecrets,
  ProviderSetting,
  ProviderSnapshot,
  ProviderSourceBlueprint,
} from "../providers/types";
import { getProviderDefinition } from "../providers/provider-definitions";
import {
  DEFAULT_FULL_PAGE_PROGRESS_STYLE,
  DEFAULT_POPUP_PROGRESS_STYLE,
  DEFAULT_SIDEBAR_PROGRESS_STYLE,
} from "./progress-display";
import {
  DEFAULT_POPUP_CIRCULAR_PROGRESS_ITEMS_PER_ROW,
  DEFAULT_POPUP_CORNER_STYLE,
  DEFAULT_POPUP_PROVIDER_BROWSING_MODE,
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
  createDefaultProgressColorAppearance,
  createDefaultProgressColorBands,
} from "./progress-appearance";
import { DEFAULT_SETTINGS_USER_LEVEL } from "./settings-user-level";
import { DEFAULT_UI_FONT_FAMILY } from "./ui-font-family";
import { DEFAULT_MOTION_MODE } from "./motion-preferences";
import { DEFAULT_RESET_TIME_DISPLAY_MODE } from "./reset-time-display";
import { DEFAULT_QUOTA_PACE_FORECAST_ENABLED } from "./quota-pace";
import {
  DEFAULT_ACTION_BADGE_SELECTION,
  DEFAULT_ACTION_BADGE_SELECTION_MODE,
} from "./action-badge-preferences";
import {
  DEFAULT_TOOLBAR_ICON_CUSTOM_IMAGE_DATA_URL,
  DEFAULT_TOOLBAR_ICON_MODE,
  DEFAULT_TOOLBAR_ICON_PROVIDER_ID,
} from "./toolbar-icon-preferences";
import {
  createDefaultProgressItemsBySurface,
  createDefaultProviderOrderBySurface,
} from "./display-preferences";
import { createDefaultUsageHistoryModulesBySurface } from "./usage-history-visibility";
import { createDefaultProviderServiceStatusVisibilityBySurface } from "./provider-service-status";
import {
  createCredentialDiagnostic,
  createPageSessionDiagnostic,
  createPolicyOnlyDiagnostic,
  createSourceSelectionDiagnostic,
  createUsageThresholdDiagnostic,
} from "../providers/diagnostics";
import { createEmptyPageBinding } from "./page-bindings";
import { normalizePopupProviderAccountPresentationByProvider } from "./provider-account-presentation";

export const APP_STATE_STORAGE_KEY = "ai-usage-dashboard.app-state";
export const PROVIDER_SECRETS_STORAGE_KEY = "ai-usage-dashboard.provider-secrets";
export const LOCAL_COMPANION_SECRETS_STORAGE_KEY =
  "ai-usage-dashboard.local-companion-secrets";
export const CODEXBAR_DASHBOARD_CONNECTION_STORAGE_KEY =
  "ai-usage-dashboard.codexbar-dashboard-connection";

export const PROVIDER_SOURCE_BLUEPRINTS: Record<ProviderId, ProviderSourceBlueprint> = {
  "cursor-personal-page": {
    preferredSourceKind: "session_page",
    fallbackOrder: ["session_page"],
    credentialPersistence: "extension_local_only",
    cookiePersistence: "forbidden",
    manualCookieImport: "forbidden",
    sources: [
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
  "cursor-team-api": {
    preferredSourceKind: "official_api",
    fallbackOrder: ["official_api"],
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
    ],
  },
  "jetbrains-org-page": {
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
  "claude-code-team-page": {
    preferredSourceKind: "session_page",
    fallbackOrder: ["session_page"],
    credentialPersistence: "extension_local_only",
    cookiePersistence: "forbidden",
    manualCookieImport: "forbidden",
    sources: [
      {
        kind: "session_page",
        rolloutStage: "shipped",
        connectionMode: "page_session",
        contractKind: "shipped_personal_partial",
        priority: 2,
        label: "Claude personal usage page",
        routeHints: [
          "https://claude.ai/new#settings/usage",
          "https://claude.ai/settings/usage*",
        ],
        usedAvailability: "window_only",
        remainingAvailability: "exact",
        resetAvailability: "window_only",
        contractDetail:
          "Current shipped personal-session contract. The logged-in Claude settings usage surface can expose shared plan usage-window context, but the extension only reports fields verified in the current page session.",
        graduationGateLabel: null,
        graduationGateDetail: null,
        note:
          "Verified with an individual paid account. Upgrade-only or logged-out redirects still remain explicit page-session warning states.",
      },
    ],
  },
  "claude-code-admin-api": {
    preferredSourceKind: "official_api",
    fallbackOrder: ["official_api"],
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
    ],
  },
  "gemini-policy": {
    preferredSourceKind: "policy_only",
    fallbackOrder: ["policy_only"],
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
    ],
  },
  "codex-personal-page": {
    preferredSourceKind: "session_page",
    fallbackOrder: ["session_page"],
    credentialPersistence: "extension_local_only",
    cookiePersistence: "forbidden",
    manualCookieImport: "forbidden",
    sources: [
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
          "Shipped personal-user path. The 2026-07-13 live-tab refresh confirmed chatgpt.com/codex/cloud/settings/analytics#usage still exposes visible weekly and model quota percentages, reset timing when present, and optional credit balance context in DOM. The extension attaches to the already-running logged-in ChatGPT tab and does not export cookies.",
      },
    ],
  },
  "codex-enterprise-api": {
    preferredSourceKind: "official_api",
    fallbackOrder: ["official_api"],
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
    ],
  },
  "sub2api-api-key": {
    preferredSourceKind: "official_api",
    fallbackOrder: ["official_api"],
    credentialPersistence: "extension_local_only",
    cookiePersistence: "forbidden",
    manualCookieImport: "forbidden",
    sources: [
      {
        kind: "official_api",
        rolloutStage: "shipped",
        connectionMode: "credential",
        contractKind: "shipped_api_gateway_metering",
        priority: 1,
        label: "Sub2API API-key usage endpoint",
        routeHints: ["<configured-origin>/v1/usage"],
        usedAvailability: "exact",
        remainingAvailability: "exact",
        resetAvailability: "window_only",
        contractDetail:
          "Account-scoped connector for a user-configured Sub2API deployment. The API-key usage endpoint reports key-level metering and may not represent deployment-wide account totals.",
        graduationGateLabel: null,
        graduationGateDetail: null,
        note:
          "The deployment origin and API key are configured locally. No dashboard page session is opened or inspected.",
      },
    ],
  },
};

export const SAMPLE_PROVIDER_SECRETS: ProviderSecrets = {
  "cursor-team-api": {
    adminApiKey: null,
  },
  "claude-code-admin-api": {
    adminApiKey: null,
  },
  "codex-enterprise-api": {
    analyticsApiKey: null,
    workspaceId: null,
  },
  "sub2api-api-key": {
    apiKey: null,
  },
};

function createProviderSetting(
  id: ProviderId,
  values: Omit<
    ProviderSetting,
    | "id"
    | "brandId"
    | "label"
    | "displayEnabled"
    | "sourceKind"
    | "connectionMode"
    | "sourcePreference"
  >,
): ProviderSetting {
  const definition = getProviderDefinition(id);
  return {
    id,
    brandId: definition.brandId,
    label: definition.label,
    displayEnabled: definition.defaultDisplayEnabled,
    sourceKind: definition.sourceKind,
    connectionMode: definition.connectionMode,
    sourcePreference: definition.fixedSourcePreference,
    ...values,
  };
}

export const SAMPLE_APP_STATE: AppState = {
  providers: [
    {
      providerId: "cursor-personal-page",
      providerLabel: "Cursor Personal",
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
        providerId: "cursor-personal-page",
        usageThresholdKind: "on_demand_off",
        rawMessage: "On-demand usage is off.",
        unitLabel: "requests",
      }),
      lastSyncLabel: "Synced 2m ago",
      sourceSelectionReason: "Session page selected.",
      sourceSelectionDiagnostic: createSourceSelectionDiagnostic({
        providerId: "cursor-personal-page",
        sourcePreference: "session_page",
        selectedKind: "session_page",
        hadFallback: false,
        rawMessage: "Session page selected.",
      }),
      sourceFallbackReason: null,
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
      providerId: "cursor-team-api",
      providerLabel: "Cursor Team API",
      planName: "Cursor Team Admin API",
      quotaUnit: "requests",
      quotaWindow: "monthly",
      used: null,
      remaining: null,
      total: null,
      resetAt: "Admin API key required",
      resetLabel: "Add a Cursor Admin API key to sync team analytics.",
      syncedAt: "2026-04-20 10:42",
      syncSource: "official",
      syncStatus: "warning",
      warningReason: "Cursor Admin API key is missing.",
      warningDiagnostic: createCredentialDiagnostic({
        providerId: "cursor-team-api",
        credentialKind: "admin_api_key",
        rawMessage: "Cursor Admin API key is missing.",
      }),
      lastSyncLabel: "Credentials needed",
      sourceSelectionReason: "Official API selected.",
      sourceSelectionDiagnostic: createSourceSelectionDiagnostic({
        providerId: "cursor-team-api",
        sourcePreference: "official_api",
        selectedKind: "official_api",
        hadFallback: false,
        rawMessage: "Official API selected.",
      }),
      sourceFallbackReason: null,
      usageFacts: [
        {
          label: "Credential",
          value: "Missing",
          detail: "Store a Cursor Admin API key before team analytics can sync.",
          tone: "warning",
        },
      ],
      tone: "warning",
    },
    {
      providerId: "jetbrains-org-page",
      providerLabel: "JetBrains AI",
      planName: "Deferred organization source",
      quotaUnit: "credits",
      quotaWindow: "monthly",
      used: null,
      remaining: null,
      total: null,
      resetAt: "Unavailable while deferred",
      resetLabel: "No live quota is claimed by this deferred source",
      syncedAt: "2026-04-20 10:40",
      syncSource: "page_parse",
      syncStatus: "warning",
      warningReason:
        "JetBrains organization usage remains deferred until a real organization-visible Users and licensing session is reverified.",
      warningDiagnostic: null,
      lastSyncLabel: "JetBrains integration remains deferred",
      sourceSelectionReason:
        "JetBrains session-page parsing is retained for future verification, but no live source is active in this release.",
      sourceFallbackReason: null,
      tone: "warning",
    },
    {
      providerId: "claude-code-team-page",
      providerLabel: "Claude Personal",
      planName: "Claude personal usage page",
      quotaUnit: "percent",
      quotaWindow: "daily",
      used: null,
      remaining: null,
      total: null,
      resetAt: "Visible personal usage windows",
      resetLabel: "Open the logged-in Claude usage page to refresh visible windows.",
      syncedAt: "2026-04-20 10:08",
      syncSource: "page_parse",
      syncStatus: "warning",
      warningReason: "Claude personal usage page has not been attached in this profile.",
      warningDiagnostic: createPageSessionDiagnostic({
        providerId: "claude-code-team-page",
        pageSessionKind: "open_page_required",
        rawMessage: "Claude personal usage page has not been attached in this profile.",
      }),
      lastSyncLabel: "Usage page needed",
      sourceSelectionReason: "Session page selected.",
      sourceSelectionDiagnostic: createSourceSelectionDiagnostic({
        providerId: "claude-code-team-page",
        sourcePreference: "session_page",
        selectedKind: "session_page",
        hadFallback: false,
        rawMessage: "Session page selected.",
      }),
      sourceFallbackReason: null,
      tone: "warning",
    },
    {
      providerId: "claude-code-admin-api",
      providerLabel: "Claude Admin API",
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
      providerId: "gemini-policy",
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
        providerId: "gemini-policy",
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
      providerId: "codex-personal-page",
      providerLabel: "Codex Personal",
      planName: "Codex personal usage pages",
      quotaUnit: "percent",
      quotaWindow: "rolling",
      used: 25,
      remaining: 75,
      total: 100,
      resetAt: "2026-04-20 15:55",
      resetLabel: "5-hour usage window resets at 15:55",
      syncedAt: "2026-04-20 10:18",
      syncSource: "page_parse",
      syncStatus: "ok",
      warningReason: null,
      lastSyncLabel: "Usage page snapshot 24m ago",
      sourceSelectionReason: "Session page selected.",
      sourceSelectionDiagnostic: createSourceSelectionDiagnostic({
        providerId: "codex-personal-page",
        sourcePreference: "session_page",
        selectedKind: "session_page",
        hadFallback: false,
        rawMessage: "Session page selected.",
      }),
      sourceFallbackReason: null,
      usageWindows: [
        {
          label: "5-hour usage window",
          normalizedLabel: "5-hour usage window",
          kind: "rolling_5h",
          modelLabel: null,
          quotaUnit: "percent",
          used: 25,
          remaining: 75,
          total: 100,
          resetAt: "2026-04-20 15:55",
          resetLabel: "Resets at 15:55",
        },
        {
          label: "Weekly usage window",
          normalizedLabel: "Weekly usage window",
          kind: "weekly",
          modelLabel: null,
          quotaUnit: "percent",
          used: 59,
          remaining: 41,
          total: 100,
          resetAt: "2026-04-21 09:15",
          resetLabel: "Resets Apr 21 09:15",
        },
      ],
      tone: "neutral",
    },
    {
      providerId: "codex-enterprise-api",
      providerLabel: "Codex Enterprise API",
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
      sourceSelectionReason: "Official API selected.",
      sourceSelectionDiagnostic: createSourceSelectionDiagnostic({
        providerId: "codex-enterprise-api",
        sourcePreference: "official_api",
        selectedKind: "official_api",
        hadFallback: false,
        rawMessage: "Official API selected.",
      }),
      sourceFallbackReason: null,
      tone: "warning",
    },
    {
      providerId: "sub2api-api-key",
      providerLabel: "Sub2API",
      planName: "Sub2API API-key usage",
      quotaUnit: "credits",
      quotaWindow: "daily",
      used: null,
      remaining: null,
      total: null,
      resetAt: "Not configured",
      resetLabel: "Connect a deployment and API key in Settings",
      syncedAt: "Not synced",
      syncSource: "official",
      syncStatus: "warning",
      warningReason: "Sub2API deployment and API key are not configured.",
      warningDiagnostic: createCredentialDiagnostic({
        providerId: "sub2api-api-key",
        credentialKind: "admin_api_key",
        rawMessage: "Sub2API deployment and API key are not configured.",
      }),
      lastSyncLabel: "Not connected",
      sourceSelectionReason: "Official API selected.",
      sourceFallbackReason: null,
      tone: "warning",
    },
  ],
  providerSettings: [
    createProviderSetting("cursor-personal-page", {
      status: "granted",
      credentialStatus: "not_required",
      pageBinding: createEmptyPageBinding(),
      hostsLabel: "cursor.com",
      hostOrigins: ["https://cursor.com/*"],
      description:
        "Uses the logged-in Cursor personal usage page. Display is independent from browser access.",
    }),
    createProviderSetting("cursor-team-api", {
      status: "granted",
      credentialStatus: "missing",
      pageBinding: createEmptyPageBinding(),
      hostsLabel: "api.cursor.com",
      hostOrigins: ["https://api.cursor.com/*"],
      description:
        "Uses the Cursor team Admin API when an API key is configured.",
    }),
    createProviderSetting("jetbrains-org-page", {
      status: "missing",
      credentialStatus: "not_required",
      pageBinding: createEmptyPageBinding(),
      hostsLabel: "account.jetbrains.com · jetbrains.com",
      hostOrigins: [
        "https://account.jetbrains.com/*",
        "https://*.jetbrains.com/*",
      ],
      description:
        "Retained repo path for JetBrains organization AI Credits usage pages. Deferred from the active RC until a real org-visible Users and licensing session is reverified.",
    }),
    createProviderSetting("claude-code-team-page", {
      status: "granted",
      credentialStatus: "not_required",
      pageBinding: createEmptyPageBinding(),
      hostsLabel: "claude.ai",
      hostOrigins: ["https://claude.ai/*"],
      description:
        "Uses the logged-in Claude personal usage page. Display is independent from browser access.",
    }),
    createProviderSetting("claude-code-admin-api", {
      status: "granted",
      credentialStatus: "missing",
      pageBinding: createEmptyPageBinding(),
      hostsLabel: "api.anthropic.com · platform.claude.com",
      hostOrigins: ["https://api.anthropic.com/*", "https://platform.claude.com/*"],
      description:
        "Uses the Claude Code Analytics Admin API when an API key is configured.",
    }),
    createProviderSetting("gemini-policy", {
      status: "granted",
      credentialStatus: "not_required",
      pageBinding: createEmptyPageBinding(),
      hostsLabel: "No host access required",
      hostOrigins: [],
      description:
        "Uses documented Gemini quota policy only; no stable live per-user usage source is selected in v1.",
    }),
    createProviderSetting("codex-personal-page", {
      status: "granted",
      credentialStatus: "not_required",
      pageBinding: createEmptyPageBinding(),
      hostsLabel: "chatgpt.com",
      hostOrigins: ["https://chatgpt.com/*"],
      description:
        "Uses logged-in ChatGPT Codex usage pages. Display is independent from browser access.",
    }),
    createProviderSetting("codex-enterprise-api", {
      status: "granted",
      credentialStatus: "missing",
      pageBinding: createEmptyPageBinding(),
      hostsLabel: "api.chatgpt.com",
      hostOrigins: ["https://api.chatgpt.com/*"],
      description:
        "Uses the Codex Enterprise analytics API when an API key and workspace ID are configured.",
    }),
    createProviderSetting("sub2api-api-key", {
      status: "missing",
      credentialStatus: "missing",
      pageBinding: createEmptyPageBinding(),
      hostsLabel: "No deployment configured",
      hostOrigins: [],
      description:
        "Uses a user-configured Sub2API deployment and account-scoped API key without opening its dashboard.",
    }),
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
    motionMode: DEFAULT_MOTION_MODE,
    resetTimeDisplayMode: DEFAULT_RESET_TIME_DISPLAY_MODE,
    quotaPaceForecastEnabled: DEFAULT_QUOTA_PACE_FORECAST_ENABLED,
    popupProgressStyle: DEFAULT_POPUP_PROGRESS_STYLE,
    sidebarProgressStyle: DEFAULT_SIDEBAR_PROGRESS_STYLE,
    fullPageProgressStyle: DEFAULT_FULL_PAGE_PROGRESS_STYLE,
    popupProviderBrowsingMode: DEFAULT_POPUP_PROVIDER_BROWSING_MODE,
    popupProviderAccountPresentationByProvider:
      normalizePopupProviderAccountPresentationByProvider(undefined),
    popupSizePreset: DEFAULT_POPUP_SIZE_PRESET,
    popupCornerStyle: DEFAULT_POPUP_CORNER_STYLE,
    popupShadowStyle: DEFAULT_POPUP_SHADOW_STYLE,
    popupCircularProgressItemsPerRow:
      DEFAULT_POPUP_CIRCULAR_PROGRESS_ITEMS_PER_ROW,
    actionBadgeSelectionMode: DEFAULT_ACTION_BADGE_SELECTION_MODE,
    actionBadgeSelection: DEFAULT_ACTION_BADGE_SELECTION,
    actionBadgeSelections: [DEFAULT_ACTION_BADGE_SELECTION],
    actionBadgeRotationIntervalSeconds:
      DEFAULT_ACTION_BADGE_ROTATION_INTERVAL_SECONDS,
    toolbarIconMode: DEFAULT_TOOLBAR_ICON_MODE,
    toolbarIconProviderId: DEFAULT_TOOLBAR_ICON_PROVIDER_ID,
    toolbarIconCustomImageDataUrl: DEFAULT_TOOLBAR_ICON_CUSTOM_IMAGE_DATA_URL,
    providerOrderBySurface: createDefaultProviderOrderBySurface(),
    progressItemsBySurface: createDefaultProgressItemsBySurface(),
    usageHistoryModulesBySurface: createDefaultUsageHistoryModulesBySurface(),
    providerServiceStatusVisibilityBySurface:
      createDefaultProviderServiceStatusVisibilityBySurface(),
    progressThicknessPx: DEFAULT_PROGRESS_THICKNESS_PX,
    progressColorBands: createDefaultProgressColorBands(),
    progressColorAppearance: createDefaultProgressColorAppearance(),
  },
};

function createInitialWarningDiagnostic(
  provider: ProviderSnapshot,
  setting: ProviderSetting,
): ProviderSnapshot["warningDiagnostic"] {
  if (setting.connectionMode === "credential") {
    return createCredentialDiagnostic({
      providerId: provider.providerId,
      credentialKind:
        provider.providerId === "codex-enterprise-api"
          ? "workspace_config"
          : "admin_api_key",
      rawMessage: `${setting.label} credentials are not configured yet.`,
    });
  }

  if (setting.connectionMode === "page_session") {
    return createPageSessionDiagnostic({
      providerId: provider.providerId,
      pageSessionKind: "open_page_required",
      rawMessage: `${setting.label} has not been opened in this profile yet.`,
    });
  }

  if (setting.sourceKind === "policy_only") {
    return createPolicyOnlyDiagnostic({
      providerId: provider.providerId,
      policyOnlyKind: "documented_limit_only",
      rawMessage: `${setting.label} uses documented policy only.`,
    });
  }

  return null;
}

function createInitialProviderSnapshot(
  provider: ProviderSnapshot,
  setting: ProviderSetting,
): ProviderSnapshot {
  const warningDiagnostic = createInitialWarningDiagnostic(provider, setting);

  return {
    ...provider,
    used: null,
    remaining: null,
    total: null,
    resetAt: "",
    resetLabel:
      setting.connectionMode === "page_session"
        ? "Grant access, open the provider page, then refresh."
        : "Complete setup, then refresh.",
    syncedAt: "",
    syncStatus: "warning",
    warningReason: warningDiagnostic?.rawMessage ?? "Setup is not complete yet.",
    warningDiagnostic,
    lastSyncLabel: "Not synced yet",
    sourceSelectionReason: "No source has been refreshed yet.",
    sourceSelectionDiagnostic: null,
    sourceFallbackReason: null,
    sourceFallbackDiagnostic: null,
    usageWindows: [],
    usageBalances: [],
    usageFacts: [],
    usageSummary: null,
    tone: "warning",
  };
}

function createInitialProviderSetting(setting: ProviderSetting): ProviderSetting {
  return {
    ...setting,
    status: setting.hostOrigins.length > 0 ? "missing" : "granted",
    credentialStatus:
      setting.connectionMode === "credential" ? "missing" : "not_required",
    pageBinding: createEmptyPageBinding(),
  };
}

export const DEFAULT_APP_STATE: AppState = {
  providers: SAMPLE_APP_STATE.providers.map((provider) => {
    const sampleSetting = SAMPLE_APP_STATE.providerSettings.find(
      (setting) => setting.id === provider.providerId,
    );

    if (!sampleSetting) {
      return provider;
    }

    return createInitialProviderSnapshot(
      provider,
      createInitialProviderSetting(sampleSetting),
    );
  }),
  providerSettings: SAMPLE_APP_STATE.providerSettings.map(
    createInitialProviderSetting,
  ),
  settings: {
    ...SAMPLE_APP_STATE.settings,
    providerOrderBySurface: createDefaultProviderOrderBySurface(),
    progressItemsBySurface: createDefaultProgressItemsBySurface(),
    usageHistoryModulesBySurface: createDefaultUsageHistoryModulesBySurface(),
    providerServiceStatusVisibilityBySurface:
      createDefaultProviderServiceStatusVisibilityBySurface(),
    progressColorBands: createDefaultProgressColorBands(),
    progressColorAppearance: createDefaultProgressColorAppearance(),
  },
};
