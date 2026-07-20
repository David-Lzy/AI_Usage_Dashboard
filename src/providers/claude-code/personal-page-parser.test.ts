import { describe, expect, it } from "vitest";

import personalUsageContractFixture from "../../../fixtures/claude/personal-usage-contract.fixture.json";

import {
  parseClaudePersonalLiveFixture,
  parseClaudePersonalPageSummary,
} from "./personal-page-parser";
import { extractClaudePersonalUsageContract } from "./personal-usage-contract";

describe("parseClaudePersonalPageSummary", () => {
  it("prefers structured shared-plan windows and separates credit state", () => {
    const usageContract = extractClaudePersonalUsageContract(
      [
        {
          url: "https://claude.ai/api/organizations/redacted/usage",
          method: "GET",
          status: 200,
          ok: true,
          contentType: "application/json",
          bodyText: JSON.stringify(personalUsageContractFixture.usage),
          capturedAt: "2026-07-21T00:00:00.000Z",
          transport: "fetch",
        },
      ],
      [personalUsageContractFixture.domFallback.heading],
    );
    const result = parseClaudePersonalLiveFixture({
      capturedAt: "2026-07-21T00:00:00.000Z",
      extractionMode: "network_observer",
      routes: [
        {
          routeKey: "settings_usage",
          pageLabel: "Claude personal usage settings surface",
          urlPatterns: ["https://claude.ai/new*"],
          status: "matched",
          attempts: [],
          matchedUrl: "https://claude.ai/new#settings/usage",
          matchedTitle: "New chat - Claude",
          summary: {
            url: "https://claude.ai/new#settings/usage",
            title: "New chat - Claude",
            heading: "Plan usage limits Pro",
            recommendedSurface: "network_observer",
            textSnippets: ["Plan usage limits Pro"],
            scriptMarkers: {
              hasNextDataScript: false,
              hasNextFlightStream: false,
              hasCloudflareChallenge: false,
            },
            keywordSignals: {
              hasUsageSignal: true,
              hasRemainingSignal: false,
              hasResetSignal: false,
              hasPlanSignal: true,
              hasTeamSignal: false,
              hasUpgradeSignal: false,
            },
          },
          usageContract,
        },
      ],
      decision: {
        chosenRoute: "https://claude.ai/new#settings/usage",
        chosenSurface: "network_observer",
        rationale: "test",
      },
    });

    expect(result.status).toBe("ok");
    if (result.status !== "ok") {
      return;
    }
    expect(result.snapshot.planIdentity).toEqual({
      kind: "pro",
      label: "Claude Pro",
    });
    expect(result.snapshot.windows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          normalizedLabel: "Current session",
          remainingPercent: 77,
        }),
        expect.objectContaining({
          normalizedLabel: "All models weekly limit",
          remainingPercent: 89,
        }),
      ]),
    );
    expect(result.snapshot.facts).toEqual([
      expect.objectContaining({ label: "Usage credits", value: "Disabled" }),
    ]);
  });

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
