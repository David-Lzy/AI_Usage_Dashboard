// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 David-Lzy (https://github.com/David-Lzy). All rights reserved.
// Source: https://github.com/David-Lzy/AI_Usage_Dashboard

import type {
  AppState,
  ProviderId,
  ProviderSecrets,
  ProviderSetting,
  ProviderSnapshot,
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
} from "../providers/diagnostics";
import { createEmptyPageBinding } from "./page-bindings";
import { normalizePopupProviderAccountPresentationByProvider } from "./provider-account-presentation";

export function createEmptyProviderSecrets(): ProviderSecrets {
  return {
    "cursor-team-api": { adminApiKey: null },
    "claude-code-admin-api": { adminApiKey: null },
    "codex-enterprise-api": { analyticsApiKey: null, workspaceId: null },
    "sub2api-api-key": { apiKey: null },
  };
}
export const DEFAULT_PROVIDER_SECRETS = createEmptyProviderSecrets();

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

function createDefaultProviderSettings(): ProviderSetting[] {
  return [
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
  ].map((setting) => ({
    ...setting,
    status: setting.hostOrigins.length > 0 ? "missing" : "granted",
    credentialStatus: setting.connectionMode === "credential" ? "missing" : "not_required",
    pageBinding: createEmptyPageBinding(),
  }));
}

function createDefaultSettings(): AppState["settings"] {
  return {
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
  };
}

type SnapshotPresentation = Pick<ProviderSnapshot, "providerLabel" | "planName" | "quotaUnit" | "quotaWindow" | "syncSource">;
const SNAPSHOT_PRESENTATION: Record<ProviderId, SnapshotPresentation> = {
  "cursor-personal-page": { providerLabel: "Cursor Personal", planName: "Cursor Personal Dashboard", quotaUnit: "requests", quotaWindow: "monthly", syncSource: "page_parse" },
  "cursor-team-api": { providerLabel: "Cursor Team API", planName: "Cursor Team Admin API", quotaUnit: "requests", quotaWindow: "monthly", syncSource: "official" },
  "jetbrains-org-page": { providerLabel: "JetBrains AI", planName: "Deferred organization source", quotaUnit: "credits", quotaWindow: "monthly", syncSource: "page_parse" },
  "claude-code-team-page": { providerLabel: "Claude Personal", planName: "Claude personal usage page", quotaUnit: "percent", quotaWindow: "daily", syncSource: "page_parse" },
  "claude-code-admin-api": { providerLabel: "Claude Admin API", planName: "Analytics Admin API", quotaUnit: "sessions", quotaWindow: "daily", syncSource: "official" },
  "gemini-policy": { providerLabel: "Gemini Code Assist", planName: "Gemini Code Assist Enterprise (documented policy)", quotaUnit: "requests", quotaWindow: "daily", syncSource: "official" },
  "codex-personal-page": { providerLabel: "Codex Personal", planName: "Codex personal usage pages", quotaUnit: "percent", quotaWindow: "rolling", syncSource: "page_parse" },
  "codex-enterprise-api": { providerLabel: "Codex Enterprise API", planName: "Codex Analytics API (Enterprise workspace)", quotaUnit: "credits", quotaWindow: "daily", syncSource: "official" },
  "sub2api-api-key": { providerLabel: "Sub2API", planName: "Sub2API API-key usage", quotaUnit: "credits", quotaWindow: "daily", syncSource: "official" },
};

function createInitialWarningDiagnostic(
  provider: Pick<ProviderSnapshot, "providerId">,
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

/** Production snapshots are an explicit empty allowlist, never a stripped demo. */
function createInitialProviderSnapshot(setting: ProviderSetting): ProviderSnapshot {
  const presentation = SNAPSHOT_PRESENTATION[setting.id];
  const warningDiagnostic = createInitialWarningDiagnostic({ providerId: setting.id }, setting);
  return {
    providerId: setting.id,
    providerLabel: presentation.providerLabel,
    planName: presentation.planName,
    quotaUnit: presentation.quotaUnit,
    quotaWindow: presentation.quotaWindow,
    syncSource: presentation.syncSource,
    used: null,
    remaining: null,
    total: null,
    resetAt: "",
    resetLabel: setting.connectionMode === "page_session"
      ? "Grant access, open the provider page, then refresh."
      : "Complete setup, then refresh.",
    syncedAt: "",
    lastAttemptAt: null,
    lastSuccessAt: null,
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

export function createDefaultAppState(): AppState {
  const providerSettings = createDefaultProviderSettings();
  return {
    providers: providerSettings.map(createInitialProviderSnapshot),
    providerSettings,
    settings: createDefaultSettings(),
  };
}

export const DEFAULT_APP_STATE: AppState = createDefaultAppState();
