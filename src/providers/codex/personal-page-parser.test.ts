import personalPageLiveFixture from "../../../fixtures/codex/personal-page-live.fixture.json";
import personalPageRouteEvidenceFixture from "../../../fixtures/codex/personal-page-route-evidence.fixture.json";
import { describe, expect, it } from "vitest";

import type { CodexPersonalLiveFixture } from "./personal-page-capture";
import { parseCodexPersonalLiveFixture } from "./personal-page-parser";

describe("parseCodexPersonalLiveFixture", () => {
  it("parses the proven live Codex analytics route into window-percent snapshots", () => {
    const result = parseCodexPersonalLiveFixture(
      personalPageLiveFixture as CodexPersonalLiveFixture,
    );

    expect(result.status).toBe("ok");

    if (result.status !== "ok") {
      throw new Error("expected ok result");
    }

    expect(result.snapshot.routeKey).toBe("cloud_analytics");
    expect(result.snapshot.sourceUrl).toBe(
      "https://chatgpt.com/codex/cloud/settings/analytics#usage",
    );
    expect(result.snapshot.primaryWindow.normalizedLabel).toBe(
      "5-hour usage window",
    );
    expect(result.snapshot.primaryWindow.remainingPercent).toBe(92);
    expect(result.snapshot.primaryWindow.usedPercent).toBe(8);
    expect(result.snapshot.primaryWindow.totalPercent).toBe(100);
    expect(result.snapshot.primaryWindow.resetAt).toBe("2026-04-22 01:11");
    expect(result.snapshot.windows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          normalizedLabel: "Weekly usage window",
          remainingPercent: 97,
          usedPercent: 3,
          resetAt: "2026-04-28 09:15",
        }),
        expect.objectContaining({
          label: "GPT-5.3-Codex-Spark 5 小时使用限额",
          kind: "model_rolling_5h",
          modelLabel: "GPT-5.3-Codex-Spark",
          remainingPercent: 100,
        }),
      ]),
    );
    expect(result.snapshot.note).toContain("remaining percentages");
  });

  it("returns open_page_required when no live Codex page was captured", () => {
    const routeEvidenceFixture =
      personalPageRouteEvidenceFixture as typeof personalPageRouteEvidenceFixture;
    const noMatchFixture: CodexPersonalLiveFixture = {
      capturedAt: `${routeEvidenceFixture.capturedAt}T00:00:00.000Z`,
      extractionMode: "dom",
      primaryCandidateRoute: routeEvidenceFixture.decision.primaryCandidateRoute,
      routes: [
        {
          routeKey: "personal_usage",
          pageLabel: "Codex personal usage page",
          urlPatterns: ["https://chatgpt.com/codex/settings/usage*"],
          status: "not_found",
          attempts: [],
          matchedUrl: null,
          matchedTitle: null,
          summary: null,
        },
        {
          routeKey: "cloud_usage",
          pageLabel: "Codex cloud usage page",
          urlPatterns: ["https://chatgpt.com/codex/cloud/settings/usage*"],
          status: "not_found",
          attempts: [],
          matchedUrl: null,
          matchedTitle: null,
          summary: null,
        },
        {
          routeKey: "cloud_analytics",
          pageLabel: "Codex cloud analytics page",
          urlPatterns: ["https://chatgpt.com/codex/cloud/settings/analytics*"],
          status: "not_found",
          attempts: [],
          matchedUrl: null,
          matchedTitle: null,
          summary: null,
        },
      ],
      decision: {
        chosenRoute: null,
        chosenSurface: null,
        rationale:
          "No logged-in Codex page was matched from the current browser tabs.",
      },
    };

    const result = parseCodexPersonalLiveFixture(
      noMatchFixture,
    );

    expect(result.status).toBe("open_page_required");

    if (result.status === "ok") {
      throw new Error("expected failure result");
    }

    expect(result.reason).toContain("Open the logged-in Codex usage page");
    expect(result.routeStatuses).toHaveLength(3);
  });

  it("returns logged_out when the only matched route is a logged-out ChatGPT page", () => {
    const fixture: CodexPersonalLiveFixture = {
      capturedAt: "2026-04-22T00:00:00.000Z",
      extractionMode: "dom",
      primaryCandidateRoute: "https://chatgpt.com/codex/settings/usage",
      routes: [
        {
          routeKey: "personal_usage",
          pageLabel: "Codex personal usage page",
          urlPatterns: ["https://chatgpt.com/codex/settings/usage*"],
          status: "logged_out",
          attempts: [],
          matchedUrl: null,
          matchedTitle: null,
          summary: null,
        },
      ],
      decision: {
        chosenRoute: null,
        chosenSurface: null,
        rationale: "No logged-in Codex page was matched from the current tabs.",
      },
    };

    const result = parseCodexPersonalLiveFixture(fixture);

    expect(result.status).toBe("logged_out");

    if (result.status === "ok") {
      throw new Error("expected failure result");
    }

    expect(result.reason).toContain("logged-out state");
  });

  it("returns route_drift when a matched page no longer exposes parseable usage windows", () => {
    const fixture: CodexPersonalLiveFixture = {
      capturedAt: "2026-04-22T00:00:00.000Z",
      extractionMode: "dom",
      primaryCandidateRoute: "https://chatgpt.com/codex/settings/usage",
      routes: [
        {
          routeKey: "cloud_analytics",
          pageLabel: "Codex cloud analytics page",
          urlPatterns: ["https://chatgpt.com/codex/cloud/settings/analytics*"],
          status: "matched",
          attempts: [],
          matchedUrl: "https://chatgpt.com/codex/cloud/settings/analytics#usage",
          matchedTitle: "Codex",
          summary: {
            url: "https://chatgpt.com/codex/cloud/settings/analytics#usage",
            title: "Codex",
            heading: "Codex Analytics",
            recommendedSurface: "dom",
            textSnippets: ["Usage", "Overview", "Analytics"],
            scriptMarkers: {
              hasNextDataScript: false,
              hasNextFlightStream: false,
              hasCloudflareChallenge: false,
            },
            keywordSignals: {
              hasUsageSignal: true,
              hasRemainingSignal: false,
              hasCreditSignal: false,
              hasResetSignal: false,
            },
          },
        },
      ],
      decision: {
        chosenRoute: "https://chatgpt.com/codex/cloud/settings/analytics#usage",
        chosenSurface: "dom",
        rationale: "Matched a live route.",
      },
    };

    const result = parseCodexPersonalLiveFixture(fixture);

    expect(result.status).toBe("route_drift");

    if (result.status === "ok") {
      throw new Error("expected failure result");
    }

    expect(result.reason).toContain("no longer exposed a parseable");
  });
});
