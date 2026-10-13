import { describe, expect, it } from "vitest";
import fixture from "../../../fixtures/provider-insights/source-audit.fixture.json";
import { assertSanitizedProviderFixture } from "./provider-contract-harness";
import { parseCodexSessionUsageResponse } from "../codex/session-usage-contract";
import { extractClaudePersonalUsageContract } from "../claude-code/personal-usage-contract";
import { extractCursorObservedUsageBillingContract } from "../cursor/usage-billing-contract";

describe("usage insight audit fixtures", () => {
  it("keeps synthetic scoped aggregates within the existing privacy boundary", () => {
    expect(() => assertSanitizedProviderFixture(fixture)).not.toThrow();
    expect(fixture.synthetic).toBe(true);
    expect(JSON.stringify(fixture)).not.toMatch(/conversationTitle|prompt|bodyText|outerHTML/);
  });

  it("preserves legacy Codex quota and credits separately from composition", () => {
    const parsed = parseCodexSessionUsageResponse(fixture.codex.browserUsage);
    expect(parsed?.rateLimit.secondaryWindow?.remainingPercent).toBe(75);
    expect(parsed?.credits?.balance).toBe(120);
    expect(parsed?.rateLimit.primaryWindow).toBeNull();
    expect(fixture.codex.renderedComposition.values.map((entry) => entry.value))
      .toEqual([60, 25, 10, 5]);
  });

  it("does not turn absent or invalid quota into zero usage", () => {
    expect(parseCodexSessionUsageResponse(fixture.boundaryCases.missingCodexUsage)).toBeNull();
    expect(parseCodexSessionUsageResponse(fixture.boundaryCases.invalidCodexPercent)).toBeNull();
  });

  it("retains Claude subscription windows without combining scoped credit", () => {
    const parsed = extractClaudePersonalUsageContract([
      { url: "https://claude.ai/api/organizations/synthetic/usage", ok: true,
        method: "GET", status: 200, contentType: "application/json",
        capturedAt: "2000-01-01T00:00:00Z", transport: "fetch",
        bodyText: JSON.stringify(fixture.claude.legacyUsage) },
    ]);
    expect(parsed?.limits.map((entry) => entry.remainingPercent)).toEqual([70, 60]);
    expect(parsed?.credits).toBeNull();
    expect(fixture.claude.renderedSections.usageCredit.remaining).toBe(0);
    expect(fixture.claude.renderedSections.fullReset.count).toBeNull();
    expect(fixture.claude.renderedSections.fullReset.expiresAt).toBeNull();
  });

  it("retains legacy Cursor names and cent values without guessing pool identity", () => {
    const parsed = extractCursorObservedUsageBillingContract([
      { url: "https://cursor.com/api/usage-summary", ok: true,
        bodyText: JSON.stringify(fixture.cursor.legacySummary) },
    ]);
    expect(parsed?.usageSummary?.individualUsage.plan?.used).toBe(1500);
    expect(parsed?.usageSummary?.individualUsage.onDemand?.used).toBe(500);
    expect(parsed?.usageSummary?.individualUsage.plan?.totalPercentUsed).toBe(60);
    expect(fixture.cursor.renderedPools.map((entry) => entry.id))
      .toEqual(["cursor_models", "other_models", "grok_bot"]);
    expect(fixture.cursor.renderedPools.every((entry) => entry.resetAt === null)).toBe(true);
  });
});
