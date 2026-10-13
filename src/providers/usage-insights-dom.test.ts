import { describe, expect, it } from "vitest";
import { buildUsageInsightsFromDom, type UsageInsightsDomCapture } from "./usage-insights-dom";
import claudeFixture from "../../fixtures/claude/usage-insights-dom.fixture.json";

const row = (key: string, value: number | null, unit: "percent" | "count" | "USD" | null): UsageInsightsDomCapture["rows"][number] =>
  ({ key, label: key === "function.tasks" ? "Tasks" : "Reset credits", value, total: null, unit, direction: null, available: null, expiresAt: null, expiryText: null });

describe("bounded page aggregate capture", () => {
  it("separates Claude reset presence and credits without inventing counts or composition", () => {
    const captured = buildUsageInsightsFromDom("claude", claudeFixture as UsageInsightsDomCapture, "2026-10-13T10:00:00.000Z");
    expect(captured?.resetCredits).toMatchObject({ availableCount: null, offers: [
      { kind: "full", available: true, expiresAt: null, expiryText: "Expires October 31" },
      { kind: "rolling_5h", available: false, expiresAt: null },
    ] });
    expect(captured?.balances).toMatchObject([{ id: "cloud_session", remaining: 80, total: 100, unit: "USD" }, { id: "usage_credit", remaining: 0, total: null, unit: "USD" }]);
    expect(captured?.distribution).toBeUndefined();
    expect(captured).not.toHaveProperty("usageWindows");
    expect(buildUsageInsightsFromDom("claude", { ...claudeFixture, blocked: true } as UsageInsightsDomCapture, "2026-10-13T10:00:00.000Z")).toBeNull();
  });
  it("preserves scope, period and shares without treating a DOM count as authoritative", () => {
    const data = { rows: [row("function.tasks", 74.7, "percent"), row("reset.count", 0, "count"), row("conversation.title", 99, "percent")],
      rangeStart: "2026-10-07", rangeEnd: "2026-10-13", sharedPlan: true, loggedOut: false };
    const insights = buildUsageInsightsFromDom("codex", data, "2026-10-13T10:00:00.000Z");
    expect(insights).toMatchObject({ quotaScope: { scope: "shared_plan", accountVerified: false },
      distribution: { kind: "function", values: [{ id: "tasks", value: 74.7 }], rangeStart: "2026-10-07" } });
    expect(JSON.stringify(insights)).not.toContain("conversation");
    expect(insights?.resetCredits).toBeUndefined();
  });

  it("does not turn missing percentages or a graph into measured data", () => {
    expect(buildUsageInsightsFromDom("codex", { rows: [], rangeStart: null, rangeEnd: null, sharedPlan: false, loggedOut: false }, "2026-10-13T10:00:00.000Z")).toBeNull();
  });
});
