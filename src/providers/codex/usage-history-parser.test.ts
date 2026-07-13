import { describe, expect, it } from "vitest";
import fixture from "../../../fixtures/codex/usage-history.fixture.json";
import {
  type CodexUsageHistoryContractFixture,
  type CodexObservedUsageHistoryContract,
} from "./usage-history-contract";
import { parseCodexUsageHistory } from "./usage-history-parser";

describe("Codex usage history parser", () => {
  it("preserves daily personal usage percentages and normalizes turn breakdowns", () => {
    const source = fixture as CodexUsageHistoryContractFixture;
    const contract: CodexObservedUsageHistoryContract = {
      dailyTokenUsageBreakdown: source.dailyTokenUsageBreakdown,
      dailyWorkspaceUsageCounts: source.dailyWorkspaceUsageCounts,
    };
    const history = parseCodexUsageHistory(contract, source.capturedAt);

    expect(history).toMatchObject({
      rangeStart: "2026-06-14",
      rangeEnd: "2026-06-15",
      turns: {
        total: 216,
      },
    });
    expect(history?.personalUsageBySurface?.points[0]?.values).toHaveLength(4);
    expect(
      history?.personalUsageBySurface?.points[0]?.values[0],
    ).toMatchObject({ id: "desktop_app", label: "Desktop App" });
    expect(
      history?.personalUsageBySurface?.points[0]?.values[0]?.value,
    ).toBeCloseTo(35);
    expect(
      history?.personalUsageBySurface?.points.map((point) =>
        point.values.reduce((sum, value) => sum + value.value, 0),
      ),
    ).toEqual([48, 75]);
    expect(history?.turns?.byModel[0]?.values).toMatchObject([
      { id: "gpt-5.3-codex-spark", value: 75 },
      { id: "gpt-5.4", value: 45 },
    ]);
    expect(history?.turns?.bySurface[0]?.values).toMatchObject([
      { id: "desktop_app", label: "Desktop App", value: 72 },
      { id: "vscode", label: "Extension", value: 35 },
      { id: "exec", label: "Exec", value: 13 },
    ]);
  });
});
