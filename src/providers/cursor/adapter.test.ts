import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProviderSecrets, ProviderSetting, ProviderSnapshot } from "../types";
import { createEmptyPageBinding } from "../../shared/page-bindings";
import type { CursorPersonalParseResult } from "./personal-page-parser";

const {
  createCursorOfficialClientMock,
  createCursorPersonalPageClientMock,
} = vi.hoisted(() => ({
  createCursorOfficialClientMock: vi.fn(),
  createCursorPersonalPageClientMock: vi.fn(),
}));

vi.mock("./official", () => ({
  createCursorOfficialClient: createCursorOfficialClientMock,
}));

vi.mock("./personal-page-client", () => ({
  createCursorPersonalPageClient: createCursorPersonalPageClientMock,
}));

import { syncCursorProvider } from "./adapter";

const baseProvider: ProviderSnapshot = {
  providerId: "cursor",
  providerLabel: "Cursor",
  planName: "Unknown",
  quotaUnit: "requests",
  quotaWindow: "monthly",
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
  id: "cursor",
  label: "Cursor",
  enabled: true,
  status: "granted",
  credentialStatus: "configured",
  sourcePreference: "auto",
  pageBinding: createEmptyPageBinding(),
  hostsLabel: "api.cursor.com · cursor.com",
  hostOrigins: ["https://api.cursor.com/*", "https://cursor.com/*"],
  description:
    "Uses the team Admin API when a key is configured, or the logged-in personal usage page when no key is stored.",
};

function buildCursorPersonalPageResponse(result: CursorPersonalParseResult) {
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

describe("syncCursorProvider", () => {
  beforeEach(() => {
    createCursorOfficialClientMock.mockReset();
    createCursorPersonalPageClientMock.mockReset();
  });

  it("uses the personal usage-page path when no Cursor Admin API key is configured", async () => {
    const attemptedAt = new Date(2026, 3, 20, 14, 18);
    const personalResult: CursorPersonalParseResult = {
      status: "ok",
      snapshot: {
        providerId: "cursor",
        providerLabel: "Cursor",
        measurementKind: "billing_period_usage",
        routeKey: "dashboard_usage",
        sourceUrl: "https://cursor.com/cn/dashboard/usage",
        sourceTitle: "Cursor - The best way",
        localePrefix: "cn",
        recommendedSurface: "boot_data",
        billingPeriodLabel: "Mar 23 - Apr 21",
        usageSeriesLabel: "Your usage per day across this billing period",
        visiblePlanLabels: ["Pro", "Pro+", "Ultra"],
        visibleSectionLabels: ["Usage", "Your Usage", "By Model", "Spend"],
        onDemandUsageState: "off",
        exportCsvAvailable: true,
        usedAvailability: "window_only",
        remainingAvailability: "unavailable",
        resetAvailability: "window_only",
        note: "Cursor personal billing-period snapshot",
      },
    };
    createCursorPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot: vi.fn(async () =>
        buildCursorPersonalPageResponse(personalResult),
      ),
    });

    const { snapshot } = await syncCursorProvider({
      provider: baseProvider,
      secrets: emptySecrets,
      setting: grantedSetting,
      warningThresholdPercent: 80,
      now: attemptedAt,
    });

    expect(snapshot.syncSource).toBe("page_parse");
    expect(snapshot.planName).toBe("Cursor Personal Dashboard");
    expect(snapshot.quotaUnit).toBe("requests");
    expect(snapshot.quotaWindow).toBe("monthly");
    expect(snapshot.used).toBeNull();
    expect(snapshot.remaining).toBeNull();
    expect(snapshot.total).toBeNull();
    expect(snapshot.resetAt).toBe("Mar 23 - Apr 21");
    expect(snapshot.resetLabel).toBe(
      "Your usage per day across this billing period",
    );
    expect(snapshot.syncStatus).toBe("ok");
    expect(snapshot.tone).toBe("neutral");
    expect(snapshot.warningReason).toBe("On-demand usage is off.");
    expect(snapshot.warningDiagnostic).toBeNull();
    expect(snapshot.lastSyncLabel).toBe("Cursor personal fixture loaded");
    expect(snapshot.sourceSelectionReason).toBe("Auto fell back to Session page.");
    expect(snapshot.sourceSelectionDiagnostic).toMatchObject({
      code: "source.auto_selected_session_page",
      category: "source_selection",
      severity: "info",
      rawMessage: snapshot.sourceSelectionReason,
      params: {
        providerId: "cursor",
        sourcePreference: "auto",
        selectedKind: "session_page",
        hadFallback: true,
      },
    });
    expect(snapshot.sourceFallbackReason).toBe(
      "Official API unavailable: No Cursor Admin API key is stored.",
    );
    expect(snapshot.sourceFallbackDiagnostic).toMatchObject({
      code: "source.official_api_missing_credential",
      category: "source_fallback",
      severity: "warning",
      rawMessage: snapshot.sourceFallbackReason,
      params: {
        providerId: "cursor",
        sourcePreference: "auto",
        failedSourceKind: "official_api",
        failureCode: "credential_missing",
      },
    });
    expect(createCursorOfficialClientMock).not.toHaveBeenCalled();
    expect(createCursorPersonalPageClientMock).toHaveBeenCalled();
  });

  it("uses the live official client when a Cursor Admin API key is configured", async () => {
    const attemptedAt = new Date(2026, 3, 20, 14, 18);
    const cycleStart = new Date(2026, 3, 7).getTime();
    const getTeamMembers = vi.fn(async () => ({
      teamMembers: [
        { name: "Owner", email: "owner@example.com", role: "owner" },
        { name: "Member", email: "member@example.com", role: "member" },
        { name: "Free Owner", email: "free@example.com", role: "free-owner" },
      ],
    }));
    const getTeamSpend = vi.fn(async () => ({
      teamMemberSpend: [],
      subscriptionCycleStart: cycleStart,
      totalMembers: 3,
      totalPages: 1,
    }));
    const getDailyUsageData = vi.fn(async () => ({
      data: [
        {
          date: cycleStart,
          isActive: true,
          totalLinesAdded: 0,
          totalLinesDeleted: 0,
          acceptedLinesAdded: 0,
          acceptedLinesDeleted: 0,
          totalApplies: 0,
          totalAccepts: 0,
          totalRejects: 0,
          totalTabsShown: 0,
          totalTabsAccepted: 0,
          composerRequests: 0,
          chatRequests: 150,
          agentRequests: 170,
          cmdkUsages: 0,
          subscriptionIncludedReqs: 320,
          apiKeyReqs: 0,
          usageBasedReqs: 15,
          bugbotUsages: 0,
          mostUsedModel: "gpt-4.1",
        },
      ],
      period: {
        startDate: cycleStart,
        endDate: attemptedAt.getTime(),
      },
    }));

    createCursorOfficialClientMock.mockReturnValue({
      getTeamMembers,
      getTeamSpend,
      getDailyUsageData,
    });

    const { snapshot } = await syncCursorProvider({
      provider: baseProvider,
      secrets: {
        cursor: {
          adminApiKey: "cursor-live-key",
        },
      "claude-code": {
        adminApiKey: null,
      },
      codex: {
        analyticsApiKey: null,
        workspaceId: null,
      },
    },
      setting: grantedSetting,
      warningThresholdPercent: 80,
      now: attemptedAt,
    });

    expect(createCursorOfficialClientMock).toHaveBeenCalledWith({
      source: "live",
      apiKey: "cursor-live-key",
    });
    expect(getDailyUsageData).toHaveBeenCalledWith({
      startDate: cycleStart,
      endDate: attemptedAt.getTime(),
    });
    expect(snapshot.planName).toBe("Cursor Team (2 billed)");
    expect(snapshot.used).toBe(320);
    expect(snapshot.total).toBe(1000);
    expect(snapshot.remaining).toBe(680);
    expect(snapshot.resetAt).toBe("2026-05-07");
    expect(snapshot.syncStatus).toBe("warning");
    expect(snapshot.tone).toBe("warning");
    expect(snapshot.warningReason).toBe(
      "15 pay-per-use requests recorded this cycle",
    );
    expect(snapshot.warningDiagnostic).toBeNull();
    expect(snapshot.lastSyncLabel).toBe("Cursor Admin API synced just now");
    expect(snapshot.sourceSelectionReason).toBe("Auto selected Official API.");
    expect(snapshot.sourceSelectionDiagnostic).toMatchObject({
      code: "source.auto_selected_official_api",
      category: "source_selection",
      severity: "info",
      rawMessage: snapshot.sourceSelectionReason,
      params: {
        providerId: "cursor",
        sourcePreference: "auto",
        selectedKind: "official_api",
        hadFallback: false,
      },
    });
    expect(snapshot.sourceFallbackReason).toBeNull();
    expect(snapshot.sourceFallbackDiagnostic).toBeNull();
    expect(snapshot.syncedAt).toBe("2026-04-20 14:18");
    expect(createCursorPersonalPageClientMock).not.toHaveBeenCalled();
  });

  it("returns a readable host-access state when Cursor access is missing", async () => {
    const attemptedAt = new Date(2026, 3, 20, 14, 18);
    const { snapshot } = await syncCursorProvider({
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
        providerId: "cursor",
        sourceKind: "official_api",
        hostLabel: "api.cursor.com · cursor.com",
      },
    });
    expect(snapshot.lastSyncLabel).toBe("Cursor Admin API access required");
    expect(snapshot.sourceSelectionReason).toBe(
      "Auto could not find an available live source.",
    );
    expect(snapshot.sourceSelectionDiagnostic).toBeNull();
    expect(snapshot.sourceFallbackDiagnostic).toBeNull();
  });

  it("surfaces open-page-required states from the Cursor personal parser", async () => {
    const attemptedAt = new Date(2026, 3, 20, 14, 18);
    createCursorPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot: vi.fn(async () =>
        buildCursorPersonalPageResponse({
          status: "open_page_required",
          reason:
            "Open the logged-in Cursor dashboard usage page before refreshing personal usage capture.",
          chosenRoute: null,
          routeStatuses: [],
        }),
      ),
    });

    const { snapshot } = await syncCursorProvider({
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
      "No Cursor Admin API key is stored.",
    );
    expect(snapshot.warningDiagnostic).toMatchObject({
      code: "credential.admin_api_key_missing",
      category: "credential",
      severity: "error",
      rawMessage: snapshot.warningReason,
      params: {
        providerId: "cursor",
        credentialKind: "admin_api_key",
      },
    });
    expect(snapshot.lastSyncLabel).toBe("Cursor Admin API key required");
    expect(snapshot.sourceFallbackReason).toContain(
      "Session page unavailable: Open the logged-in Cursor dashboard usage page",
    );
    expect(snapshot.sourceFallbackDiagnostic).toMatchObject({
      code: "source.no_live_path",
      category: "source_fallback",
      severity: "error",
      rawMessage: snapshot.sourceFallbackReason,
      params: {
        providerId: "cursor",
        sourcePreference: "auto",
        failureCount: 2,
      },
    });
  });

  it("keeps page-session diagnostics visible when Session page is preferred and no fallback source succeeds", async () => {
    const attemptedAt = new Date(2026, 3, 20, 14, 18);
    createCursorPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot: vi.fn(async () =>
        buildCursorPersonalPageResponse({
          status: "open_page_required",
          reason:
            "Open the logged-in Cursor dashboard usage page before refreshing personal usage capture.",
          chosenRoute: null,
          routeStatuses: [],
        }),
      ),
    });

    const { snapshot } = await syncCursorProvider({
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
      "Open the logged-in Cursor dashboard usage page before refreshing personal usage capture.",
    );
    expect(snapshot.warningDiagnostic).toMatchObject({
      code: "page_session.open_page_required",
      category: "page_session",
      severity: "warning",
      rawMessage: snapshot.warningReason,
      params: {
        providerId: "cursor",
        pageSessionKind: "open_page_required",
      },
    });
    expect(snapshot.sourceSelectionReason).toBe(
      "Session page preference could not find an available live source.",
    );
    expect(snapshot.sourceFallbackReason).toContain(
      "Session page unavailable: Open the logged-in Cursor dashboard usage page",
    );
    expect(snapshot.sourceFallbackReason).toContain(
      "Official API unavailable: No Cursor Admin API key is stored.",
    );
  });

  it("falls back to the personal page when Official API is preferred but the Admin API key is missing", async () => {
    const attemptedAt = new Date(2026, 3, 20, 14, 18);
    const personalResult: CursorPersonalParseResult = {
      status: "ok",
      snapshot: {
        providerId: "cursor",
        providerLabel: "Cursor",
        measurementKind: "billing_period_usage",
        routeKey: "dashboard_usage",
        sourceUrl: "https://cursor.com/cn/dashboard/usage",
        sourceTitle: "Cursor - The best way",
        localePrefix: "cn",
        recommendedSurface: "boot_data",
        billingPeriodLabel: "Mar 23 - Apr 21",
        usageSeriesLabel: "Your usage per day across this billing period",
        visiblePlanLabels: ["Pro", "Pro+", "Ultra"],
        visibleSectionLabels: ["Usage", "Your Usage", "By Model", "Spend"],
        onDemandUsageState: "off",
        exportCsvAvailable: true,
        usedAvailability: "window_only",
        remainingAvailability: "unavailable",
        resetAvailability: "window_only",
        note: "Cursor personal billing-period snapshot",
      },
    };
    createCursorPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot: vi.fn(async () =>
        buildCursorPersonalPageResponse(personalResult),
      ),
    });

    const { snapshot } = await syncCursorProvider({
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
        providerId: "cursor",
        sourcePreference: "official_api",
        selectedKind: "session_page",
        hadFallback: true,
      },
    });
    expect(snapshot.sourceFallbackReason).toBe(
      "Official API unavailable: No Cursor Admin API key is stored.",
    );
    expect(snapshot.sourceFallbackDiagnostic).toMatchObject({
      code: "source.official_api_missing_credential",
      rawMessage: snapshot.sourceFallbackReason,
    });
  });

  it("falls back to Official API when Session page is preferred but the page is not open", async () => {
    const attemptedAt = new Date(2026, 3, 20, 14, 18);
    const cycleStart = new Date(2026, 3, 7).getTime();
    createCursorPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot: vi.fn(async () =>
        buildCursorPersonalPageResponse({
          status: "open_page_required",
          reason:
            "Open the logged-in Cursor dashboard usage page before refreshing personal usage capture.",
          chosenRoute: null,
          routeStatuses: [],
        }),
      ),
    });
    createCursorOfficialClientMock.mockReturnValue({
      getTeamMembers: vi.fn(async () => ({
        teamMembers: [
          { name: "Owner", email: "owner@example.com", role: "owner" },
          { name: "Member", email: "member@example.com", role: "member" },
        ],
      })),
      getTeamSpend: vi.fn(async () => ({
        teamMemberSpend: [],
        subscriptionCycleStart: cycleStart,
        totalMembers: 2,
        totalPages: 1,
      })),
      getDailyUsageData: vi.fn(async () => ({
        data: [
          {
            date: cycleStart,
            isActive: true,
            totalLinesAdded: 0,
            totalLinesDeleted: 0,
            acceptedLinesAdded: 0,
            acceptedLinesDeleted: 0,
            totalApplies: 0,
            totalAccepts: 0,
            totalRejects: 0,
            totalTabsShown: 0,
            totalTabsAccepted: 0,
            composerRequests: 0,
            chatRequests: 150,
            agentRequests: 170,
            cmdkUsages: 0,
            subscriptionIncludedReqs: 320,
            apiKeyReqs: 0,
            usageBasedReqs: 15,
            bugbotUsages: 0,
            mostUsedModel: "gpt-4.1",
          },
        ],
        period: {
          startDate: cycleStart,
          endDate: attemptedAt.getTime(),
        },
      })),
    });

    const { snapshot } = await syncCursorProvider({
      provider: baseProvider,
      secrets: {
        ...emptySecrets,
        cursor: {
          adminApiKey: "cursor-live-key",
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
        providerId: "cursor",
        sourcePreference: "session_page",
        selectedKind: "official_api",
        hadFallback: true,
      },
    });
    expect(snapshot.sourceFallbackReason).toBe(
      "Session page unavailable: Open the logged-in Cursor dashboard usage page before refreshing personal usage capture.",
    );
    expect(snapshot.sourceFallbackDiagnostic).toMatchObject({
      code: "source.session_page_unavailable",
      category: "source_fallback",
      severity: "error",
      rawMessage: snapshot.sourceFallbackReason,
      params: {
        providerId: "cursor",
        sourcePreference: "session_page",
        failedSourceKind: "session_page",
        failureCode: "open_page_required",
      },
    });
  });
});
