import personalPageLiveEvidenceFixture from "../../../fixtures/cursor/personal-page-live-evidence.fixture.json";
import usageBillingFixture from "../../../fixtures/cursor/usage-billing.fixture.json";
import { describe, expect, it } from "vitest";

import type {
  CursorPersonalLiveFixture,
  CursorPersonalPageSummary,
} from "./personal-page-capture";
import {
  parseCursorPersonalEvidenceFixture,
  parseCursorPersonalLiveFixture,
  parseCursorPersonalPageSummary,
  type CursorPersonalEvidenceFixture,
} from "./personal-page-parser";
import type { CursorUsageBillingContractFixture } from "./usage-billing-contract";

describe("parseCursorPersonalEvidenceFixture", () => {
  it("parses the captured live evidence into a billing-period usage snapshot", () => {
    const snapshot = parseCursorPersonalEvidenceFixture(
      personalPageLiveEvidenceFixture as CursorPersonalEvidenceFixture,
    );

    expect(snapshot).not.toBeNull();

    if (!snapshot) {
      throw new Error("expected a parsed Cursor personal snapshot");
    }

    expect(snapshot.routeKey).toBe("dashboard_usage");
    expect(snapshot.sourceUrl).toBe("https://cursor.com/cn/dashboard/usage");
    expect(snapshot.localePrefix).toBe("cn");
    expect(snapshot.recommendedSurface).toBe("boot_data");
    expect(snapshot.billingPeriodLabel).toBe("Mar 23 - Apr 21");
    expect(snapshot.usageSeriesLabel).toBe(
      "Your usage per day across this billing period",
    );
    expect(snapshot.onDemandUsageState).toBe("off");
    expect(snapshot.visiblePlanLabels).toEqual(["Pro", "Pro+", "Ultra"]);
    expect(snapshot.visibleSectionLabels).toEqual([
      "Usage",
      "Your Usage",
      "By Model",
      "Spend",
    ]);
    expect(snapshot.spendCards).toEqual([]);
    expect(snapshot.exportCsvAvailable).toBe(true);
    expect(snapshot.usedAvailability).toBe("window_only");
    expect(snapshot.remainingAvailability).toBe("unavailable");
    expect(snapshot.resetAvailability).toBe("window_only");
  });
});

describe("parseCursorPersonalPageSummary", () => {
  it("handles a non-locale dashboard route without depending on /cn", () => {
    const summary: CursorPersonalPageSummary = {
      url: "https://cursor.com/dashboard/usage",
      title: "Cursor - Usage",
      heading: "Usage",
      localePrefix: null,
      recommendedSurface: "boot_data",
      textSnippets: [
        "Usage",
        "Pro",
        "On-Demand Usage is Off",
        "Total spend",
        "$0",
        "Included",
        "$0",
        "On-demand",
        "$0",
        "Your Usage",
        "Your usage per day across this billing period",
        "By Model",
        "Spend",
        "Export CSV",
        "Apr 1 - Apr 30",
      ],
      scriptMarkers: {
        hasNextDataScript: false,
        hasNextFlightStream: true,
        hasBuildManifest: false,
        hasCloudflareChallenge: false,
      },
      keywordSignals: {
        hasUsageSignal: true,
        hasRemainingSignal: false,
        hasRequestSignal: true,
        hasResetSignal: true,
        hasPlanSignal: true,
      },
    };

    const snapshot = parseCursorPersonalPageSummary("dashboard_usage", summary);

    expect(snapshot).not.toBeNull();
    expect(snapshot?.localePrefix).toBeNull();
    expect(snapshot?.billingPeriodLabel).toBe("Apr 1 - Apr 30");
    expect(snapshot?.spendCards).toEqual([
      {
        label: "Total spend",
        normalizedLabel: "total_spend",
        amountText: "$0",
        amount: 0,
        currency: "USD",
      },
      {
        label: "Included",
        normalizedLabel: "included",
        amountText: "$0",
        amount: 0,
        currency: "USD",
      },
      {
        label: "On-demand",
        normalizedLabel: "on_demand",
        amountText: "$0",
        amount: 0,
        currency: "USD",
      },
    ]);
    expect(snapshot?.onDemandUsageState).toBe("off");
  });
});

describe("parseCursorPersonalLiveFixture", () => {
  it("uses verified structured responses when the page DOM is still loading", () => {
    const contractFixture =
      usageBillingFixture as CursorUsageBillingContractFixture;
    const fixture: CursorPersonalLiveFixture = {
      capturedAt: "2026-07-15T00:00:00.000Z",
      extractionMode: "network_observer",
      routes: [
        {
          routeKey: "dashboard_usage",
          pageLabel: "Cursor personal dashboard usage page",
          urlPatterns: ["https://cursor.com/dashboard/usage*"],
          status: "matched",
          attempts: [],
          matchedUrl: "https://cursor.com/dashboard/usage",
          matchedTitle: "Cursor",
          summary: {
            url: "https://cursor.com/dashboard/usage",
            title: "Cursor",
            heading: "Usage",
            localePrefix: null,
            recommendedSurface: "network_observer",
            textSnippets: ["Loading"],
            scriptMarkers: {
              hasNextDataScript: false,
              hasNextFlightStream: false,
              hasBuildManifest: false,
              hasCloudflareChallenge: false,
            },
            keywordSignals: {
              hasUsageSignal: false,
              hasRemainingSignal: false,
              hasRequestSignal: false,
              hasResetSignal: false,
              hasPlanSignal: false,
            },
          },
          usageBillingContract: {
            usageSummary: contractFixture.usageSummary,
            planInfo: contractFixture.planInfo,
            hardLimit: contractFixture.hardLimit,
            usageEvents: contractFixture.usageEvents,
          },
        },
      ],
      decision: {
        chosenRoute: "https://cursor.com/dashboard/usage",
        chosenSurface: "network_observer",
        rationale: "Matched structured usage responses.",
      },
    };

    const result = parseCursorPersonalLiveFixture(fixture);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") {
      throw new Error("expected a parsed structured Cursor snapshot");
    }
    expect(result.snapshot.billingPeriodLabel).toBe(
      `${contractFixture.usageSummary.billingCycleStart.slice(0, 10)} - ${contractFixture.usageSummary.billingCycleEnd.slice(0, 10)}`,
    );
    expect(result.snapshot.usageBillingContract?.usageEvents).toMatchObject({
      totalUsageEventsCount: 2,
    });
  });

  it("returns logged_out when the matched Cursor route is a sign-in page", () => {
    const fixture: CursorPersonalLiveFixture = {
      capturedAt: "2026-04-22T00:00:00.000Z",
      extractionMode: "network_observer",
      routes: [
        {
          routeKey: "dashboard_usage",
          pageLabel: "Cursor personal dashboard usage page",
          urlPatterns: ["https://cursor.com/dashboard/usage*"],
          status: "logged_out",
          attempts: [],
          matchedUrl: null,
          matchedTitle: null,
          summary: null,
          usageBillingContract: null,
        },
      ],
      decision: {
        chosenRoute: null,
        chosenSurface: null,
        rationale:
          "No matching logged-in Cursor dashboard usage tab was available.",
      },
    };

    const result = parseCursorPersonalLiveFixture(fixture);

    expect(result.status).toBe("logged_out");

    if (result.status === "ok") {
      throw new Error("expected failure result");
    }

    expect(result.reason).toContain("logged-out state");
  });

  it("returns capture_unavailable when the open Cursor tab cannot be read", () => {
    const fixture: CursorPersonalLiveFixture = {
      capturedAt: "2026-04-22T00:00:00.000Z",
      extractionMode: "network_observer",
      routes: [
        {
          routeKey: "dashboard_usage",
          pageLabel: "Cursor personal dashboard usage page",
          urlPatterns: ["https://cursor.com/dashboard/usage*"],
          status: "capture_unavailable",
          attempts: [
            {
              tabId: 88,
              bindingMode: "bound",
              status: "capture_failed",
              error: "Cannot access contents of the page.",
            },
          ],
          matchedUrl: null,
          matchedTitle: null,
          summary: null,
          usageBillingContract: null,
        },
      ],
      decision: {
        chosenRoute: null,
        chosenSurface: null,
        rationale:
          "No matching logged-in Cursor dashboard usage tab was available.",
      },
    };

    const result = parseCursorPersonalLiveFixture(fixture);

    expect(result.status).toBe("capture_unavailable");

    if (result.status === "ok") {
      throw new Error("expected failure result");
    }

    expect(result.reason).toContain("could not be read");
    expect(result.routeStatuses).toEqual([
      {
        routeKey: "dashboard_usage",
        status: "capture_unavailable",
        matchedUrl: null,
      },
    ]);
  });

  it("returns route_drift when a matched page loses billing-period signals", () => {
    const fixture: CursorPersonalLiveFixture = {
      capturedAt: "2026-04-22T00:00:00.000Z",
      extractionMode: "network_observer",
      routes: [
        {
          routeKey: "dashboard_usage",
          pageLabel: "Cursor personal dashboard usage page",
          urlPatterns: ["https://cursor.com/dashboard/usage*"],
          status: "matched",
          attempts: [],
          matchedUrl: "https://cursor.com/dashboard/usage",
          matchedTitle: "Cursor",
          summary: {
            url: "https://cursor.com/dashboard/usage",
            title: "Cursor",
            heading: "Usage",
            localePrefix: null,
            recommendedSurface: "dom",
            textSnippets: ["Cursor", "Overview"],
            scriptMarkers: {
              hasNextDataScript: false,
              hasNextFlightStream: false,
              hasBuildManifest: false,
              hasCloudflareChallenge: false,
            },
            keywordSignals: {
              hasUsageSignal: false,
              hasRemainingSignal: false,
              hasRequestSignal: false,
              hasResetSignal: false,
              hasPlanSignal: false,
            },
          },
          usageBillingContract: null,
        },
      ],
      decision: {
        chosenRoute: "https://cursor.com/dashboard/usage",
        chosenSurface: "dom",
        rationale: "Matched a current usage route.",
      },
    };

    const result = parseCursorPersonalLiveFixture(fixture);

    expect(result.status).toBe("route_drift");

    if (result.status === "ok") {
      throw new Error("expected failure result");
    }

    expect(result.reason).toContain("no longer exposed parseable");
  });
});
