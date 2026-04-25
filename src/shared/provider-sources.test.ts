import { describe, expect, it } from "vitest";

import {
  createCredentialDiagnostic,
  createHostAccessDiagnostic,
  createPageSessionDiagnostic,
  createSyncStaleDiagnostic,
  createUsageThresholdDiagnostic,
} from "../providers/diagnostics";
import type {
  ProviderDiagnostic,
  ProviderId,
  ProviderSetting,
  ProviderSnapshot,
} from "../providers/types";
import { SAMPLE_APP_STATE } from "./constants";
import { createRuntimeI18n } from "./i18n";
import { buildProviderSourceDisplayLocalizedCopy } from "./localized-copy";
import {
  buildProviderSourceDisplay,
  getSourceAttemptOrder,
  getOpenableRouteHint,
  getSourcePreferenceOptions,
  getSessionPagePlan,
} from "./provider-sources";

function findProviderState(providerId: ProviderId) {
  const provider =
    SAMPLE_APP_STATE.providers.find((entry) => entry.providerId === providerId) ??
    null;
  const setting =
    SAMPLE_APP_STATE.providerSettings.find((entry) => entry.id === providerId) ??
    null;

  if (!provider || !setting) {
    throw new Error(`Missing sample state for provider ${providerId}`);
  }

  return { provider, setting };
}

function buildProviderState(
  providerId: ProviderId,
  providerOverrides: Partial<ProviderSnapshot> = {},
  settingOverrides: Partial<ProviderSetting> = {},
): {
  provider: ProviderSnapshot;
  setting: ProviderSetting;
} {
  const { provider, setting } = findProviderState(providerId);

  return {
    provider: {
      ...provider,
      ...providerOverrides,
    },
    setting: {
      ...setting,
      ...settingOverrides,
    },
  };
}

describe("provider source helpers", () => {
  it("labels Gemini as policy-only even though it uses the official sync bucket", () => {
    const { provider, setting } = findProviderState("gemini");
    const display = buildProviderSourceDisplay(provider, setting);

    expect(display.currentLabel).toBe("Policy only");
    expect(display.currentContractLabel).toBe("Shipped policy only");
    expect(display.stateKind).toBe("policy_only");
    expect(display.stateLabel).toBe("No live sync");
    expect(display.fidelityLabel).toBe("Documented policy");
  });

  it("classifies JetBrains as a deferred repo-retained session-page source", () => {
    const { provider, setting } = findProviderState("jetbrains");
    const display = buildProviderSourceDisplay(provider, setting);

    expect(display.currentLabel).toBe("Session page");
    expect(display.currentPlan.rolloutStage).toBe("deferred");
    expect(display.currentContractLabel).toBe("Deferred org console path");
    expect(display.currentGraduationGateLabel).toBe(
      "Reverify org-visible Console session",
    );
    expect(display.sessionPagePlan?.routeHints[0]).toContain(
      "users-and-licensing",
    );
  });

  it("classifies Cursor as a shipped session-page source when the current snapshot uses page_parse", () => {
    const { provider, setting } = findProviderState("cursor");
    const display = buildProviderSourceDisplay(provider, setting);

    expect(display.currentLabel).toBe("Session page");
    expect(display.currentPlan.rolloutStage).toBe("shipped");
    expect(display.currentContractLabel).toBe("Shipped personal partial");
    expect(display.fidelityLabel).toBe("Window-only vendor value");
    expect(display.availabilitySummary).toBe(
      "Used: Window only · Remaining: Unavailable · Reset: Window only",
    );
    expect(display.sessionPagePlan?.routeHints[0]).toContain(
      "/dashboard/usage",
    );
  });

  it("derives an openable session-page route from the first concrete hint", () => {
    const sessionPagePlan = getSessionPagePlan("jetbrains");

    expect(sessionPagePlan).not.toBeNull();
    expect(getOpenableRouteHint(sessionPagePlan?.routeHints ?? [])).toBe(
      "https://account.jetbrains.com/organization/ai/users-and-licensing",
    );
  });

  it("marks Codex personal usage pages as a shipped session-page track", () => {
    const sessionPagePlan = getSessionPagePlan("codex");

    expect(sessionPagePlan).not.toBeNull();
    expect(sessionPagePlan?.rolloutStage).toBe("shipped");
    expect(getOpenableRouteHint(sessionPagePlan?.routeHints ?? [])).toBe(
      "https://chatgpt.com/codex/cloud/settings/analytics",
    );
  });

  it("distinguishes Codex analytics snapshots from the shipped personal session-page track", () => {
    const { provider, setting } = findProviderState("codex");
    const display = buildProviderSourceDisplay(provider, setting);

    expect(display.currentLabel).toBe("Official API");
    expect(display.currentContractLabel).toBe("Shipped enterprise analytics");
    expect(display.fidelityLabel).toBe("Analytics snapshot");
    expect(display.accessModelLabel).toBe("Stored credential");
    expect(display.credentialPersistenceLabel).toBe("Extension local only");
    expect(display.cookiePolicyLabel).toBe("Forbidden");
    expect(display.sessionPageContractLabel).toBe("Shipped personal partial");
    expect(display.sessionPageFidelityLabel).toBe("Window-only vendor value");
    expect(display.sessionPageAvailabilitySummary).toBe(
      "Used: Window only · Remaining: Exact · Reset: Exact",
    );
  });

  it("localizes provider-source wrapper labels without rewriting raw source-truth reasons", () => {
    const { provider, setting } = findProviderState("codex");
    const display = buildProviderSourceDisplay(
      provider,
      setting,
      buildProviderSourceDisplayLocalizedCopy(createRuntimeI18n("zh-CN")),
    );

    expect(display.currentLabel).toBe("官方 API");
    expect(display.currentContractLabel).toBe("已发布 enterprise analytics");
    expect(display.fidelityLabel).toBe("分析快照");
    expect(display.accessModelLabel).toBe("已存凭据");
    expect(display.availabilitySummary).toBe(
      "已用：分析 · 剩余：不可用 · 重置：仅窗口",
    );
    expect(display.sessionPageAvailabilitySummary).toBe(
      "已用：仅窗口 · 剩余：精确 · 重置：精确",
    );
    expect(display.sourceSelectionReason).toBe("Auto selected Official API.");
    expect(display.sourceFallbackReason).toBeNull();
  });

  it("prefers typed host-access diagnostics over raw warning pattern matching", () => {
    const warningReason = "Provider permission is blocked for live sync.";
    const { provider, setting } = buildProviderState(
      "cursor",
      {
        warningReason,
        warningDiagnostic: createHostAccessDiagnostic({
          providerId: "cursor",
          sourceKind: "session_page",
          hostLabel: "cursor.com",
          rawMessage: warningReason,
        }),
      },
      {
        status: "granted",
      },
    );
    const display = buildProviderSourceDisplay(provider, setting);

    expect(display.stateKind).toBe("host_access_missing");
    expect(display.stateLabel).toBe("Host access missing");
    expect(display.stateDetail).toBe(warningReason);
  });

  it("prefers typed credential diagnostics over raw warning pattern matching", () => {
    const warningReason = "Provider setup is incomplete for live analytics.";
    const { provider, setting } = buildProviderState("codex", {
      syncStatus: "error",
      tone: "error",
      warningReason,
      warningDiagnostic: createCredentialDiagnostic({
        providerId: "codex",
        credentialKind: "workspace_config",
        rawMessage: warningReason,
      }),
    });
    const display = buildProviderSourceDisplay(provider, setting);

    expect(display.stateKind).toBe("credential_missing");
    expect(display.stateLabel).toBe("Credential missing");
    expect(display.stateDetail).toBe(warningReason);
  });

  it("prefers typed page-session diagnostics over raw warning pattern matching", () => {
    const loggedOutReason = "Browser session unavailable for usage capture.";
    const loggedOut = buildProviderState("cursor", {
      syncStatus: "warning",
      tone: "warning",
      warningReason: loggedOutReason,
      warningDiagnostic: createPageSessionDiagnostic({
        providerId: "cursor",
        pageSessionKind: "logged_out",
        rawMessage: loggedOutReason,
      }),
    });
    const openPageReason = "Usage capture needs the provider page.";
    const openPage = buildProviderState("cursor", {
      syncStatus: "warning",
      tone: "warning",
      warningReason: openPageReason,
      warningDiagnostic: createPageSessionDiagnostic({
        providerId: "cursor",
        pageSessionKind: "open_page_required",
        rawMessage: openPageReason,
      }),
    });
    const captureReason = "Parser contract drifted during capture.";
    const captureUnavailable = buildProviderState("cursor", {
      syncStatus: "error",
      tone: "error",
      warningReason: captureReason,
      warningDiagnostic: createPageSessionDiagnostic({
        providerId: "cursor",
        pageSessionKind: "capture_unavailable",
        rawMessage: captureReason,
      }),
    });

    expect(
      buildProviderSourceDisplay(loggedOut.provider, loggedOut.setting)
        .stateKind,
    ).toBe("logged_out");
    expect(
      buildProviderSourceDisplay(openPage.provider, openPage.setting).stateKind,
    ).toBe("open_page_required");
    expect(
      buildProviderSourceDisplay(
        captureUnavailable.provider,
        captureUnavailable.setting,
      ).stateKind,
    ).toBe("sync_error");
  });

  it("keeps usage-threshold and cached-state stale diagnostics source-ready", () => {
    const usageReason = "90% of included requests consumed";
    const usage = buildProviderState("cursor", {
      syncStatus: "warning",
      tone: "warning",
      warningReason: usageReason,
      warningDiagnostic: createUsageThresholdDiagnostic({
        providerId: "cursor",
        usageThresholdKind: "threshold_warning",
        rawMessage: usageReason,
        usagePercent: 90,
        thresholdPercent: 80,
      }),
    });
    const staleReason = "Automatic refresh is overdue; showing cached data.";
    const stale = buildProviderState("cursor", {
      syncStatus: "warning",
      tone: "warning",
      warningReason: staleReason,
      warningDiagnostic: createSyncStaleDiagnostic({
        providerId: "cursor",
        syncStaleKind: "cached_state_stale",
        rawMessage: staleReason,
        ageMinutes: 240,
        staleAfterMinutes: 60,
      }),
    });

    expect(buildProviderSourceDisplay(usage.provider, usage.setting).stateKind).toBe(
      "ready",
    );
    expect(buildProviderSourceDisplay(stale.provider, stale.setting).stateKind).toBe(
      "ready",
    );
  });

  it("maps automatic-sync overdue diagnostics to the existing sync-error state", () => {
    const warningReason =
      "Automatic sync is overdue; cached state may be stale.";
    const { provider, setting } = buildProviderState("cursor", {
      syncStatus: "error",
      tone: "error",
      warningReason,
      warningDiagnostic: createSyncStaleDiagnostic({
        providerId: "cursor",
        syncStaleKind: "automatic_sync_overdue",
        rawMessage: warningReason,
        ageMinutes: 240,
        staleAfterMinutes: 60,
      }),
    });
    const display = buildProviderSourceDisplay(provider, setting);

    expect(display.stateKind).toBe("sync_error");
    expect(display.stateDetail).toBe(warningReason);
  });

  it("keeps raw warning pattern fallback for unknown typed diagnostics", () => {
    const warningReason =
      "Host access missing; grant Cursor access before live sync can run.";
    const unknownDiagnostic: ProviderDiagnostic = {
      code: "future.host_access_hint",
      category: "adapter_error",
      severity: "warning",
      rawMessage: warningReason,
    };
    const { provider, setting } = buildProviderState("cursor", {
      warningReason,
      warningDiagnostic: unknownDiagnostic,
    });
    const display = buildProviderSourceDisplay(provider, setting);

    expect(display.stateKind).toBe("host_access_missing");
    expect(display.stateDetail).toBe(warningReason);
  });

  it("classifies the retained JetBrains session-page path as exact vendor values", () => {
    const { provider, setting } = findProviderState("jetbrains");
    const display = buildProviderSourceDisplay(provider, setting);

    expect(display.fidelityLabel).toBe("Exact vendor value");
    expect(display.accessModelLabel).toBe("Logged-in page session");
    expect(display.hostAccessLabel).toBe("Required");
    expect(display.availabilitySummary).toBe(
      "Used: Exact · Remaining: Exact · Reset: Window only",
    );
  });

  it("surfaces policy-only providers as no-live-connection trust boundaries", () => {
    const { provider, setting } = findProviderState("gemini");
    const display = buildProviderSourceDisplay(provider, setting);

    expect(display.accessModelLabel).toBe("No live connection");
    expect(display.credentialPersistenceLabel).toBe("Not applicable");
    expect(display.hostAccessLabel).toBe("Not required");
    expect(display.manualCookieImportLabel).toBe("Forbidden");
  });

  it("makes deferred personal and project tracks explicit in source display", () => {
    const claude = buildProviderSourceDisplay(
      findProviderState("claude-code").provider,
      findProviderState("claude-code").setting,
    );
    const gemini = buildProviderSourceDisplay(
      findProviderState("gemini").provider,
      findProviderState("gemini").setting,
    );

    expect(claude.sessionPageContractLabel).toBe("Deferred personal page");
    expect(claude.sessionPageContractDetail).toContain("free-account route");
    expect(claude.sessionPageGraduationGateLabel).toBe(
      "Capture a real Pro or Max usage page",
    );
    expect(claude.sessionPageGraduationGateDetail).toContain(
      "upgrade redirect",
    );
    expect(gemini.sessionPageContractLabel).toBe("Deferred project metrics");
    expect(gemini.sessionPageContractDetail).toContain("project-scoped");
    expect(gemini.sessionPageGraduationGateLabel).toBe(
      "Accept project-metrics support",
    );
    expect(gemini.sessionPageGraduationGateDetail).toContain(
      "bound-tab project metrics",
    );
  });

  it("offers explicit source preference options for hybrid providers", () => {
    expect(getSourcePreferenceOptions("cursor")).toEqual([
      "auto",
      "official_api",
      "session_page",
    ]);
    expect(getSourcePreferenceOptions("codex")).toEqual([
      "auto",
      "official_api",
      "session_page",
    ]);
    expect(getSourcePreferenceOptions("jetbrains")).toEqual(["auto"]);
  });

  it("builds deterministic source attempt order from the selected preference", () => {
    expect(getSourceAttemptOrder("cursor", "auto")).toEqual([
      "official_api",
      "session_page",
    ]);
    expect(getSourceAttemptOrder("cursor", "session_page")).toEqual([
      "session_page",
      "official_api",
    ]);
    expect(getSourceAttemptOrder("codex", "official_api")).toEqual([
      "official_api",
      "session_page",
    ]);
  });
});
