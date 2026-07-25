/**
 * Test suite: Claude snapshot preservation — stale data on error state (P2 fix)
 * Module under test: src/providers/claude-code/adapter.ts
 *
 * Before the fix, every page-session error reset usageWindows and usageFacts to
 * undefined, blanking the UI immediately after the tab closed. The fix preserves
 * the last successful windows and facts from the previous provider snapshot so
 * the UI can show "last seen" context while the warning banner signals the data
 * is not live.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  ProviderSecrets,
  ProviderSetting,
  ProviderSnapshot,
  ProviderUsageWindow,
} from "../../types";
import { createEmptyPageBinding } from "../../../shared/page-bindings";

const {
  createClaudeCodeAnalyticsClientMock,
  createClaudePersonalPageClientMock,
} = vi.hoisted(() => ({
  createClaudeCodeAnalyticsClientMock: vi.fn(),
  createClaudePersonalPageClientMock: vi.fn(),
}));

vi.mock("../official", () => ({
  createClaudeCodeAnalyticsClient: createClaudeCodeAnalyticsClientMock,
}));
vi.mock("../personal-page-client", () => ({
  createClaudePersonalPageClient: createClaudePersonalPageClientMock,
}));

import { syncClaudeCodeProvider } from "../adapter";

const previousUsageWindows: ProviderUsageWindow[] = [
  {
    label: "Weekly usage window",
    normalizedLabel: "Weekly usage window",
    kind: "weekly",
    modelLabel: null,
    quotaUnit: "percent",
    used: 45,
    remaining: 55,
    total: 100,
    resetAt: "2026-06-09 00:00",
    resetLabel: "Weekly usage window resets at 2026-06-09 00:00",
  },
];

const snapshotWithWindows: ProviderSnapshot = {
  providerId: "claude-code-team-page",
  providerLabel: "Claude Code",
  planName: "Claude Team Usage Page (Weekly usage window)",
  quotaUnit: "percent",
  quotaWindow: "rolling",
  used: 45,
  remaining: 55,
  total: 100,
  resetAt: "2026-06-09 00:00",
  resetLabel: "Weekly usage window resets at 2026-06-09 00:00",
  syncedAt: "2026-06-01T09:00:00.000Z",
  syncSource: "page_parse",
  syncStatus: "ok",
  warningReason: null,
  lastSyncLabel: "Claude usage page synced just now",
  sourceSelectionReason: "",
  sourceFallbackReason: null,
  tone: "neutral",
  usageWindows: previousUsageWindows,
  usageFacts: [{ label: "Plan", value: "Team", detail: null }],
  usageSummary: "Visible Claude usage: Weekly usage window: 55% remaining",
};

const snapshotWithoutWindows: ProviderSnapshot = {
  ...snapshotWithWindows,
  usageWindows: undefined,
  usageFacts: undefined,
  usageSummary: null,
};

const sessionSetting: ProviderSetting = {
  id: "claude-code-team-page",
  brandId: "claude-code",
  label: "Claude Team Usage Page",
  displayEnabled: true,
  enabled: true,
  status: "granted",
  credentialStatus: "configured",
  sourceKind: "session_page",
  connectionMode: "page_session",
  sourcePreference: "session_page",
  pageBinding: createEmptyPageBinding(),
  hostsLabel: "claude.ai",
  hostOrigins: ["https://claude.ai/*"],
  description: "Uses the logged-in Claude Team usage page.",
};

const emptySecrets: ProviderSecrets = {
  "cursor-team-api": { adminApiKey: null },
  "claude-code-admin-api": { adminApiKey: null },
  "codex-enterprise-api": { analyticsApiKey: null, workspaceId: null },
  "sub2api-api-key": { apiKey: null },
};

function makeOpenPageRequiredClient() {
  return {
    getUsageSnapshot: vi.fn(async () => ({
      result: {
        status: "open_page_required" as const,
        reason: "Open the logged-in Claude settings usage page before refreshing.",
        chosenRoute: null,
        routeStatuses: [
          {
            routeKey: "settings_usage" as const,
            status: "not_found" as const,
            matchedUrl: null,
          },
        ],
      },
      pageBinding: createEmptyPageBinding(),
    })),
  };
}

describe("syncClaudeCodeProvider / stale snapshot preservation (P2)", () => {
  beforeEach(() => {
    createClaudeCodeAnalyticsClientMock.mockReset();
    createClaudePersonalPageClientMock.mockReset();
  });

  describe("given a provider with previous usageWindows when the page session fails", () => {
    it("should preserve usageWindows in the error snapshot (P2 fix)", async () => {
      createClaudePersonalPageClientMock.mockReturnValue(makeOpenPageRequiredClient());

      const { snapshot } = await syncClaudeCodeProvider({
        provider: snapshotWithWindows,
        secrets: emptySecrets,
        setting: sessionSetting,
        warningThresholdPercent: 80,
        now: new Date(2026, 5, 1, 10, 0),
        trigger: "manual",
      });

      expect(snapshot.syncStatus).toBe("warning");
      expect(snapshot.usageWindows).toEqual(previousUsageWindows);
    });

    it("should preserve usageFacts in the error snapshot", async () => {
      createClaudePersonalPageClientMock.mockReturnValue(makeOpenPageRequiredClient());

      const { snapshot } = await syncClaudeCodeProvider({
        provider: snapshotWithWindows,
        secrets: emptySecrets,
        setting: sessionSetting,
        warningThresholdPercent: 80,
        now: new Date(2026, 5, 1, 10, 0),
        trigger: "manual",
      });

      expect(snapshot.usageFacts).toEqual([{ label: "Plan", value: "Team", detail: null }]);
    });

    it("should still mark the snapshot as warning so the UI signals data is not live", async () => {
      createClaudePersonalPageClientMock.mockReturnValue(makeOpenPageRequiredClient());

      const { snapshot } = await syncClaudeCodeProvider({
        provider: snapshotWithWindows,
        secrets: emptySecrets,
        setting: sessionSetting,
        warningThresholdPercent: 80,
        now: new Date(2026, 5, 1, 10, 0),
        trigger: "manual",
      });

      expect(snapshot.syncStatus).toBe("warning");
      expect(snapshot.tone).toBe("warning");
    });
  });

  describe("given a provider with NO previous usageWindows when the page session fails", () => {
    it("should leave usageWindows as undefined rather than showing empty data", async () => {
      createClaudePersonalPageClientMock.mockReturnValue(makeOpenPageRequiredClient());

      const { snapshot } = await syncClaudeCodeProvider({
        provider: snapshotWithoutWindows,
        secrets: emptySecrets,
        setting: sessionSetting,
        warningThresholdPercent: 80,
        now: new Date(2026, 5, 1, 10, 0),
        trigger: "manual",
      });

      expect(snapshot.usageWindows).toBeUndefined();
      expect(snapshot.usageFacts).toBeUndefined();
    });
  });
});
