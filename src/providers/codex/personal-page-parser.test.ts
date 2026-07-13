import personalPageLiveFixture from "../../../fixtures/codex/personal-page-live.fixture.json";
import personalPageRouteEvidenceFixture from "../../../fixtures/codex/personal-page-route-evidence.fixture.json";
import { describe, expect, it } from "vitest";

import type { CodexPersonalLiveFixture } from "./personal-page-capture";
import { parseCodexPersonalLiveFixture } from "./personal-page-parser";

describe("parseCodexPersonalLiveFixture", () => {
  it("parses the current Codex analytics cards without treating chart ticks as windows", () => {
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
      "Weekly usage window",
    );
    expect(result.snapshot.primaryWindow.remainingPercent).toBe(73);
    expect(result.snapshot.primaryWindow.usedPercent).toBe(27);
    expect(result.snapshot.primaryWindow.totalPercent).toBe(100);
    expect(result.snapshot.primaryWindow.resetAt).toBe("2026-07-20 05:17");
    expect(result.snapshot.windows).toEqual(
      [
        expect.objectContaining({
          normalizedLabel: "Weekly usage window",
          kind: "weekly",
          remainingPercent: 73,
          usedPercent: 27,
          resetAt: "2026-07-20 05:17",
        }),
        expect.objectContaining({
          label: "GPT-5.3-Codex-Spark",
          kind: "unknown",
          modelLabel: "GPT-5.3-Codex-Spark",
          remainingPercent: 91,
        }),
      ],
    );
    expect(result.snapshot.balances).toEqual([
      expect.objectContaining({
        normalizedLabel: "Flex credit balance",
        remainingCredits: 0,
        detail: "Use credits to continue using Codex beyond your plan limit",
      }),
    ]);
    expect(result.snapshot.note).toContain("remaining percentages");
  });

  it("rejects percentages outside the valid quota range", () => {
    const fixture = structuredClone(
      personalPageLiveFixture as CodexPersonalLiveFixture,
    );
    const matchedRoute = fixture.routes.find(
      (route) => route.routeKey === "cloud_analytics",
    );

    if (!matchedRoute?.summary) {
      throw new Error("expected current Codex fixture summary");
    }

    matchedRoute.summary.textSnippets = [
      "Weekly usage limit",
      "175% remaining",
      "Usage details",
      "0%",
      "100%",
    ];

    expect(parseCodexPersonalLiveFixture(fixture)).toMatchObject({
      status: "route_drift",
    });
  });

  it("falls back to another captured Codex route when the preferred route has not hydrated", () => {
    const fixture = structuredClone(
      personalPageLiveFixture as CodexPersonalLiveFixture,
    );
    const preferredRoute = fixture.routes.find(
      (route) => route.routeKey === "cloud_analytics",
    );
    const fallbackRoute = fixture.routes.find(
      (route) => route.routeKey === "personal_usage",
    );

    if (!preferredRoute?.summary || !fallbackRoute) {
      throw new Error("expected current and fallback Codex fixture routes");
    }

    preferredRoute.summary.textSnippets = ["Usage limits loading"];
    fallbackRoute.status = "matched";
    fallbackRoute.matchedUrl = "https://chatgpt.com/codex/settings/usage";
    fallbackRoute.matchedTitle = "Codex";
    fallbackRoute.summary = {
      url: "https://chatgpt.com/codex/settings/usage",
      title: "Codex",
      heading: "Usage",
      recommendedSurface: "dom",
      textSnippets: ["Weekly usage limit", "64% remaining"],
      scriptMarkers: {
        hasNextDataScript: false,
        hasNextFlightStream: false,
        hasCloudflareChallenge: false,
      },
      keywordSignals: {
        hasUsageSignal: true,
        hasRemainingSignal: true,
        hasCreditSignal: false,
        hasResetSignal: false,
      },
    };

    const result = parseCodexPersonalLiveFixture(fixture);

    expect(result).toMatchObject({
      status: "ok",
      snapshot: {
        routeKey: "personal_usage",
        sourceUrl: "https://chatgpt.com/codex/settings/usage",
        primaryWindow: {
          normalizedLabel: "Weekly usage window",
          remainingPercent: 64,
        },
      },
    });
  });

  it("keeps the lower weekly Codex window visible when the five-hour window is full", () => {
    const fixture: CodexPersonalLiveFixture = {
      capturedAt: "2026-04-25T00:00:00.000Z",
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
            heading: "Codex 分析",
            recommendedSurface: "dom",
            textSnippets: [
              "5 小时使用限额",
              "100%",
              "剩余",
              "每周使用限额",
              "32%",
              "剩余",
              "重置时间：2026年4月29日 4:00",
              "GPT-5.3-Codex-Spark 5 小时使用限额",
              "100%",
              "剩余",
              "GPT-5.3-Codex-Spark 每周使用限额",
              "100%",
              "余额额度",
              "0",
              "使用积分可在超出套餐限制后继续使用 Codex",
            ],
            scriptMarkers: {
              hasNextDataScript: false,
              hasNextFlightStream: false,
              hasCloudflareChallenge: false,
            },
            keywordSignals: {
              hasUsageSignal: true,
              hasRemainingSignal: true,
              hasCreditSignal: true,
              hasResetSignal: true,
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

    expect(result.status).toBe("ok");

    if (result.status !== "ok") {
      throw new Error("expected ok result");
    }

    expect(result.snapshot.primaryWindow.normalizedLabel).toBe(
      "5-hour usage window",
    );
    expect(result.snapshot.primaryWindow.remainingPercent).toBe(100);
    expect(result.snapshot.windows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          normalizedLabel: "Weekly usage window",
          kind: "weekly",
          remainingPercent: 32,
          usedPercent: 68,
          resetAt: "2026-04-29 04:00",
        }),
        expect.objectContaining({
          label: "GPT-5.3-Codex-Spark 每周使用限额",
          kind: "model_weekly",
          modelLabel: "GPT-5.3-Codex-Spark",
          remainingPercent: 100,
        }),
      ]),
    );
    expect(result.snapshot.balances).toEqual([
      expect.objectContaining({
        normalizedLabel: "Flex credit balance",
        kind: "flex_credit_balance",
        remainingCredits: 0,
        totalCredits: null,
        detail: "使用积分可在超出套餐限制后继续使用 Codex",
      }),
    ]);
  });

  it("parses inline remaining percentage snippets from merged Codex DOM text", () => {
    const fixture: CodexPersonalLiveFixture = {
      capturedAt: "2026-04-25T00:00:00.000Z",
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
            heading: "Codex 分析",
            recommendedSurface: "dom",
            textSnippets: [
              "5 小时使用限额",
              "100% 剩余",
              "每周使用限额",
              "32% remaining",
              "重置时间：2026年4月29日 4:00",
              "GPT-5.3-Codex-Spark 每周使用限额",
              "100％ 剩余",
              "余额额度 0",
            ],
            scriptMarkers: {
              hasNextDataScript: false,
              hasNextFlightStream: false,
              hasCloudflareChallenge: false,
            },
            keywordSignals: {
              hasUsageSignal: true,
              hasRemainingSignal: true,
              hasCreditSignal: true,
              hasResetSignal: true,
            },
          },
        },
      ],
      decision: {
        chosenRoute: "https://chatgpt.com/codex/cloud/settings/analytics#usage",
        chosenSurface: "dom",
        rationale: "Matched a live route with merged text nodes.",
      },
    };

    const result = parseCodexPersonalLiveFixture(fixture);

    expect(result.status).toBe("ok");

    if (result.status !== "ok") {
      throw new Error("expected ok result");
    }

    expect(result.snapshot.primaryWindow.normalizedLabel).toBe(
      "5-hour usage window",
    );
    expect(result.snapshot.primaryWindow.remainingPercent).toBe(100);
    expect(result.snapshot.windows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          normalizedLabel: "Weekly usage window",
          remainingPercent: 32,
          usedPercent: 68,
          resetAt: "2026-04-29 04:00",
        }),
        expect.objectContaining({
          label: "GPT-5.3-Codex-Spark 每周使用限额",
          kind: "model_weekly",
          remainingPercent: 100,
        }),
      ]),
    );
    expect(result.snapshot.balances).toEqual([
      expect.objectContaining({
        normalizedLabel: "Flex credit balance",
        remainingCredits: 0,
      }),
    ]);
  });

  it("parses Codex window labels when label and remaining percent are merged", () => {
    const fixture: CodexPersonalLiveFixture = {
      capturedAt: "2026-04-25T00:00:00.000Z",
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
            heading: "Codex 分析",
            recommendedSurface: "dom",
            textSnippets: [
              "5 小时使用限额 100% 剩余",
              "每周使用限额 32% 剩余 重置时间：2026年4月29日 4:00",
              "GPT-5.3-Codex-Spark 每周使用限额 100％ 剩余",
              "余额额度",
              "0",
            ],
            scriptMarkers: {
              hasNextDataScript: false,
              hasNextFlightStream: false,
              hasCloudflareChallenge: false,
            },
            keywordSignals: {
              hasUsageSignal: true,
              hasRemainingSignal: true,
              hasCreditSignal: true,
              hasResetSignal: true,
            },
          },
        },
      ],
      decision: {
        chosenRoute: "https://chatgpt.com/codex/cloud/settings/analytics#usage",
        chosenSurface: "dom",
        rationale: "Matched merged label and value text nodes.",
      },
    };

    const result = parseCodexPersonalLiveFixture(fixture);

    expect(result.status).toBe("ok");

    if (result.status !== "ok") {
      throw new Error("expected ok result");
    }

    expect(result.snapshot.primaryWindow.normalizedLabel).toBe(
      "5-hour usage window",
    );
    expect(result.snapshot.primaryWindow.remainingPercent).toBe(100);
    expect(result.snapshot.windows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "每周使用限额",
          normalizedLabel: "Weekly usage window",
          kind: "weekly",
          remainingPercent: 32,
          usedPercent: 68,
          resetAt: "2026-04-29 04:00",
        }),
        expect.objectContaining({
          label: "GPT-5.3-Codex-Spark 每周使用限额",
          normalizedLabel: "GPT-5.3-Codex-Spark 每周使用限额",
          kind: "model_weekly",
          modelLabel: "GPT-5.3-Codex-Spark",
          remainingPercent: 100,
        }),
      ]),
    );
    expect(result.snapshot.balances).toEqual([
      expect.objectContaining({
        normalizedLabel: "Flex credit balance",
        remainingCredits: 0,
      }),
    ]);
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

  it("returns capture_unavailable when the open Codex tab cannot be read", () => {
    const fixture: CodexPersonalLiveFixture = {
      capturedAt: "2026-04-22T00:00:00.000Z",
      extractionMode: "dom",
      primaryCandidateRoute: "https://chatgpt.com/codex/settings/usage",
      routes: [
        {
          routeKey: "cloud_analytics",
          pageLabel: "Codex cloud analytics page",
          urlPatterns: ["https://chatgpt.com/codex/cloud/settings/analytics*"],
          status: "capture_unavailable",
          attempts: [
            {
              tabId: 77,
              bindingMode: "bound",
              status: "capture_failed",
              error: "Cannot access contents of the page.",
            },
          ],
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

    expect(result.status).toBe("capture_unavailable");

    if (result.status === "ok") {
      throw new Error("expected failure result");
    }

    expect(result.reason).toContain("could not be read");
    expect(result.routeStatuses).toEqual([
      {
        routeKey: "cloud_analytics",
        status: "capture_unavailable",
        matchedUrl: null,
      },
    ]);
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
