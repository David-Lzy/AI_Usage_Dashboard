import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProviderSecrets, ProviderSetting, ProviderSnapshot } from "../types";
import { createEmptyPageBinding } from "../../shared/page-bindings";

const { createClaudeCodeAnalyticsClientMock } = vi.hoisted(() => ({
  createClaudeCodeAnalyticsClientMock: vi.fn(),
}));

vi.mock("./official", () => ({
  createClaudeCodeAnalyticsClient: createClaudeCodeAnalyticsClientMock,
}));

import { syncClaudeCodeProvider } from "./adapter";

const baseProvider: ProviderSnapshot = {
  providerId: "claude-code",
  providerLabel: "Claude Code",
  planName: "Unknown",
  quotaUnit: "sessions",
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
  id: "claude-code",
  label: "Claude Code",
  enabled: true,
  status: "granted",
  credentialStatus: "configured",
  sourcePreference: "auto",
  pageBinding: createEmptyPageBinding(),
  hostsLabel: "api.anthropic.com · platform.claude.com",
  hostOrigins: [
    "https://api.anthropic.com/*",
    "https://platform.claude.com/*",
  ],
  description:
    "Needed for Claude Code Analytics Admin API access and dashboard verification.",
};

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

describe("syncClaudeCodeProvider", () => {
  beforeEach(() => {
    createClaudeCodeAnalyticsClientMock.mockReset();
  });

  it("returns a readable missing-key state when the Claude Admin API key is absent", async () => {
    const attemptedAt = new Date(2026, 3, 20, 12, 34);
    const { snapshot } = await syncClaudeCodeProvider({
      provider: baseProvider,
      secrets: emptySecrets,
      setting: grantedSetting,
      warningThresholdPercent: 80,
      now: attemptedAt,
    });

    expect(snapshot.syncStatus).toBe("error");
    expect(snapshot.tone).toBe("error");
    expect(snapshot.warningReason).toContain("Claude Admin API key");
    expect(snapshot.lastSyncLabel).toBe("Claude Admin API key required");
    expect(createClaudeCodeAnalyticsClientMock).not.toHaveBeenCalled();
  });

  it("normalizes the live Claude analytics response", async () => {
    const attemptedAt = new Date(2026, 3, 20, 12, 34);
    createClaudeCodeAnalyticsClientMock.mockReturnValue({
      getUsageReport: vi.fn(async () => ({
        data: [
          {
            date: "2026-04-19T00:00:00Z",
            actor: {
              type: "user_actor",
              email_address: "alex@company.com",
            },
            organization_id: "org-1",
            customer_type: "api",
            terminal_type: "vscode",
            num_sessions: 3,
            lines_of_code: {
              added: 420,
              removed: 120,
            },
            commits_by_claude_code: 2,
            pull_requests_by_claude_code: 1,
            edit_tool: {
              accepted: 18,
              rejected: 2,
            },
            write_tool: {
              accepted: 7,
              rejected: 1,
            },
            notebook_edit_tool: {
              accepted: 0,
              rejected: 0,
            },
            models: [
              {
                model: "claude-sonnet-4-5-20250929",
                tokens: {
                  input: 230000,
                  output: 87000,
                  cache_read: 55000,
                  cache_creation: 8000,
                },
                estimated_cost: {
                  currency: "USD",
                  amount: 1260,
                },
              },
            ],
          },
          {
            date: "2026-04-19T00:00:00Z",
            actor: {
              type: "user_actor",
              email_address: "morgan@company.com",
            },
            organization_id: "org-1",
            customer_type: "api",
            terminal_type: "iTerm.app",
            num_sessions: 2,
            lines_of_code: {
              added: 110,
              removed: 20,
            },
            commits_by_claude_code: 1,
            pull_requests_by_claude_code: 0,
            edit_tool: {
              accepted: 6,
              rejected: 3,
            },
            write_tool: {
              accepted: 2,
              rejected: 1,
            },
            notebook_edit_tool: {
              accepted: 0,
              rejected: 0,
            },
            models: [
              {
                model: "claude-sonnet-4-5-20250929",
                tokens: {
                  input: 101000,
                  output: 32000,
                  cache_read: 15000,
                  cache_creation: 4000,
                },
                estimated_cost: {
                  currency: "USD",
                  amount: 585,
                },
              },
            ],
          },
        ],
        has_more: false,
        next_page: null,
      })),
    });

    const { snapshot } = await syncClaudeCodeProvider({
      provider: baseProvider,
      secrets: {
        cursor: {
          adminApiKey: null,
        },
      "claude-code": {
        adminApiKey: "sk-ant-admin-test",
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

    expect(snapshot.providerLabel).toBe("Claude Code");
    expect(snapshot.planName).toBe("Analytics Admin API (API org, 2 members)");
    expect(snapshot.quotaUnit).toBe("sessions");
    expect(snapshot.quotaWindow).toBe("daily");
    expect(snapshot.used).toBe(5);
    expect(snapshot.remaining).toBeNull();
    expect(snapshot.total).toBeNull();
    expect(snapshot.resetAt).toBe("2026-04-19 UTC");
    expect(snapshot.syncStatus).toBe("warning");
    expect(snapshot.tone).toBe("warning");
    expect(snapshot.warningReason).toBe(
      "5 sessions · 530 lines added · $18.45 estimated cost on 2026-04-19 UTC",
    );
    expect(snapshot.lastSyncLabel).toBe("Claude Code Analytics API synced just now");
    expect(snapshot.syncedAt).toBe("2026-04-20 12:34");
    expect(createClaudeCodeAnalyticsClientMock).toHaveBeenCalledWith({
      source: "live",
      apiKey: "sk-ant-admin-test",
    });
  });

  it("maps Claude analytics catch failures to a typed adapter diagnostic", async () => {
    const attemptedAt = new Date(2026, 3, 20, 12, 34);
    createClaudeCodeAnalyticsClientMock.mockReturnValue({
      getUsageReport: vi.fn(async () => {
        throw new Error("Claude analytics endpoint returned 502.");
      }),
    });

    const { snapshot } = await syncClaudeCodeProvider({
      provider: baseProvider,
      secrets: {
        ...emptySecrets,
        "claude-code": {
          adminApiKey: "sk-ant-admin-test",
        },
      },
      setting: grantedSetting,
      warningThresholdPercent: 80,
      now: attemptedAt,
    });

    expect(snapshot.syncStatus).toBe("error");
    expect(snapshot.tone).toBe("error");
    expect(snapshot.warningReason).toBe(
      "Claude analytics endpoint returned 502.",
    );
    expect(snapshot.warningDiagnostic).toMatchObject({
      code: "adapter.unexpected_error",
      category: "adapter_error",
      severity: "error",
      rawMessage: snapshot.warningReason,
      params: {
        providerId: "claude-code",
        adapterErrorKind: "unexpected_error",
        sourceKind: "official_api",
        failureCode: "sync_error",
        parserStage: "analytics_api",
      },
    });
    expect(snapshot.lastSyncLabel).toBe("Claude analytics sync failed just now");
  });

  it("returns a readable unsupported-state message when Admin API access is missing", async () => {
    const attemptedAt = new Date(2026, 3, 20, 12, 34);
    const { snapshot } = await syncClaudeCodeProvider({
      provider: baseProvider,
      secrets: emptySecrets,
      setting: {
        ...grantedSetting,
        status: "missing",
      },
      warningThresholdPercent: 80,
      now: attemptedAt,
    });

    expect(snapshot.syncStatus).toBe("error");
    expect(snapshot.tone).toBe("error");
    expect(snapshot.warningReason).toContain(
      "organizations with Admin API access",
    );
    expect(snapshot.warningReason).toContain("personal Pro or Max");
    expect(snapshot.lastSyncLabel).toBe("Claude Admin API access required");
  });
});
