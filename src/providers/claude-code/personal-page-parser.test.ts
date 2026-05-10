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

  it("keeps Claude usage rows while filtering helper copy from windows and facts", () => {
    const snapshot = parseClaudePersonalPageSummary("settings_usage", {
      url: "https://claude.ai/settings/usage",
      title: "Claude",
      heading: "Usage",
      recommendedSurface: "dom",
      textSnippets: [
        "Usage",
        "Your Usage limits",
        "Team",
        "Current session",
        "Starts when a message is sent",
        "0% used",
        "Weekly limits",
        "Learn more about usage limits",
        "All models",
        "Resets in 21 hr 56 min",
        "1% used",
        "Claude Code",
        "Projects",
        "Invite team members",
        "Claude Design",
        "You haven't used Claude Design yet",
        "0% used",
        "Last updated: 1 minute ago",
        "Additional features",
        "Daily included routine runs",
        "You haven't run any routines yet",
        "0 / 25",
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
    expect(snapshot?.windows.map((window) => window.normalizedLabel)).toEqual([
      "Current session",
      "All models weekly limit",
      "Claude Design",
      "Daily included routine runs",
    ]);
    expect(snapshot?.primaryWindow).toMatchObject({
      normalizedLabel: "All models weekly limit",
      kind: "weekly",
      remainingPercent: 99,
      usedPercent: 1,
      resetAt: "in 21 hr 56 min",
    });
    expect(snapshot?.windows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          normalizedLabel: "Current session",
          remainingPercent: 100,
          usedPercent: 0,
          resetAt: null,
          resetText: "Starts when a message is sent",
        }),
        expect.objectContaining({
          normalizedLabel: "All models weekly limit",
          remainingPercent: 99,
          usedPercent: 1,
          resetAt: "in 21 hr 56 min",
        }),
        expect.objectContaining({
          normalizedLabel: "Claude Design",
          remainingPercent: 100,
          usedPercent: 0,
          resetAt: null,
          resetText: "You haven't used Claude Design yet",
        }),
        expect.objectContaining({
          normalizedLabel: "Daily included routine runs",
          remainingPercent: 100,
          usedPercent: 0,
          resetText: "0 / 25",
        }),
      ]),
    );

    const renderedFactText = snapshot?.facts
      .flatMap((fact) => [fact.label, fact.value])
      .join(" ");

    expect(renderedFactText).not.toContain("Projects");
    expect(renderedFactText).not.toContain("Invite team members");
    expect(renderedFactText).not.toContain("Your Usage limits");
    expect(renderedFactText).not.toContain("Learn more about usage limits");
    expect(renderedFactText).not.toContain("Starts when a message is sent");
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
