/**
 * Test suite: Claude session reconnect — shouldOpenClaudePageWhenMissing (P0 fix)
 * Module under test: src/providers/claude-code/adapter.ts
 *
 * Before the fix, a single logged_out alarm result permanently disabled
 * openPageWhenMissing, even for personal Pro/Max accounts that had previously
 * established a valid page binding. A background tab opened by the extension can
 * transiently show the upgrade page during Next.js hydration, producing a false
 * logged_out that must not break the reconnect loop when a fingerprint exists.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  ProviderDiagnostic,
  ProviderSecrets,
  ProviderSetting,
  ProviderSnapshot,
} from "../../types";
import {
  createBoundPageBinding,
  createEmptyPageBinding,
} from "../../../shared/page-bindings";

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

const loggedOutDiagnostic: ProviderDiagnostic = {
  code: "page_session.logged_out",
  category: "page_session",
  severity: "warning",
  rawMessage: "Claude usage page session missing.",
};

const warningSnapshot: ProviderSnapshot = {
  providerId: "claude-code-team-page",
  providerLabel: "Claude Code",
  planName: "Claude Team Usage Page",
  quotaUnit: "percent",
  quotaWindow: "rolling",
  used: null,
  remaining: null,
  total: 100,
  resetAt: "Visible Claude usage page",
  resetLabel: "Open the page",
  syncedAt: "2026-06-01T10:00:00.000Z",
  syncSource: "page_parse",
  syncStatus: "warning",
  warningReason: "Claude usage page not open",
  lastSyncLabel: "Claude usage page not open",
  sourceSelectionReason: "",
  sourceFallbackReason: null,
  tone: "warning",
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

function makePageNotFoundClient() {
  return {
    getUsageSnapshot: vi.fn(async () => ({
      result: {
        status: "open_page_required" as const,
        reason: "Open the logged-in Claude settings usage page before refreshing.",
        chosenRoute: null,
        routeStatuses: [
          { routeKey: "settings_usage" as const, status: "not_found" as const, matchedUrl: null },
        ],
      },
      pageBinding: createEmptyPageBinding(),
    })),
  };
}

describe("shouldOpenClaudePageWhenMissing (P0 — logged_out cascade fix)", () => {
  beforeEach(() => {
    createClaudeCodeAnalyticsClientMock.mockReset();
    createClaudePersonalPageClientMock.mockReset();
  });

  describe("given a logged_out alarm with NO prior page binding fingerprint", () => {
    it("should pass openPageWhenMissing: false to avoid opening tabs for accounts that never had a session", async () => {
      createClaudePersonalPageClientMock.mockReturnValue(makePageNotFoundClient());

      await syncClaudeCodeProvider({
        provider: { ...warningSnapshot, warningDiagnostic: loggedOutDiagnostic },
        secrets: emptySecrets,
        setting: { ...sessionSetting, pageBinding: createEmptyPageBinding() },
        warningThresholdPercent: 80,
        now: new Date(2026, 5, 1, 10, 0),
        trigger: "alarm",
      });

      expect(createClaudePersonalPageClientMock).toHaveBeenCalledWith(
        expect.objectContaining({ openPageWhenMissing: false }),
      );
    });
  });

  describe("given a logged_out alarm WITH a prior page binding fingerprint (P0 fix)", () => {
    it("should pass openPageWhenMissing: true so the extension retries reconnecting", async () => {
      createClaudePersonalPageClientMock.mockReturnValue(makePageNotFoundClient());

      await syncClaudeCodeProvider({
        provider: { ...warningSnapshot, warningDiagnostic: loggedOutDiagnostic },
        secrets: emptySecrets,
        setting: {
          ...sessionSetting,
          pageBinding: createBoundPageBinding({
            tabId: 42,
            matchedUrl: "https://claude.ai/settings/usage",
            matchedTitle: "Claude",
            updatedAt: "2026-06-01T09:00:00.000Z",
          }),
        },
        warningThresholdPercent: 80,
        now: new Date(2026, 5, 1, 10, 0),
        trigger: "alarm",
      });

      expect(createClaudePersonalPageClientMock).toHaveBeenCalledWith(
        expect.objectContaining({ openPageWhenMissing: true }),
      );
    });
  });

  describe("given trigger: bootstrap", () => {
    it("should never open a page regardless of diagnostic or binding state", async () => {
      createClaudePersonalPageClientMock.mockReturnValue(makePageNotFoundClient());

      await syncClaudeCodeProvider({
        provider: { ...warningSnapshot, warningDiagnostic: loggedOutDiagnostic },
        secrets: emptySecrets,
        setting: {
          ...sessionSetting,
          pageBinding: createBoundPageBinding({
            tabId: 42,
            updatedAt: "2026-06-01T09:00:00.000Z",
          }),
        },
        warningThresholdPercent: 80,
        now: new Date(2026, 5, 1, 10, 0),
        trigger: "bootstrap",
      });

      expect(createClaudePersonalPageClientMock).toHaveBeenCalledWith(
        expect.objectContaining({ openPageWhenMissing: false }),
      );
    });
  });

  describe("given trigger: manual with an existing binding fingerprint", () => {
    it("should open the page because manual triggers are not subject to the logged_out alarm guard", async () => {
      createClaudePersonalPageClientMock.mockReturnValue(makePageNotFoundClient());

      await syncClaudeCodeProvider({
        provider: { ...warningSnapshot, warningDiagnostic: loggedOutDiagnostic },
        secrets: emptySecrets,
        setting: {
          ...sessionSetting,
          pageBinding: createBoundPageBinding({
            tabId: 7,
            updatedAt: "2026-06-01T08:00:00.000Z",
          }),
        },
        warningThresholdPercent: 80,
        now: new Date(2026, 5, 1, 10, 0),
        trigger: "manual",
      });

      expect(createClaudePersonalPageClientMock).toHaveBeenCalledWith(
        expect.objectContaining({ openPageWhenMissing: true }),
      );
    });
  });
});
