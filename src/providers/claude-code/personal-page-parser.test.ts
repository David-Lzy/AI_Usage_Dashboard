import { describe, expect, it } from "vitest";

import { parseClaudePersonalPageSummary } from "./personal-page-parser";

describe("parseClaudePersonalPageSummary", () => {
  it("extracts visible Claude Team usage windows with reset context", () => {
    const snapshot = parseClaudePersonalPageSummary("settings_usage", {
      url: "https://claude.ai/settings/usage",
      title: "Claude",
      heading: "Usage",
      recommendedSurface: "dom",
      textSnippets: [
        "Team plan",
        "Weekly usage limit",
        "42% remaining",
        "Resets at 2026-05-18 00:00",
        "Premium messages",
      ],
      scriptMarkers: {
        hasNextDataScript: false,
        hasNextFlightStream: false,
        hasCloudflareChallenge: false,
      },
      keywordSignals: {
        hasUsageSignal: true,
        hasRemainingSignal: true,
        hasResetSignal: true,
        hasPlanSignal: true,
        hasTeamSignal: true,
        hasUpgradeSignal: false,
      },
    });

    expect(snapshot).not.toBeNull();
    expect(snapshot?.primaryWindow).toMatchObject({
      normalizedLabel: "Weekly usage window",
      kind: "weekly",
      remainingPercent: 42,
      usedPercent: 58,
      resetAt: "2026-05-18 00:00",
    });
    expect(snapshot?.remainingAvailability).toBe("exact");
    expect(snapshot?.resetAvailability).toBe("window_only");
  });

  it("keeps a usage-page snapshot when the page exposes facts but no exact percentage", () => {
    const snapshot = parseClaudePersonalPageSummary("settings_usage", {
      url: "https://claude.ai/settings/usage",
      title: "Claude",
      heading: "Usage",
      recommendedSurface: "dom",
      textSnippets: [
        "Team plan",
        "Premium messages",
        "Usage resets monthly",
        "Billing period",
        "May 01 - Jun 01",
      ],
      scriptMarkers: {
        hasNextDataScript: false,
        hasNextFlightStream: false,
        hasCloudflareChallenge: false,
      },
      keywordSignals: {
        hasUsageSignal: true,
        hasRemainingSignal: false,
        hasResetSignal: true,
        hasPlanSignal: true,
        hasTeamSignal: true,
        hasUpgradeSignal: false,
      },
    });

    expect(snapshot).not.toBeNull();
    expect(snapshot?.primaryWindow).toBeNull();
    expect(snapshot?.remainingAvailability).toBe("unavailable");
    expect(snapshot?.facts.length).toBeGreaterThan(0);
  });

  it("rejects a matched route when no usage, plan, or quota signals are visible", () => {
    const snapshot = parseClaudePersonalPageSummary("settings_usage", {
      url: "https://claude.ai/settings/usage",
      title: "Claude",
      heading: "Settings",
      recommendedSurface: "dom",
      textSnippets: ["Settings", "Profile"],
      scriptMarkers: {
        hasNextDataScript: false,
        hasNextFlightStream: false,
        hasCloudflareChallenge: false,
      },
      keywordSignals: {
        hasUsageSignal: false,
        hasRemainingSignal: false,
        hasResetSignal: false,
        hasPlanSignal: false,
        hasTeamSignal: false,
        hasUpgradeSignal: false,
      },
    });

    expect(snapshot).toBeNull();
  });
});

