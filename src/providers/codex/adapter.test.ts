import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProviderSecrets, ProviderSetting, ProviderSnapshot } from "../types";
import { createEmptyPageBinding } from "../../shared/page-bindings";
import type { CodexPersonalParseResult } from "./personal-page-parser";

const { createCodexAnalyticsClientMock, createCodexPersonalPageClientMock } =
  vi.hoisted(() => ({
  createCodexAnalyticsClientMock: vi.fn(),
    createCodexPersonalPageClientMock: vi.fn(),
  }));

vi.mock("./official", () => ({
  createCodexAnalyticsClient: createCodexAnalyticsClientMock,
}));

vi.mock("./personal-page-client", () => ({
  createCodexPersonalPageClient: createCodexPersonalPageClientMock,
}));

import { syncCodexProvider } from "./adapter";

const baseProvider: ProviderSnapshot = {
  providerId: "codex",
  providerLabel: "Codex",
  planName: "Unknown",
  quotaUnit: "credits",
  quotaWindow: "daily",
  used: null,
  remaining: null,
  total: null,
  resetAt: "Unknown",
  resetLabel: "Unknown",
  syncedAt: "Unknown",
  syncSource: "official",
  syncStatus: "ok",
  warningReason: null,
  lastSyncLabel: "Never synced",
  sourceSelectionReason: "",
  sourceFallbackReason: null,
  tone: "neutral",
};

const grantedSetting: ProviderSetting = {
  id: "codex",
  label: "Codex",
  enabled: true,
  status: "granted",
  credentialStatus: "configured",
  sourcePreference: "auto",
  pageBinding: createEmptyPageBinding(),
  hostsLabel: "api.chatgpt.com + chatgpt.com",
  hostOrigins: ["https://api.chatgpt.com/*", "https://chatgpt.com/*"],
  description:
    "Targets the Codex Enterprise analytics API today and the logged-in ChatGPT Codex usage pages for the personal-user track.",
};

function buildCodexPersonalPageResponse(result: CodexPersonalParseResult) {
  return {
    result,
    pageBinding: createEmptyPageBinding(),
  };
}

const emptySecrets: ProviderSecrets = {
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

describe("syncCodexProvider", () => {
  beforeEach(() => {
    createCodexAnalyticsClientMock.mockReset();
    createCodexPersonalPageClientMock.mockReset();
  });

  it("uses the personal usage-page path when analytics config is absent", async () => {
    const attemptedAt = new Date(2026, 3, 21, 11, 8);
    const personalResult: CodexPersonalParseResult = {
      status: "ok",
      snapshot: {
        providerId: "codex",
        providerLabel: "Codex",
        measurementKind: "window_percent",
        routeKey: "cloud_analytics",
        sourceUrl: "https://chatgpt.com/codex/cloud/settings/analytics#usage",
        sourceHeading: "Codex 分析",
        primaryWindow: {
          label: "5 小时使用限额",
          normalizedLabel: "5-hour usage window",
          kind: "rolling_5h",
          modelLabel: null,
          remainingPercent: 92,
          usedPercent: 8,
          totalPercent: 100,
          resetAt: "2026-04-22 01:11",
          resetText: "2026年4月22日 1:11",
        },
        windows: [
          {
            label: "5 小时使用限额",
            normalizedLabel: "5-hour usage window",
            kind: "rolling_5h",
            modelLabel: null,
            remainingPercent: 92,
            usedPercent: 8,
            totalPercent: 100,
            resetAt: "2026-04-22 01:11",
            resetText: "2026年4月22日 1:11",
          },
        ],
        balances: [],
        note: "Personal usage window snapshot",
      },
    };
    createCodexPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot: vi.fn(async () =>
        buildCodexPersonalPageResponse(personalResult),
      ),
    });

    const { snapshot } = await syncCodexProvider({
      provider: {
        ...baseProvider,
        usageWindows: [
          {
            label: "stale",
            normalizedLabel: "stale",
            kind: "unknown",
            modelLabel: null,
            quotaUnit: "percent",
            used: 99,
            remaining: 1,
            total: 100,
            resetAt: null,
            resetLabel: null,
          },
        ],
        usageBalances: [
          {
            label: "stale balance",
            normalizedLabel: "stale balance",
            kind: "unknown",
            quotaUnit: "credits",
            remaining: 99,
            total: null,
            detail: null,
          },
        ],
        usageSummary: "stale personal summary",
      },
      secrets: emptySecrets,
      setting: grantedSetting,
      warningThresholdPercent: 80,
      now: attemptedAt,
    });

    expect(snapshot.syncSource).toBe("page_parse");
    expect(snapshot.planName).toBe(
      "Codex Personal Usage Page (5-hour usage window)",
    );
    expect(snapshot.quotaUnit).toBe("percent");
    expect(snapshot.quotaWindow).toBe("rolling");
    expect(snapshot.used).toBe(8);
    expect(snapshot.remaining).toBe(92);
    expect(snapshot.total).toBe(100);
    expect(snapshot.resetAt).toBe("2026-04-22 01:11");
    expect(snapshot.resetLabel).toContain("5-hour usage window resets at");
    expect(snapshot.syncStatus).toBe("ok");
    expect(snapshot.tone).toBe("neutral");
    expect(snapshot.warningDiagnostic).toBeNull();
    expect(snapshot.usageWindows).toEqual([
      expect.objectContaining({
        normalizedLabel: "5-hour usage window",
        remaining: 92,
      }),
    ]);
    expect(snapshot.usageBalances).toEqual([]);
    expect(snapshot.usageSummary).toBeNull();
    expect(snapshot.lastSyncLabel).toBe("Codex personal fixture loaded");
    expect(snapshot.sourceSelectionReason).toBe("Auto fell back to Session page.");
    expect(snapshot.sourceSelectionDiagnostic).toMatchObject({
      code: "source.auto_selected_session_page",
      category: "source_selection",
      severity: "info",
      rawMessage: snapshot.sourceSelectionReason,
      params: {
        providerId: "codex",
        sourcePreference: "auto",
        selectedKind: "session_page",
        hadFallback: true,
      },
    });
    expect(snapshot.sourceFallbackReason).toBe(
      "Official API unavailable: Codex analytics API key and workspace ID are not both configured.",
    );
    expect(snapshot.sourceFallbackDiagnostic).toMatchObject({
      code: "source.official_api_missing_credential",
      category: "source_fallback",
      severity: "warning",
      rawMessage: snapshot.sourceFallbackReason,
      params: {
        providerId: "codex",
        sourcePreference: "auto",
        failedSourceKind: "official_api",
        failureCode: "credential_missing",
      },
    });
    expect(createCodexAnalyticsClientMock).not.toHaveBeenCalled();
    expect(createCodexPersonalPageClientMock).toHaveBeenCalled();
  });

  it("adds usage-threshold diagnostics when the personal usage window crosses the warning threshold", async () => {
    const attemptedAt = new Date(2026, 3, 21, 11, 8);
    const personalResult: CodexPersonalParseResult = {
      status: "ok",
      snapshot: {
        providerId: "codex",
        providerLabel: "Codex",
        measurementKind: "window_percent",
        routeKey: "cloud_analytics",
        sourceUrl: "https://chatgpt.com/codex/cloud/settings/analytics#usage",
        sourceHeading: "Codex analysis",
        primaryWindow: {
          label: "5 hour limit",
          normalizedLabel: "5-hour usage window",
          kind: "rolling_5h",
          modelLabel: null,
          remainingPercent: 7,
          usedPercent: 93,
          totalPercent: 100,
          resetAt: "2026-04-22 01:11",
          resetText: "April 22, 2026 1:11",
        },
        windows: [
          {
            label: "5 hour limit",
            normalizedLabel: "5-hour usage window",
            kind: "rolling_5h",
            modelLabel: null,
            remainingPercent: 7,
            usedPercent: 93,
            totalPercent: 100,
            resetAt: "2026-04-22 01:11",
            resetText: "April 22, 2026 1:11",
          },
        ],
        balances: [],
        note: "Personal usage window snapshot",
      },
    };
    createCodexPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot: vi.fn(async () =>
        buildCodexPersonalPageResponse(personalResult),
      ),
    });

    const { snapshot } = await syncCodexProvider({
      provider: baseProvider,
      secrets: emptySecrets,
      setting: {
        ...grantedSetting,
        sourcePreference: "session_page",
      },
      warningThresholdPercent: 80,
      now: attemptedAt,
    });

    expect(snapshot.syncSource).toBe("page_parse");
    expect(snapshot.syncStatus).toBe("warning");
    expect(snapshot.tone).toBe("warning");
    expect(snapshot.warningReason).toBe("5-hour usage window: 7% remaining");
    expect(snapshot.warningDiagnostic).toMatchObject({
      code: "usage.threshold_warning",
      category: "usage_threshold",
      severity: "warning",
      rawMessage: snapshot.warningReason,
      params: {
        providerId: "codex",
        usageThresholdKind: "threshold_warning",
        usagePercent: 93,
        thresholdPercent: 80,
        unitLabel: "percent",
      },
    });
    expect(snapshot.sourceSelectionReason).toBe(
      "Session page selected by user preference.",
    );
  });

  it("uses the most constrained visible personal usage window for Codex dashboard values", async () => {
    const attemptedAt = new Date(2026, 3, 25, 16, 20);
    const personalResult: CodexPersonalParseResult = {
      status: "ok",
      snapshot: {
        providerId: "codex",
        providerLabel: "Codex",
        measurementKind: "window_percent",
        routeKey: "cloud_analytics",
        sourceUrl: "https://chatgpt.com/codex/cloud/settings/analytics#usage",
        sourceHeading: "Codex 分析",
        primaryWindow: {
          label: "5 小时使用限额",
          normalizedLabel: "5-hour usage window",
          kind: "rolling_5h",
          modelLabel: null,
          remainingPercent: 100,
          usedPercent: 0,
          totalPercent: 100,
          resetAt: null,
          resetText: null,
        },
        windows: [
          {
            label: "5 小时使用限额",
            normalizedLabel: "5-hour usage window",
            kind: "rolling_5h",
            modelLabel: null,
            remainingPercent: 100,
            usedPercent: 0,
            totalPercent: 100,
            resetAt: null,
            resetText: null,
          },
          {
            label: "每周使用限额",
            normalizedLabel: "Weekly usage window",
            kind: "weekly",
            modelLabel: null,
            remainingPercent: 32,
            usedPercent: 68,
            totalPercent: 100,
            resetAt: "2026-04-29 04:00",
            resetText: "2026年4月29日 4:00",
          },
          {
            label: "GPT-5.3-Codex-Spark 每周使用限额",
            normalizedLabel: "GPT-5.3-Codex-Spark 每周使用限额",
            kind: "model_weekly",
            modelLabel: "GPT-5.3-Codex-Spark",
            remainingPercent: 100,
            usedPercent: 0,
            totalPercent: 100,
            resetAt: null,
            resetText: null,
          },
        ],
        balances: [
          {
            label: "余额额度",
            normalizedLabel: "Flex credit balance",
            kind: "flex_credit_balance",
            remainingCredits: 0,
            totalCredits: null,
            detail: "使用积分可在超出套餐限制后继续使用 Codex",
          },
        ],
        note: "Personal usage window snapshot",
      },
    };
    createCodexPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot: vi.fn(async () =>
        buildCodexPersonalPageResponse(personalResult),
      ),
    });

    const { snapshot } = await syncCodexProvider({
      provider: baseProvider,
      secrets: emptySecrets,
      setting: {
        ...grantedSetting,
        sourcePreference: "session_page",
      },
      warningThresholdPercent: 80,
      now: attemptedAt,
    });

    expect(snapshot.planName).toBe(
      "Codex Personal Usage Page (Weekly usage window)",
    );
    expect(snapshot.used).toBe(68);
    expect(snapshot.remaining).toBe(32);
    expect(snapshot.resetAt).toBe("2026-04-29 04:00");
    expect(snapshot.syncStatus).toBe("ok");
    expect(snapshot.tone).toBe("neutral");
    expect(snapshot.warningReason).toBeNull();
    expect(snapshot.warningDiagnostic).toBeNull();
    expect(snapshot.usageSummary).toBe(
      "Visible Codex usage: 5-hour usage window: 100% remaining · Weekly usage window: 32% remaining · GPT-5.3-Codex-Spark 每周使用限额: 100% remaining · Flex credit balance: 0 credits",
    );
    expect(snapshot.usageWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          normalizedLabel: "Weekly usage window",
          kind: "weekly",
          remaining: 32,
          used: 68,
          resetAt: "2026-04-29 04:00",
        }),
        expect.objectContaining({
          kind: "model_weekly",
          modelLabel: "GPT-5.3-Codex-Spark",
          remaining: 100,
        }),
      ]),
    );
    expect(snapshot.usageBalances).toEqual([
      expect.objectContaining({
        normalizedLabel: "Flex credit balance",
        kind: "flex_credit_balance",
        remaining: 0,
        total: null,
        detail: "使用积分可在超出套餐限制后继续使用 Codex",
      }),
    ]);
  });

  it("normalizes the latest daily analytics rows without inventing remaining credits", async () => {
    const attemptedAt = new Date(2026, 3, 21, 11, 8);
    createCodexAnalyticsClientMock.mockReturnValue({
      getUsageReport: vi.fn(async () => ({
        data: [
          {
            date: "2026-04-20T00:00:00Z",
            client: "cli",
            credits: 120.5,
            threads: 12,
            turns: 40,
          },
          {
            date: "2026-04-20T00:00:00Z",
            client: "vscode",
            metrics: {
              credits: 24.5,
              threads: 6,
              turns: 15,
            },
          },
          {
            date: "2026-04-19T00:00:00Z",
            client: "cloud",
            credits: 90,
            threads: 11,
            turns: 28,
          },
        ],
        has_more: false,
        next_cursor: null,
      })),
    });

    const { snapshot } = await syncCodexProvider({
      provider: {
        ...baseProvider,
        usageWindows: [
          {
            label: "stale",
            normalizedLabel: "stale",
            kind: "unknown",
            modelLabel: null,
            quotaUnit: "percent",
            used: 99,
            remaining: 1,
            total: 100,
            resetAt: null,
            resetLabel: null,
          },
        ],
        usageBalances: [
          {
            label: "stale balance",
            normalizedLabel: "stale balance",
            kind: "unknown",
            quotaUnit: "credits",
            remaining: 99,
            total: null,
            detail: null,
          },
        ],
        usageSummary: "stale personal summary",
      },
      secrets: {
        ...emptySecrets,
        codex: {
          analyticsApiKey: "sk-codex-enterprise",
          workspaceId: "ws_123",
        },
      },
      setting: grantedSetting,
      warningThresholdPercent: 80,
      now: attemptedAt,
    });

    expect(createCodexAnalyticsClientMock).toHaveBeenCalledWith({
      source: "live",
      apiKey: "sk-codex-enterprise",
      workspaceId: "ws_123",
    });
    expect(snapshot.providerLabel).toBe("Codex");
    expect(snapshot.planName).toBe("Codex Analytics API (Enterprise workspace)");
    expect(snapshot.quotaUnit).toBe("credits");
    expect(snapshot.quotaWindow).toBe("daily");
    expect(snapshot.used).toBe(145);
    expect(snapshot.remaining).toBeNull();
    expect(snapshot.total).toBeNull();
    expect(snapshot.resetAt).toBe("2026-04-20 UTC");
    expect(snapshot.resetLabel).toContain("Daily analytics snapshot");
    expect(snapshot.syncStatus).toBe("warning");
    expect(snapshot.tone).toBe("warning");
    expect(snapshot.warningReason).toBe(
      "145 credits · 18 threads · 55 turns · on 2026-04-20 UTC. Aggregated from 2 analytics rows for that day.",
    );
    expect(snapshot.warningDiagnostic).toBeNull();
    expect(snapshot.usageWindows).toBeUndefined();
    expect(snapshot.usageBalances).toBeUndefined();
    expect(snapshot.usageSummary).toBeNull();
    expect(snapshot.lastSyncLabel).toBe("Codex Analytics API synced just now");
    expect(snapshot.sourceSelectionReason).toBe("Auto selected Official API.");
    expect(snapshot.sourceSelectionDiagnostic).toMatchObject({
      code: "source.auto_selected_official_api",
      category: "source_selection",
      severity: "info",
      rawMessage: snapshot.sourceSelectionReason,
      params: {
        providerId: "codex",
        sourcePreference: "auto",
        selectedKind: "official_api",
        hadFallback: false,
      },
    });
    expect(snapshot.sourceFallbackReason).toBeNull();
    expect(snapshot.sourceFallbackDiagnostic).toBeNull();
    expect(snapshot.syncedAt).toBe("2026-04-21 11:08");
    expect(createCodexPersonalPageClientMock).not.toHaveBeenCalled();
  });

  it("returns a readable host-access state when Codex access is missing", async () => {
    const attemptedAt = new Date(2026, 3, 21, 11, 8);
    const { snapshot } = await syncCodexProvider({
      provider: baseProvider,
      secrets: emptySecrets,
      setting: {
        ...grantedSetting,
        status: "missing",
      },
      warningThresholdPercent: 80,
      now: attemptedAt,
    });

    expect(snapshot.syncSource).toBe("official");
    expect(snapshot.syncStatus).toBe("warning");
    expect(snapshot.tone).toBe("warning");
    expect(snapshot.warningReason).toContain("Host access missing");
    expect(snapshot.warningDiagnostic).toMatchObject({
      code: "host_access.missing",
      category: "host_access",
      severity: "warning",
      rawMessage: snapshot.warningReason,
      params: {
        providerId: "codex",
        sourceKind: "official_api",
        hostLabel: "api.chatgpt.com + chatgpt.com",
      },
    });
    expect(snapshot.lastSyncLabel).toBe("Codex analytics API access required");
    expect(snapshot.sourceSelectionReason).toBe(
      "Auto could not find an available live source.",
    );
    expect(snapshot.sourceSelectionDiagnostic).toBeNull();
    expect(snapshot.sourceFallbackDiagnostic).toBeNull();
  });

  it("surfaces open-page-required states from the Codex personal parser", async () => {
    const attemptedAt = new Date(2026, 3, 21, 11, 8);
    createCodexPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot: vi.fn(async () =>
        buildCodexPersonalPageResponse({
          status: "open_page_required",
          reason:
            "Open the logged-in Codex usage page in ChatGPT before refreshing personal usage capture.",
          chosenRoute: null,
          routeStatuses: [],
        }),
      ),
    });

    const { snapshot } = await syncCodexProvider({
      provider: baseProvider,
      secrets: emptySecrets,
      setting: grantedSetting,
      warningThresholdPercent: 80,
      now: attemptedAt,
    });

    expect(snapshot.syncSource).toBe("official");
    expect(snapshot.syncStatus).toBe("error");
    expect(snapshot.tone).toBe("error");
    expect(snapshot.warningReason).toContain(
      "Codex analytics API key and workspace ID are not both configured.",
    );
    expect(snapshot.warningDiagnostic).toMatchObject({
      code: "credential.workspace_config_missing",
      category: "credential",
      severity: "error",
      rawMessage: snapshot.warningReason,
      params: {
        providerId: "codex",
        credentialKind: "workspace_config",
      },
    });
    expect(snapshot.lastSyncLabel).toBe("Codex analytics config required");
    expect(snapshot.sourceFallbackReason).toContain(
      "Session page unavailable: Open the logged-in Codex usage page",
    );
    expect(snapshot.sourceFallbackDiagnostic).toMatchObject({
      code: "source.no_live_path",
      category: "source_fallback",
      severity: "error",
      rawMessage: snapshot.sourceFallbackReason,
      params: {
        providerId: "codex",
        sourcePreference: "auto",
        failureCount: 2,
      },
    });
  });

  it("keeps logged-out page-session diagnostics visible when Session page is preferred and no fallback source succeeds", async () => {
    const attemptedAt = new Date(2026, 3, 21, 11, 8);
    createCodexPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot: vi.fn(async () =>
        buildCodexPersonalPageResponse({
          status: "logged_out",
          reason:
            "The current ChatGPT tab matched a logged-out state instead of a usable Codex usage page.",
          chosenRoute: null,
          routeStatuses: [],
        }),
      ),
    });

    const { snapshot } = await syncCodexProvider({
      provider: baseProvider,
      secrets: emptySecrets,
      setting: {
        ...grantedSetting,
        sourcePreference: "session_page",
      },
      warningThresholdPercent: 80,
      now: attemptedAt,
    });

    expect(snapshot.syncSource).toBe("page_parse");
    expect(snapshot.warningReason).toBe(
      "The current ChatGPT tab matched a logged-out state instead of a usable Codex usage page.",
    );
    expect(snapshot.warningDiagnostic).toMatchObject({
      code: "page_session.logged_out",
      category: "page_session",
      severity: "warning",
      rawMessage: snapshot.warningReason,
      params: {
        providerId: "codex",
        pageSessionKind: "logged_out",
      },
    });
    expect(snapshot.sourceSelectionReason).toBe(
      "Session page preference could not find an available live source.",
    );
    expect(snapshot.sourceFallbackReason).toContain(
      "Session page unavailable: The current ChatGPT tab matched a logged-out state",
    );
    expect(snapshot.sourceFallbackReason).toContain(
      "Official API unavailable: Codex analytics API key and workspace ID are not both configured.",
    );
  });

  it("keeps capture-unavailable page-session diagnostics visible when a bound Codex tab cannot be read", async () => {
    const attemptedAt = new Date(2026, 3, 21, 11, 8);
    createCodexPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot: vi.fn(async () =>
        buildCodexPersonalPageResponse({
          status: "capture_unavailable",
          reason:
            "The open Codex usage page could not be read by the extension. Reload the page, confirm host access, then refresh again.",
          chosenRoute: null,
          routeStatuses: [
            {
              routeKey: "cloud_analytics",
              status: "capture_unavailable",
              matchedUrl: null,
            },
          ],
        }),
      ),
    });

    const { snapshot } = await syncCodexProvider({
      provider: baseProvider,
      secrets: emptySecrets,
      setting: {
        ...grantedSetting,
        sourcePreference: "session_page",
      },
      warningThresholdPercent: 80,
      now: attemptedAt,
    });

    expect(snapshot.syncSource).toBe("page_parse");
    expect(snapshot.syncStatus).toBe("error");
    expect(snapshot.warningReason).toBe(
      "The open Codex usage page could not be read by the extension. Reload the page, confirm host access, then refresh again.",
    );
    expect(snapshot.warningDiagnostic).toMatchObject({
      code: "page_session.capture_unavailable",
      category: "page_session",
      severity: "error",
      rawMessage: snapshot.warningReason,
      params: {
        providerId: "codex",
        pageSessionKind: "capture_unavailable",
      },
    });
    expect(snapshot.resetLabel).toBe(
      "Reload the Codex usage page and refresh again",
    );
    expect(snapshot.lastSyncLabel).toBe("Codex usage page unavailable");
    expect(snapshot.sourceFallbackReason).toContain(
      "Session page unavailable: The open Codex usage page could not be read",
    );
    expect(snapshot.sourceFallbackReason).toContain(
      "Official API unavailable: Codex analytics API key and workspace ID are not both configured.",
    );
  });

  it("maps Codex parser route drift to a typed adapter parse diagnostic", async () => {
    const attemptedAt = new Date(2026, 3, 21, 11, 8);
    createCodexPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot: vi.fn(async () =>
        buildCodexPersonalPageResponse({
          status: "route_drift",
          reason:
            "The matched Codex usage page no longer exposed a parseable remaining-percentage window.",
          chosenRoute: "cloud_analytics",
          routeStatuses: [],
        }),
      ),
    });

    const { snapshot } = await syncCodexProvider({
      provider: baseProvider,
      secrets: emptySecrets,
      setting: {
        ...grantedSetting,
        sourcePreference: "session_page",
      },
      warningThresholdPercent: 80,
      now: attemptedAt,
    });

    expect(snapshot.syncSource).toBe("page_parse");
    expect(snapshot.warningReason).toBe(
      "The matched Codex usage page no longer exposed a parseable remaining-percentage window.",
    );
    expect(snapshot.warningDiagnostic).toMatchObject({
      code: "adapter.parse_failed",
      category: "adapter_error",
      severity: "error",
      rawMessage: snapshot.warningReason,
      params: {
        providerId: "codex",
        adapterErrorKind: "parse_failed",
        sourceKind: "session_page",
        failureCode: "route_drift",
        parserStage: "personal_usage_page",
      },
    });
    expect(snapshot.lastSyncLabel).toBe("Codex usage page parse failed");
    expect(snapshot.sourceFallbackReason).toContain(
      "Session page unavailable: The matched Codex usage page no longer exposed",
    );
  });

  it("falls back to the personal page when Official API is preferred but Enterprise analytics config is missing", async () => {
    const attemptedAt = new Date(2026, 3, 21, 11, 8);
    const personalResult: CodexPersonalParseResult = {
      status: "ok",
      snapshot: {
        providerId: "codex",
        providerLabel: "Codex",
        measurementKind: "window_percent",
        routeKey: "cloud_analytics",
        sourceUrl: "https://chatgpt.com/codex/cloud/settings/analytics#usage",
        sourceHeading: "Codex 分析",
        primaryWindow: {
          label: "5 小时使用限额",
          normalizedLabel: "5-hour usage window",
          kind: "rolling_5h",
          modelLabel: null,
          remainingPercent: 92,
          usedPercent: 8,
          totalPercent: 100,
          resetAt: "2026-04-22 01:11",
          resetText: "2026年4月22日 1:11",
        },
        windows: [
          {
            label: "5 小时使用限额",
            normalizedLabel: "5-hour usage window",
            kind: "rolling_5h",
            modelLabel: null,
            remainingPercent: 92,
            usedPercent: 8,
            totalPercent: 100,
            resetAt: "2026-04-22 01:11",
            resetText: "2026年4月22日 1:11",
          },
        ],
        balances: [],
        note: "Personal usage window snapshot",
      },
    };
    createCodexPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot: vi.fn(async () =>
        buildCodexPersonalPageResponse(personalResult),
      ),
    });

    const { snapshot } = await syncCodexProvider({
      provider: baseProvider,
      secrets: emptySecrets,
      setting: {
        ...grantedSetting,
        sourcePreference: "official_api",
      },
      warningThresholdPercent: 80,
      now: attemptedAt,
    });

    expect(snapshot.syncSource).toBe("page_parse");
    expect(snapshot.warningDiagnostic).toBeNull();
    expect(snapshot.sourceSelectionReason).toBe(
      "Official API preference fell back to Session page.",
    );
    expect(snapshot.sourceSelectionDiagnostic).toMatchObject({
      code: "source.preference_selected_session_page",
      rawMessage: snapshot.sourceSelectionReason,
      params: {
        providerId: "codex",
        sourcePreference: "official_api",
        selectedKind: "session_page",
        hadFallback: true,
      },
    });
    expect(snapshot.sourceFallbackReason).toBe(
      "Official API unavailable: Codex analytics API key and workspace ID are not both configured.",
    );
    expect(snapshot.sourceFallbackDiagnostic).toMatchObject({
      code: "source.official_api_missing_credential",
      rawMessage: snapshot.sourceFallbackReason,
    });
  });

  it("falls back to Official API when Session page is preferred but the usage page is not open", async () => {
    const attemptedAt = new Date(2026, 3, 21, 11, 8);
    createCodexPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot: vi.fn(async () =>
        buildCodexPersonalPageResponse({
          status: "open_page_required",
          reason:
            "Open the logged-in Codex usage page in ChatGPT before refreshing personal usage capture.",
          chosenRoute: null,
          routeStatuses: [],
        }),
      ),
    });
    createCodexAnalyticsClientMock.mockReturnValue({
      getUsageReport: vi.fn(async () => ({
        data: [
          {
            date: "2026-04-20T00:00:00Z",
            client: "cli",
            credits: 120.5,
            threads: 12,
            turns: 40,
          },
        ],
        has_more: false,
        next_cursor: null,
      })),
    });

    const { snapshot } = await syncCodexProvider({
      provider: baseProvider,
      secrets: {
        ...emptySecrets,
        codex: {
          analyticsApiKey: "sk-codex-enterprise",
          workspaceId: "ws_123",
        },
      },
      setting: {
        ...grantedSetting,
        sourcePreference: "session_page",
      },
      warningThresholdPercent: 80,
      now: attemptedAt,
    });

    expect(snapshot.syncSource).toBe("official");
    expect(snapshot.sourceSelectionReason).toBe(
      "Session page preference fell back to Official API.",
    );
    expect(snapshot.sourceSelectionDiagnostic).toMatchObject({
      code: "source.preference_selected_official_api",
      rawMessage: snapshot.sourceSelectionReason,
      params: {
        providerId: "codex",
        sourcePreference: "session_page",
        selectedKind: "official_api",
        hadFallback: true,
      },
    });
    expect(snapshot.sourceFallbackReason).toBe(
      "Session page unavailable: Open the logged-in Codex usage page in ChatGPT before refreshing personal usage capture.",
    );
    expect(snapshot.sourceFallbackDiagnostic).toMatchObject({
      code: "source.session_page_unavailable",
      category: "source_fallback",
      severity: "error",
      rawMessage: snapshot.sourceFallbackReason,
      params: {
        providerId: "codex",
        sourcePreference: "session_page",
        failedSourceKind: "session_page",
        failureCode: "open_page_required",
      },
    });
  });

  it("enables managed Codex page opening on alarm after a page binding exists", async () => {
    const attemptedAt = new Date(2026, 3, 30, 9, 15);
    const getUsageSnapshot = vi.fn(async () =>
      buildCodexPersonalPageResponse({
        status: "open_page_required",
        reason:
          "Open the logged-in Codex usage page in ChatGPT before refreshing personal usage capture.",
        chosenRoute: null,
        routeStatuses: [],
      }),
    );
    createCodexPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot,
    });

    await syncCodexProvider({
      provider: baseProvider,
      secrets: emptySecrets,
      setting: {
        ...grantedSetting,
        sourcePreference: "session_page",
        pageBinding: {
          mode: "auto",
          status: "stale",
          tabId: 42,
          matchedUrl: "https://chatgpt.com/codex/cloud/settings/analytics",
          matchedTitle: "Codex",
          updatedAt: "2026-04-29T12:00:00.000Z",
        },
      },
      warningThresholdPercent: 80,
      now: attemptedAt,
      trigger: "alarm",
    });

    expect(createCodexPersonalPageClientMock).toHaveBeenCalledWith({
      source: "fixture",
      openPageWhenMissing: true,
    });
    expect(getUsageSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "stale",
        matchedUrl: "https://chatgpt.com/codex/cloud/settings/analytics",
      }),
    );
  });

  it("enables managed Codex page opening on alarm before a page binding exists", async () => {
    const attemptedAt = new Date(2026, 4, 2, 9, 15);
    const getUsageSnapshot = vi.fn(async () =>
      buildCodexPersonalPageResponse({
        status: "open_page_required",
        reason:
          "Open the logged-in Codex usage page in ChatGPT before refreshing personal usage capture.",
        chosenRoute: null,
        routeStatuses: [],
      }),
    );
    createCodexPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot,
    });

    await syncCodexProvider({
      provider: baseProvider,
      secrets: emptySecrets,
      setting: {
        ...grantedSetting,
        sourcePreference: "auto",
        pageBinding: createEmptyPageBinding(),
      },
      warningThresholdPercent: 80,
      now: attemptedAt,
      trigger: "alarm",
    });

    expect(createCodexPersonalPageClientMock).toHaveBeenCalledWith({
      source: "fixture",
      openPageWhenMissing: true,
    });
    expect(getUsageSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "unbound",
        matchedUrl: null,
      }),
    );
  });

  it("does not auto-open the Codex page repeatedly on alarms after logged-out detection", async () => {
    const attemptedAt = new Date(2026, 3, 30, 9, 30);
    createCodexPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot: vi.fn(async () =>
        buildCodexPersonalPageResponse({
          status: "logged_out",
          reason:
            "The current ChatGPT tab matched a logged-out state instead of a usable Codex usage page.",
          chosenRoute: null,
          routeStatuses: [],
        }),
      ),
    });

    await syncCodexProvider({
      provider: {
        ...baseProvider,
        warningDiagnostic: {
          code: "page_session.logged_out",
          category: "page_session",
          severity: "warning",
          rawMessage:
            "The current ChatGPT tab matched a logged-out state instead of a usable Codex usage page.",
        },
      },
      secrets: emptySecrets,
      setting: {
        ...grantedSetting,
        sourcePreference: "session_page",
        pageBinding: {
          mode: "auto",
          status: "stale",
          tabId: 42,
          matchedUrl: "https://chatgpt.com/codex/cloud/settings/analytics",
          matchedTitle: "Codex",
          updatedAt: "2026-04-29T12:00:00.000Z",
        },
      },
      warningThresholdPercent: 80,
      now: attemptedAt,
      trigger: "alarm",
    });

    expect(createCodexPersonalPageClientMock).toHaveBeenCalledWith({
      source: "fixture",
      openPageWhenMissing: false,
    });
  });
});
