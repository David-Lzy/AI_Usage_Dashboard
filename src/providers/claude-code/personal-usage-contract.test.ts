import { describe, expect, it } from "vitest";

import fixture from "../../../fixtures/claude/personal-usage-contract.fixture.json";
import {
  detectClaudePersonalPlanIdentity,
  extractClaudePersonalUsageContract,
  MAX_CLAUDE_PERSONAL_RESPONSE_LENGTH,
} from "./personal-usage-contract";

function observedEntry(path: string, body: unknown) {
  return {
    url: `https://claude.ai/api/organizations/redacted${path}`,
    method: "GET",
    status: 200,
    ok: true,
    contentType: "application/json",
    bodyText: JSON.stringify(body),
    capturedAt: "2026-07-21T00:00:00.000Z",
    transport: "fetch" as const,
  };
}

describe("Claude personal usage contract", () => {
  it("allowlists structured usage windows and keeps credits separate", () => {
    const contract = extractClaudePersonalUsageContract(
      [
        observedEntry("/usage", {
          ...fixture.usage,
          organization_id: "must-not-survive",
          private_account: { email: "private@example.com" },
        }),
        observedEntry("/prepaid/credits", fixture.credits),
      ],
      [fixture.domFallback.heading, ...fixture.domFallback.rows],
    );
    const serialized = JSON.stringify(contract);

    expect(contract?.planIdentity).toEqual({
      kind: "pro",
      label: "Claude Pro",
    });
    expect(contract?.limits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "session",
          usedPercent: 23,
          remainingPercent: 77,
        }),
        expect.objectContaining({
          kind: "weekly_all",
          usedPercent: 11,
          remainingPercent: 89,
        }),
      ]),
    );
    expect(contract?.credits).toEqual({
      amount: 0,
      currency: null,
      balanceCredits: null,
      nextExpiresAt: null,
    });
    expect(serialized).not.toMatch(
      /organization_id|must-not-survive|private@example|private_account/i,
    );
  });

  it("uses compatibility windows only when limits are absent", () => {
    const contract = extractClaudePersonalUsageContract([
      observedEntry("/usage", {
        five_hour: { utilization: 20, resets_at: "2026-07-21T10:00:00Z" },
        seven_day: { utilization: 40, resets_at: "2026-07-27T10:00:00Z" },
      }),
    ]);

    expect(contract?.limits.map((limit) => limit.kind)).toEqual([
      "session",
      "weekly_all",
    ]);
  });

  it("keeps a top-level session window when its limits row is not currently active", () => {
    const contract = extractClaudePersonalUsageContract([
      observedEntry("/usage", {
        five_hour: { utilization: 1, resets_at: "2026-07-21T10:09:59Z" },
        seven_day: { utilization: 6, resets_at: "2026-07-27T11:59:59Z" },
        limits: [
          {
            kind: "session",
            group: "session",
            percent: 1,
            resets_at: "2026-07-21T10:09:59Z",
            is_active: false,
          },
          {
            kind: "weekly_all",
            group: "weekly",
            percent: 6,
            resets_at: "2026-07-27T11:59:59Z",
            is_active: true,
          },
        ],
      }),
    ]);

    expect(contract?.limits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "session",
          usedPercent: 1,
          remainingPercent: 99,
          resetsAt: "2026-07-21T10:09:59Z",
          isActive: true,
        }),
        expect.objectContaining({
          kind: "weekly_all",
          usedPercent: 6,
          remainingPercent: 94,
          resetsAt: "2026-07-27T11:59:59Z",
          isActive: true,
        }),
      ]),
    );
  });

  it("distinguishes only explicit individual plan labels", () => {
    expect(detectClaudePersonalPlanIdentity(["Plan usage limits Pro"])).toEqual({
      kind: "pro",
      label: "Claude Pro",
    });
    expect(detectClaudePersonalPlanIdentity(["Claude Max 5x plan"])).toEqual({
      kind: "max_5x",
      label: "Claude Max 5x",
    });
    expect(detectClaudePersonalPlanIdentity(["Claude Max 20x plan"])).toEqual({
      kind: "max_20x",
      label: "Claude Max 20x",
    });
    expect(detectClaudePersonalPlanIdentity(["Claude Team plan"])).toBeNull();
  });

  it("rejects malformed, oversized, unrelated, and out-of-range evidence", () => {
    expect(
      extractClaudePersonalUsageContract([
        observedEntry("/usage", {
          limits: [
            {
              kind: "session",
              group: "session",
              percent: 101,
              is_active: true,
            },
          ],
        }),
      ])?.limits,
    ).toEqual([]);
    expect(
      extractClaudePersonalUsageContract([
        {
          ...observedEntry("/usage", {}),
          bodyText: "x".repeat(MAX_CLAUDE_PERSONAL_RESPONSE_LENGTH + 1),
        },
      ]),
    ).toBeNull();
    expect(
      extractClaudePersonalUsageContract([
        observedEntry("/api/account", fixture.usage),
      ]),
    ).toBeNull();
  });
});
