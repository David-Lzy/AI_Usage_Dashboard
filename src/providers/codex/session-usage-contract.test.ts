import { describe, expect, it } from "vitest";

import sessionUsageFixture from "../../../fixtures/codex/session-usage.fixture.json";
import {
  CODEX_SESSION_USAGE_PATH,
  parseCodexSessionUsageResponse,
} from "./session-usage-contract";

describe("Codex session usage contract", () => {
  it("parses the verified rate-limit payload without retaining private fields", () => {
    const result = parseCodexSessionUsageResponse({
      ...sessionUsageFixture,
      email: "must-not-survive@example.com",
      account_id: "must-not-survive",
    });

    expect(CODEX_SESSION_USAGE_PATH).toBe("/backend-api/wham/usage");
    expect(result).toMatchObject({
      planType: "pro",
      rateLimit: {
        primaryWindow: {
          usedPercent: 25,
          remainingPercent: 75,
          limitWindowSeconds: 18_000,
          resetAt: 1_784_300_100,
        },
        secondaryWindow: {
          usedPercent: 59,
          remainingPercent: 41,
        },
      },
      additionalRateLimits: [
        {
          id: "codex-spark",
          label: "GPT-5.3-Codex-Spark",
        },
      ],
      credits: {
        hasCredits: true,
        unlimited: false,
        balance: 12.5,
      },
      spendControlReached: false,
    });
    expect(JSON.stringify(result)).not.toMatch(/email|account_id|must-not-survive/i);
  });

  it("rejects invalid percentages and payloads without displayable values", () => {
    expect(
      parseCodexSessionUsageResponse({
        rate_limit: {
          primary_window: { used_percent: 101 },
        },
      }),
    ).toBeNull();
    expect(parseCodexSessionUsageResponse({ plan_type: "pro" })).toBeNull();
    expect(parseCodexSessionUsageResponse("not-json")).toBeNull();
  });

  it("bounds additional rate limits and ignores malformed entries", () => {
    const result = parseCodexSessionUsageResponse({
      rate_limit: null,
      additional_rate_limits: [
        { limit_name: "missing id", rate_limit: {} },
        ...Array.from({ length: 20 }, (_, index) => ({
          metered_feature: `model-${index}`,
          limit_name: `Model ${index}`,
          rate_limit: {
            primary_window: { used_percent: index, reset_at: 1_700_000_000 },
          },
        })),
      ],
    });

    expect(result?.additionalRateLimits).toHaveLength(15);
  });
});
