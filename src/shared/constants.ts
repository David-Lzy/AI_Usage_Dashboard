// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 David-Lzy (https://github.com/David-Lzy). All rights reserved.
// Source: https://github.com/David-Lzy/AI_Usage_Dashboard

import type { ProviderId, ProviderSourceBlueprint } from "../providers/types";
export { DEFAULT_APP_STATE, DEFAULT_PROVIDER_SECRETS, createDefaultAppState } from "./production-state";

export const APP_STATE_STORAGE_KEY = "ai-usage-dashboard.app-state";
export const PROVIDER_SECRETS_STORAGE_KEY = "ai-usage-dashboard.provider-secrets";
export const LOCAL_COMPANION_SECRETS_STORAGE_KEY = "ai-usage-dashboard.local-companion-secrets";
export const CODEXBAR_DASHBOARD_CONNECTION_STORAGE_KEY = "ai-usage-dashboard.codexbar-dashboard-connection";

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
        kind: "local_companion",
        rolloutStage: "shipped",
        connectionMode: "credential",
        contractKind: "shipped_personal_partial",
        priority: 3,
        label: "Codex CLI local companion",
        routeHints: [],
        usedAvailability: "window_only",
        remainingAvailability: "exact",
        resetAvailability: "exact",
        contractDetail: "The paired local Codex CLI app-server reports account usage windows and reset times. API-equivalent dollars, when available, are separate local estimates.",
        graduationGateLabel: null,
        graduationGateDetail: null,
        note: "Optional same-device companion. Browser page access is not required in local-only mode.",
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
