import { beforeEach, describe, expect, it, vi } from "vitest";
import usageBillingFixture from "../../../fixtures/cursor/usage-billing.fixture.json";

import type { ProviderSecrets, ProviderSetting, ProviderSnapshot } from "../types";
import { createEmptyPageBinding } from "../../shared/page-bindings";
import type { CursorPersonalParseResult } from "./personal-page-parser";
import type { CursorUsageBillingContractFixture } from "./usage-billing-contract";

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
  providerId: "cursor-personal-page",
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
  id: "cursor-personal-page",
  brandId: "cursor",
  label: "Cursor",
  displayEnabled: true,
  enabled: true,
  status: "granted",
  credentialStatus: "configured",
  sourceKind: "session_page",
  connectionMode: "page_session",
  sourcePreference: "auto",
  pageBinding: createEmptyPageBinding(),
  hostsLabel: "api.cursor.com · cursor.com",
  hostOrigins: ["https://api.cursor.com/*", "https://cursor.com/*"],
  description:
    "Uses the team Admin API when a key is configured, or the logged-in personal usage page when no key is stored.",
};

const teamProvider: ProviderSnapshot = {
  ...baseProvider,
  providerId: "cursor-team-api",
  providerLabel: "Cursor Team API",
};

const teamSetting: ProviderSetting = {
  ...grantedSetting,
  id: "cursor-team-api",
  label: "Cursor Team Admin API",
  sourceKind: "official_api",
  connectionMode: "credential",
  sourcePreference: "official_api",
  hostsLabel: "api.cursor.com",
  hostOrigins: ["https://api.cursor.com/*"],
  description: "Uses the Cursor Team Admin API with a stored API key.",
};

function buildCursorPersonalPageResponse(result: CursorPersonalParseResult) {
  return {
    result,
    pageBinding: createEmptyPageBinding(),
  };
}

const emptySecrets: ProviderSecrets = {
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
};

describe("syncCursorProvider", () => {
  beforeEach(() => {
    createCursorOfficialClientMock.mockReset();
    createCursorPersonalPageClientMock.mockReset();
  });

  it("uses the personal usage-page path when no Cursor Admin API key is configured", async () => {
    const attemptedAt = new Date(2026, 3, 20, 14, 18);
    const contractFixture =
      usageBillingFixture as CursorUsageBillingContractFixture;
    const personalResult: CursorPersonalParseResult = {
      status: "ok",
      snapshot: {
        providerId: "cursor-personal-page",
        providerLabel: "Cursor",
        capturedAt: "2026-04-20T04:48:00.000Z",
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
        spendCards: [
          {
            label: "Total spend",
            normalizedLabel: "total_spend",
            amountText: "$0",
            amount: 0,
            currency: "USD",
          },
          {
            label: "Included",
            normalizedLabel: "included",
            amountText: "$0",
            amount: 0,
            currency: "USD",
          },
          {
            label: "On-demand",
            normalizedLabel: "on_demand",
            amountText: "$0",
            amount: 0,
            currency: "USD",
          },
        ],
        onDemandUsageState: "off",
        exportCsvAvailable: true,
        usageBillingContract: {
          usageSummary: contractFixture.usageSummary,
          planInfo: contractFixture.planInfo,
          hardLimit: contractFixture.hardLimit,
          usageEvents: contractFixture.usageEvents,
        },
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
    expect(snapshot.cursorUsage).toMatchObject({
      billingCycleStart: contractFixture.usageSummary.billingCycleStart,
      planName: contractFixture.planInfo.planInfo?.planName,
      history: {
        capturedEventCount: 2,
        complete: true,
      },
    });
    expect(snapshot.resetAt).toBe("Mar 23 - Apr 21");
    expect(snapshot.resetLabel).toBe(
      "Your usage per day across this billing period",
    );
    expect(snapshot.syncStatus).toBe("ok");
    expect(snapshot.tone).toBe("neutral");
    expect(snapshot.warningReason).toBe("On-demand usage is off.");
    expect(snapshot.warningDiagnostic).toMatchObject({
      code: "usage.on_demand_off",
      category: "usage_threshold",
      severity: "info",
      rawMessage: snapshot.warningReason,
      params: {
        providerId: "cursor-personal-page",
        usageThresholdKind: "on_demand_off",
        unitLabel: "requests",
      },
    });
    expect(snapshot.usageWindows).toBeUndefined();
    expect(snapshot.usageBalances).toBeUndefined();
    expect(snapshot.usageFacts).toEqual([
      {
        label: "Billing period",
        value: "Mar 23 - Apr 21",
        detail: "Your usage per day across this billing period",
      },
      {
        label: "Total spend",
        value: "$0",
        detail: "Current selected period",
        tone: "neutral",
      },
      {
        label: "Included",
        value: "$0",
        detail: "Plan-included spend shown by Cursor",
        tone: "neutral",
      },
      {
        label: "On-demand",
        value: "$0",
        detail: "Usage-based spend shown by Cursor",
        tone: "neutral",
      },
    ]);
    expect(snapshot.usageSummary).toBe(
      "Visible Cursor usage: Visible plans: Pro · Pro+ · Ultra · On-demand usage is off. · CSV export available",
    );
    expect(snapshot.lastSyncLabel).toBe("Cursor personal fixture loaded");
    expect(snapshot.sourceSelectionReason).toBe(
      "Session page is the only shipped source for cursor-personal-page.",
    );
    expect(snapshot.sourceSelectionDiagnostic).toMatchObject({
      code: "source.preference_selected_session_page",
      category: "source_selection",
      severity: "info",
      rawMessage: snapshot.sourceSelectionReason,
      params: {
        providerId: "cursor-personal-page",
        sourcePreference: "session_page",
        selectedKind: "session_page",
        hadFallback: false,
      },
    });
    expect(snapshot.sourceFallbackReason).toBeNull();
    expect(snapshot.sourceFallbackDiagnostic).toBeNull();
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
      provider: teamProvider,
      secrets: {
        "cursor-team-api": {
          adminApiKey: "cursor-live-key",
        },
      "claude-code-admin-api": {
        adminApiKey: null,
      },
      "codex-enterprise-api": {
        analyticsApiKey: null,
        workspaceId: null,
      },
    },
      setting: teamSetting,
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
    expect(snapshot.total).toBeNull();
    expect(snapshot.remaining).toBeNull();
    expect(snapshot.resetAt).toBe("2026-05-07");
    expect(snapshot.syncStatus).toBe("warning");
    expect(snapshot.tone).toBe("warning");
    expect(snapshot.warningReason).toBe(
      "15 pay-per-use requests recorded this cycle",
    );
    expect(snapshot.usageWindows).toBeUndefined();
    expect(snapshot.usageBalances).toBeUndefined();
    expect(snapshot.usageSummary).toBeNull();
    expect(snapshot.warningDiagnostic).toMatchObject({
      code: "usage.overage_detected",
      category: "usage_threshold",
      severity: "warning",
      rawMessage: snapshot.warningReason,
      params: {
        providerId: "cursor-team-api",
        usageThresholdKind: "overage_detected",
        overageCount: 15,
        unitLabel: "requests",
      },
    });
    expect(snapshot.lastSyncLabel).toBe("Cursor Admin API synced just now");
    expect(snapshot.sourceSelectionReason).toBe(
      "Official API is the only shipped source for cursor-team-api.",
    );
    expect(snapshot.sourceSelectionDiagnostic).toMatchObject({
      code: "source.preference_selected_official_api",
      category: "source_selection",
      severity: "info",
      rawMessage: snapshot.sourceSelectionReason,
      params: {
        providerId: "cursor-team-api",
        sourcePreference: "official_api",
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
      provider: teamProvider,
      secrets: emptySecrets,
      setting: {
        ...teamSetting,
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
        providerId: "cursor-team-api",
        sourceKind: "official_api",
        hostLabel: "api.cursor.com",
      },
    });
    expect(snapshot.lastSyncLabel).toBe("Cursor Admin API access required");
    expect(snapshot.sourceSelectionReason).toBe(
      "Official API preference could not find an available live source.",
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

    expect(snapshot.syncSource).toBe("page_parse");
    expect(snapshot.syncStatus).toBe("warning");
    expect(snapshot.tone).toBe("warning");
    expect(snapshot.warningReason).toContain(
      "Open the logged-in Cursor dashboard usage page",
    );
    expect(snapshot.warningDiagnostic).toMatchObject({
      code: "page_session.open_page_required",
      category: "page_session",
      severity: "warning",
      rawMessage: snapshot.warningReason,
      params: {
        providerId: "cursor-personal-page",
        pageSessionKind: "open_page_required",
      },
    });
    expect(snapshot.lastSyncLabel).toBe("Cursor usage page not open");
    expect(snapshot.usageSummary).toBeNull();
    expect(snapshot.sourceFallbackReason).toBeNull();
    expect(snapshot.sourceFallbackDiagnostic).toBeNull();
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
        providerId: "cursor-personal-page",
        pageSessionKind: "open_page_required",
      },
    });
    expect(snapshot.sourceSelectionReason).toBe(
      "Session page preference could not find an available live source.",
    );
    expect(snapshot.sourceFallbackReason).toBeNull();
  });

  it("keeps capture-unavailable page-session diagnostics visible when a bound Cursor tab cannot be read", async () => {
    const attemptedAt = new Date(2026, 3, 20, 14, 18);
    createCursorPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot: vi.fn(async () =>
        buildCursorPersonalPageResponse({
          status: "capture_unavailable",
          reason:
            "The open Cursor dashboard usage page could not be read by the extension. Reload the page, confirm host access, then refresh again.",
          chosenRoute: null,
          routeStatuses: [
            {
              routeKey: "dashboard_usage",
              status: "capture_unavailable",
              matchedUrl: null,
            },
          ],
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
    expect(snapshot.syncStatus).toBe("error");
    expect(snapshot.warningReason).toBe(
      "The open Cursor dashboard usage page could not be read by the extension. Reload the page, confirm host access, then refresh again.",
    );
    expect(snapshot.warningDiagnostic).toMatchObject({
      code: "page_session.capture_unavailable",
      category: "page_session",
      severity: "error",
      rawMessage: snapshot.warningReason,
      params: {
        providerId: "cursor-personal-page",
        pageSessionKind: "capture_unavailable",
      },
    });
    expect(snapshot.resetLabel).toBe(
      "Reload the Cursor dashboard usage page and refresh again",
    );
    expect(snapshot.lastSyncLabel).toBe("Cursor usage page unavailable");
    expect(snapshot.sourceFallbackReason).toBeNull();
  });

  it("maps Cursor parser route drift to a typed adapter parse diagnostic", async () => {
    const attemptedAt = new Date(2026, 3, 20, 14, 18);
    createCursorPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot: vi.fn(async () =>
        buildCursorPersonalPageResponse({
          status: "route_drift",
          reason:
            "The matched Cursor usage page no longer exposed parseable billing-period usage signals.",
          chosenRoute: "dashboard_usage",
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
      "The matched Cursor usage page no longer exposed parseable billing-period usage signals.",
    );
    expect(snapshot.warningDiagnostic).toMatchObject({
      code: "adapter.parse_failed",
      category: "adapter_error",
      severity: "error",
      rawMessage: snapshot.warningReason,
      params: {
        providerId: "cursor-personal-page",
        adapterErrorKind: "parse_failed",
        sourceKind: "session_page",
        failureCode: "route_drift",
        parserStage: "personal_usage_page",
      },
    });
    expect(snapshot.lastSyncLabel).toBe("Cursor usage page parse failed");
    expect(snapshot.sourceFallbackReason).toBeNull();
  });

  it("falls back to the personal page when Official API is preferred but the Admin API key is missing", async () => {
    const attemptedAt = new Date(2026, 3, 20, 14, 18);
    const personalResult: CursorPersonalParseResult = {
      status: "ok",
      snapshot: {
        providerId: "cursor-personal-page",
        providerLabel: "Cursor",
        capturedAt: "2026-04-20T04:48:00.000Z",
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
        spendCards: [],
        onDemandUsageState: "off",
        exportCsvAvailable: true,
        usageBillingContract: null,
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
    expect(snapshot.warningDiagnostic).toMatchObject({
      code: "usage.on_demand_off",
      category: "usage_threshold",
      severity: "info",
      rawMessage: "On-demand usage is off.",
      params: {
        providerId: "cursor-personal-page",
        usageThresholdKind: "on_demand_off",
        unitLabel: "requests",
      },
    });
    expect(snapshot.usageSummary).toBe(
      "Visible Cursor usage: Visible plans: Pro · Pro+ · Ultra · On-demand usage is off. · CSV export available",
    );
    expect(snapshot.sourceSelectionReason).toBe(
      "Session page is the only shipped source for cursor-personal-page.",
    );
    expect(snapshot.sourceSelectionDiagnostic).toMatchObject({
      code: "source.preference_selected_session_page",
      rawMessage: snapshot.sourceSelectionReason,
      params: {
        providerId: "cursor-personal-page",
        sourcePreference: "session_page",
        selectedKind: "session_page",
        hadFallback: false,
      },
    });
    expect(snapshot.sourceFallbackReason).toBeNull();
    expect(snapshot.sourceFallbackDiagnostic).toBeNull();
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
        "cursor-team-api": {
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

    expect(snapshot.syncSource).toBe("page_parse");
    expect(snapshot.sourceSelectionReason).toBe(
      "Session page preference could not find an available live source.",
    );
    expect(snapshot.sourceSelectionDiagnostic).toBeNull();
    expect(snapshot.sourceFallbackReason).toBeNull();
    expect(snapshot.sourceFallbackDiagnostic).toBeNull();
  });

  it("enables managed Cursor page opening on alarm after a page binding exists", async () => {
    const attemptedAt = new Date(2026, 4, 4, 9, 15);
    const getUsageSnapshot = vi.fn(async () =>
      buildCursorPersonalPageResponse({
        status: "open_page_required",
        reason:
          "Open the logged-in Cursor dashboard usage page before refreshing personal usage capture.",
        chosenRoute: null,
        routeStatuses: [],
      }),
    );
    createCursorPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot,
    });

    await syncCursorProvider({
      provider: baseProvider,
      secrets: emptySecrets,
      setting: {
        ...grantedSetting,
        sourcePreference: "session_page",
        pageBinding: {
          mode: "auto",
          status: "stale",
          tabId: 51,
          matchedUrl: "https://cursor.com/cn/dashboard/usage",
          matchedTitle: "Cursor - Usage",
          updatedAt: "2026-05-04T09:00:00.000Z",
        },
      },
      warningThresholdPercent: 80,
      now: attemptedAt,
      trigger: "alarm",
    });

    expect(createCursorPersonalPageClientMock).toHaveBeenCalledWith({
      source: "fixture",
      openPageWhenMissing: true,
    });
    expect(getUsageSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "stale",
        matchedUrl: "https://cursor.com/cn/dashboard/usage",
      }),
    );
  });

  it("enables managed Cursor page opening on alarm before a page binding exists", async () => {
    const attemptedAt = new Date(2026, 4, 4, 9, 20);
    const getUsageSnapshot = vi.fn(async () =>
      buildCursorPersonalPageResponse({
        status: "open_page_required",
        reason:
          "Open the logged-in Cursor dashboard usage page before refreshing personal usage capture.",
        chosenRoute: null,
        routeStatuses: [],
      }),
    );
    createCursorPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot,
    });

    await syncCursorProvider({
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

    expect(createCursorPersonalPageClientMock).toHaveBeenCalledWith({
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

  it("does not auto-open the Cursor page repeatedly on alarms after logged-out detection", async () => {
    const attemptedAt = new Date(2026, 4, 4, 9, 25);
    createCursorPersonalPageClientMock.mockReturnValue({
      getUsageSnapshot: vi.fn(async () =>
        buildCursorPersonalPageResponse({
          status: "logged_out",
          reason:
            "The current Cursor tab matched a logged-out state instead of a usable usage page.",
          chosenRoute: null,
          routeStatuses: [],
        }),
      ),
    });

    await syncCursorProvider({
      provider: {
        ...baseProvider,
        warningDiagnostic: {
          code: "page_session.logged_out",
          category: "page_session",
          severity: "warning",
          rawMessage:
            "The current Cursor tab matched a logged-out state instead of a usable usage page.",
        },
      },
      secrets: emptySecrets,
      setting: {
        ...grantedSetting,
        sourcePreference: "session_page",
        pageBinding: {
          mode: "auto",
          status: "stale",
          tabId: 51,
          matchedUrl: "https://cursor.com/cn/dashboard/usage",
          matchedTitle: "Cursor - Usage",
          updatedAt: "2026-05-04T09:00:00.000Z",
        },
      },
      warningThresholdPercent: 80,
      now: attemptedAt,
      trigger: "alarm",
    });

    expect(createCursorPersonalPageClientMock).toHaveBeenCalledWith({
      source: "fixture",
      openPageWhenMissing: false,
    });
  });
});
