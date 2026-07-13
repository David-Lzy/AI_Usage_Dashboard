import { describe, expect, it } from "vitest";
import usageHistoryFixture from "../../../fixtures/codex/usage-history.fixture.json";
import {
  CODEX_DAILY_TOKEN_USAGE_PATH,
  CODEX_DAILY_WORKSPACE_USAGE_PATH,
  CODEX_USAGE_HISTORY_PATHS,
  isCodexUsageHistoryUrl,
  type CodexUsageHistoryContractFixture,
} from "./usage-history-contract";

describe("Codex usage history contract", () => {
  it("matches only the two observed structured history paths", () => {
    expect(CODEX_USAGE_HISTORY_PATHS).toEqual([
      CODEX_DAILY_TOKEN_USAGE_PATH,
      CODEX_DAILY_WORKSPACE_USAGE_PATH,
    ]);
    expect(
      isCodexUsageHistoryUrl(
        `https://chatgpt.com${CODEX_DAILY_TOKEN_USAGE_PATH}?group_by=day`,
      ),
    ).toBe(true);
    expect(
      isCodexUsageHistoryUrl("https://chatgpt.com/backend-api/me"),
    ).toBe(false);
  });

  it("keeps the contract fixture synthetic and limited to aggregate fields", () => {
    const fixture = usageHistoryFixture as CodexUsageHistoryContractFixture;
    const serialized = JSON.stringify(fixture);

    expect(fixture.dailyTokenUsageBreakdown.data[0]).toMatchObject({
      date: "2026-06-14",
      product_surface_usage_values: {
        desktop_app: 55,
        vscode: 25,
        exec: 15,
        unknown: 5,
      },
    });
    expect(fixture.dailyWorkspaceUsageCounts.data[0]).toMatchObject({
      date: "2026-06-14",
      totals: { turns: 120 },
    });
    expect(serialized).not.toMatch(
      /cookie|authorization|account_id|workspace_id|user_id|email|token_value/i,
    );
  });
});
