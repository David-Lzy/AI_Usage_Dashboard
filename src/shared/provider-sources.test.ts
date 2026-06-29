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
  doesUrlMatchRouteHint,
  doesUrlMatchRouteHints,
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
    const { provider, setting } = findProviderState("gemini-policy");
    const display = buildProviderSourceDisplay(provider, setting);

    expect(display.currentLabel).toBe("Policy only");
    expect(display.currentContractLabel).toBe("Shipped policy only");
    expect(display.stateKind).toBe("policy_only");
    expect(display.stateLabel).toBe("No live sync");
    expect(display.fidelityLabel).toBe("Documented policy");
  });

  it("classifies JetBrains as a deferred repo-retained session-page source", () => {
    const { provider, setting } = findProviderState("jetbrains-org-page");
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
    const { provider, setting } = findProviderState("cursor-personal-page");
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
    const sessionPagePlan = getSessionPagePlan("jetbrains-org-page");

    expect(sessionPagePlan).not.toBeNull();
    expect(getOpenableRouteHint(sessionPagePlan?.routeHints ?? [])).toBe(
      "https://account.jetbrains.com/organization/ai/users-and-licensing",
    );
    expect(
      getOpenableRouteHint(["https://cursor.com/*/dashboard/usage*"]),
    ).toBeNull();
    expect(
      getOpenableRouteHint([
        "https://cursor.com/*/dashboard/usage*",
        "https://cursor.com/dashboard/usage*",
      ]),
    ).toBe("https://cursor.com/dashboard/usage");
  });

  it("marks Codex personal usage pages as a shipped session-page track", () => {
    const sessionPagePlan = getSessionPagePlan("codex-personal-page");

    expect(sessionPagePlan).not.toBeNull();
    expect(sessionPagePlan?.rolloutStage).toBe("shipped");
    expect(getOpenableRouteHint(sessionPagePlan?.routeHints ?? [])).toBe(
      "https://chatgpt.com/codex/cloud/settings/analytics",
    );
  });

  it("matches active-tab URLs against concrete and wildcard session-page route hints", () => {
    expect(
      doesUrlMatchRouteHint(
        "https://chatgpt.com/codex/cloud/settings/analytics#usage",
        "https://chatgpt.com/codex/cloud/settings/analytics*",
      ),
    ).toBe(true);
    expect(
      doesUrlMatchRouteHint(
        "https://cursor.com/acme/dashboard/usage?period=current",
        "https://cursor.com/*/dashboard/usage*",
      ),
    ).toBe(true);
    expect(
      doesUrlMatchRouteHint(
        "https://cursor.com/dashboard/usage#team",
        "https://cursor.com/dashboard/usage*",
      ),
    ).toBe(true);
    expect(
      doesUrlMatchRouteHint(
        "chrome-extension://example/src/sidepanel/index.html#settings",
        "https://cursor.com/dashboard/usage*",
      ),
    ).toBe(false);
  });

  it("rejects non-provider active-tab URLs for provider session-page hints", () => {
    const codexSessionPagePlan = getSessionPagePlan("codex-personal-page");

    expect(codexSessionPagePlan).not.toBeNull();
    expect(
      doesUrlMatchRouteHints(
        "https://chatgpt.com/gpts",
        codexSessionPagePlan?.routeHints ?? [],
      ),
    ).toBe(false);
  });

  it("distinguishes Codex enterprise analytics from the personal session-page track", () => {
    const { provider, setting } = findProviderState("codex-enterprise-api");
    const display = buildProviderSourceDisplay(provider, setting);

    expect(display.currentLabel).toBe("Official API");
    expect(display.currentContractLabel).toBe("Shipped enterprise analytics");
    expect(display.fidelityLabel).toBe("Analytics snapshot");
    expect(display.accessModelLabel).toBe("Stored credential");
    expect(display.credentialPersistenceLabel).toBe("Extension local only");
    expect(display.cookiePolicyLabel).toBe("Forbidden");
    expect(display.sessionPageContractLabel).toBeNull();
    expect(display.sessionPageFidelityLabel).toBeNull();
    expect(display.sessionPageAvailabilitySummary).toBeNull();
  });

  it("localizes provider-source wrapper labels without rewriting raw source-truth reasons", () => {
    const { provider, setting } = findProviderState("codex-enterprise-api");
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
    expect(display.sessionPageAvailabilitySummary).toBeNull();
    expect(display.sourceSelectionReason).toBe("Official API selected.");
    expect(display.sourceFallbackReason).toBeNull();
  });

  it("prefers typed host-access diagnostics over raw warning pattern matching", () => {
    const warningReason = "Provider permission is blocked for live sync.";
    const { provider, setting } = buildProviderState(
      "cursor-personal-page",
      {
        warningReason,
        warningDiagnostic: createHostAccessDiagnostic({
          providerId: "cursor-personal-page",
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
    const { provider, setting } = buildProviderState("codex-personal-page", {
      syncStatus: "error",
      tone: "error",
      warningReason,
      warningDiagnostic: createCredentialDiagnostic({
        providerId: "codex-personal-page",
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
    const loggedOut = buildProviderState("cursor-personal-page", {
      syncStatus: "warning",
      tone: "warning",
      warningReason: loggedOutReason,
      warningDiagnostic: createPageSessionDiagnostic({
        providerId: "cursor-personal-page",
        pageSessionKind: "logged_out",
        rawMessage: loggedOutReason,
      }),
    });
    const openPageReason = "Usage capture needs the provider page.";
    const openPage = buildProviderState("cursor-personal-page", {
      syncStatus: "warning",
      tone: "warning",
      warningReason: openPageReason,
      warningDiagnostic: createPageSessionDiagnostic({
        providerId: "cursor-personal-page",
        pageSessionKind: "open_page_required",
        rawMessage: openPageReason,
      }),
    });
    const captureReason =
      "The open Cursor dashboard usage page could not be read by extension scripting.";
    const captureUnavailable = buildProviderState("cursor-personal-page", {
      syncStatus: "error",
      tone: "error",
      warningReason: captureReason,
      warningDiagnostic: createPageSessionDiagnostic({
        providerId: "cursor-personal-page",
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
    const captureDisplay = buildProviderSourceDisplay(
      captureUnavailable.provider,
      captureUnavailable.setting,
    );

    expect(captureDisplay.stateKind).toBe("capture_unavailable");
    expect(captureDisplay.stateLabel).toBe("Page capture unavailable");
    expect(captureDisplay.stateDetail).toBe(captureReason);
    expect(captureDisplay.stateTone).toBe("error");
  });

  it("prioritizes missing host access before page-session diagnostics", () => {
    const warningReason = "Cursor usage page has not been opened yet.";
    const { provider, setting } = buildProviderState(
      "cursor-personal-page",
      {
        syncStatus: "warning",
        tone: "warning",
        warningReason,
        warningDiagnostic: createPageSessionDiagnostic({
          providerId: "cursor-personal-page",
          pageSessionKind: "open_page_required",
          rawMessage: warningReason,
        }),
      },
      {
        status: "missing",
      },
    );

    expect(buildProviderSourceDisplay(provider, setting).stateKind).toBe(
      "host_access_missing",
    );
    expect(
      buildProviderSourceDisplay(provider, {
        ...setting,
        status: "granted",
      }).stateKind,
    ).toBe("open_page_required");
  });

  it("keeps usage-threshold and cached-state stale diagnostics source-ready", () => {
    const usageReason = "90% of included requests consumed";
    const usage = buildProviderState("cursor-personal-page", {
      syncStatus: "warning",
      tone: "warning",
      warningReason: usageReason,
      warningDiagnostic: createUsageThresholdDiagnostic({
        providerId: "cursor-personal-page",
        usageThresholdKind: "threshold_warning",
        rawMessage: usageReason,
        usagePercent: 90,
        thresholdPercent: 80,
      }),
    });
    const staleReason = "Automatic refresh is overdue; showing cached data.";
    const stale = buildProviderState("cursor-personal-page", {
      syncStatus: "warning",
      tone: "warning",
      warningReason: staleReason,
      warningDiagnostic: createSyncStaleDiagnostic({
        providerId: "cursor-personal-page",
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
    const { provider, setting } = buildProviderState("cursor-personal-page", {
      syncStatus: "error",
      tone: "error",
      warningReason,
      warningDiagnostic: createSyncStaleDiagnostic({
        providerId: "cursor-personal-page",
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
    const { provider, setting } = buildProviderState("cursor-personal-page", {
      warningReason,
      warningDiagnostic: unknownDiagnostic,
    });
    const display = buildProviderSourceDisplay(provider, setting);

    expect(display.stateKind).toBe("host_access_missing");
    expect(display.stateDetail).toBe(warningReason);
  });

  it("keeps raw warning fallback when typed diagnostics are absent", () => {
    const warningReason =
      "No Cursor Admin API key is stored; add an API key before official sync can run.";
    const { provider, setting } = buildProviderState("cursor-personal-page", {
      warningReason,
      warningDiagnostic: null,
    });
    const display = buildProviderSourceDisplay(provider, setting);

    expect(display.stateKind).toBe("credential_missing");
    expect(display.stateDetail).toBe(warningReason);
  });

  it("classifies the retained JetBrains session-page path as exact vendor values", () => {
    const { provider, setting } = findProviderState("jetbrains-org-page");
    const display = buildProviderSourceDisplay(provider, setting);

    expect(display.fidelityLabel).toBe("Exact vendor value");
    expect(display.accessModelLabel).toBe("Logged-in page session");
    expect(display.hostAccessLabel).toBe("Required");
    expect(display.availabilitySummary).toBe(
      "Used: Exact · Remaining: Exact · Reset: Window only",
    );
  });

  it("surfaces policy-only providers as no-live-connection trust boundaries", () => {
    const { provider, setting } = findProviderState("gemini-policy");
    const display = buildProviderSourceDisplay(provider, setting);

    expect(display.accessModelLabel).toBe("No live connection");
    expect(display.credentialPersistenceLabel).toBe("Not applicable");
    expect(display.hostAccessLabel).toBe("Not required");
    expect(display.manualCookieImportLabel).toBe("Forbidden");
  });

  it("makes shipped Claude Team and policy-only Gemini tracks explicit in source display", () => {
    const claude = buildProviderSourceDisplay(
      findProviderState("claude-code-team-page").provider,
      findProviderState("claude-code-team-page").setting,
    );
    const gemini = buildProviderSourceDisplay(
      findProviderState("gemini-policy").provider,
      findProviderState("gemini-policy").setting,
    );

    expect(claude.sessionPageContractLabel).toBe("Shipped personal partial");
    expect(claude.sessionPageContractDetail).toContain(
      "Current shipped Team-session contract",
    );
    expect(claude.sessionPageGraduationGateLabel).toBeNull();
    expect(claude.sessionPageGraduationGateDetail).toBeNull();
    expect(gemini.currentContractLabel).toBe("Shipped policy only");
    expect(gemini.sessionPageContractLabel).toBeNull();
    expect(gemini.sessionPageGraduationGateLabel).toBeNull();
  });

  it("offers fixed source preference options for source-level providers", () => {
    expect(getSourcePreferenceOptions("cursor-personal-page")).toEqual([
      "session_page",
    ]);
    expect(getSourcePreferenceOptions("cursor-team-api")).toEqual([
      "official_api",
    ]);
    expect(getSourcePreferenceOptions("codex-personal-page")).toEqual([
      "session_page",
    ]);
    expect(getSourcePreferenceOptions("codex-enterprise-api")).toEqual([
      "official_api",
    ]);
    expect(getSourcePreferenceOptions("gemini-policy")).toEqual(["auto"]);
  });

  it("builds deterministic source attempt order from the selected preference", () => {
    expect(getSourceAttemptOrder("cursor-personal-page", "auto")).toEqual([
      "session_page",
    ]);
    expect(getSourceAttemptOrder("cursor-personal-page", "session_page")).toEqual([
      "session_page",
    ]);
    expect(getSourceAttemptOrder("codex-enterprise-api", "official_api")).toEqual([
      "official_api",
    ]);
  });
});
