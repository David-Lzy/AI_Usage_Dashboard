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
      provider: baseProvider,
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
});
