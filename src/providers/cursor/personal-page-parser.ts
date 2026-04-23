import type {
  CursorPersonalLiveFixture,
  CursorPersonalPageSummary,
  CursorPersonalRouteCapture,
  CursorPersonalRouteKey,
  CursorRecommendedExtractionSurface,
} from "./personal-page-capture";

export type CursorPersonalEvidenceFixture = {
  capturedAt: string;
  captureMethod: string;
  route: {
    url: string;
    title: string;
    pathLocalePrefix: string | null;
    sourceHtmlLang?: string | null;
    renderedCopyLanguage?: string | null;
  };
  visiblePageSignals: {
    textSnippets: string[];
    exactRemainingCounterVisible: boolean;
    currentBillingPeriodUsageVisible: boolean;
    planMetadataVisible: boolean;
    exportControlVisible: boolean;
  };
  sourceSignals: {
    hasNextDataScript: boolean;
    hasNextFlightStream: boolean;
    nextFlightMatchCount?: number;
    hasBuildManifest: boolean;
    hasVisibleUsageStringsInSource: boolean;
    matchedStrings: string[];
  };
  decision: {
    recommendedSurface: CursorRecommendedExtractionSurface;
    domFallback: boolean;
    usedAvailability: "window_only" | "exact" | "analytics_only" | "unavailable";
    remainingAvailability:
      | "unavailable"
      | "window_only"
      | "exact"
      | "analytics_only";
    resetAvailability:
      | "window_only"
      | "unavailable"
      | "exact"
      | "analytics_only";
    rationale: string;
  };
  notes: string[];
};

export type CursorOnDemandUsageState = "on" | "off" | null;

export type CursorPersonalUsageSnapshot = {
  providerId: "cursor";
  providerLabel: "Cursor";
  measurementKind: "billing_period_usage";
  routeKey: CursorPersonalRouteKey;
  sourceUrl: string;
  sourceTitle: string;
  localePrefix: string | null;
  recommendedSurface: CursorRecommendedExtractionSurface;
  billingPeriodLabel: string | null;
  usageSeriesLabel: string | null;
  visiblePlanLabels: string[];
  visibleSectionLabels: string[];
  onDemandUsageState: CursorOnDemandUsageState;
  exportCsvAvailable: boolean;
  usedAvailability: "window_only";
  remainingAvailability: "unavailable";
  resetAvailability: "window_only";
  note: string;
};

export type CursorPersonalParseResult =
  | {
      status: "ok";
      snapshot: CursorPersonalUsageSnapshot;
    }
  | {
      status: "logged_out" | "open_page_required" | "route_drift";
      reason: string;
      chosenRoute: string | null;
      routeStatuses: Array<{
        routeKey: CursorPersonalRouteKey;
        status: CursorPersonalRouteCapture["status"];
        matchedUrl: string | null;
      }>;
    };

const BILLING_PERIOD_PATTERN =
  /\b[A-Z][a-z]{2}\s+\d{1,2}\s*-\s*[A-Z][a-z]{2}\s+\d{1,2}\b/;
const USAGE_SERIES_PATTERN =
  /usage per day across this billing period|billing period usage|usage by day|当前账单周期|本计费周期|使用情况/i;
const ON_DEMAND_PATTERN = /on-demand usage is (on|off)/i;
const PLAN_LABELS = new Set(["Hobby", "Pro", "Pro+", "Ultra", "Business", "Team"]);
const SECTION_LABELS = new Set(["Usage", "Your Usage", "By Model", "Spend"]);

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map(normalizeWhitespace).filter(Boolean))];
}

function buildFailure(
  status: "logged_out" | "open_page_required" | "route_drift",
  reason: string,
  fixture: Pick<CursorPersonalLiveFixture, "decision" | "routes">,
): CursorPersonalParseResult {
  return {
    status,
    reason,
    chosenRoute: fixture.decision.chosenRoute,
    routeStatuses: fixture.routes.map((route) => ({
      routeKey: route.routeKey,
      status: route.status,
      matchedUrl: route.matchedUrl,
    })),
  };
}

function parseBillingPeriodLabel(textSnippets: string[]): string | null {
  return (
    textSnippets.find((snippet) => BILLING_PERIOD_PATTERN.test(snippet)) ?? null
  );
}

function parseUsageSeriesLabel(textSnippets: string[]): string | null {
  return (
    textSnippets.find((snippet) => USAGE_SERIES_PATTERN.test(snippet)) ?? null
  );
}

function parseVisiblePlanLabels(textSnippets: string[]): string[] {
  return uniqueStrings(
    textSnippets.filter((snippet) => PLAN_LABELS.has(normalizeWhitespace(snippet))),
  );
}

function parseVisibleSectionLabels(textSnippets: string[]): string[] {
  return uniqueStrings(
    textSnippets.filter((snippet) =>
      SECTION_LABELS.has(normalizeWhitespace(snippet)),
    ),
  );
}

function parseOnDemandUsageState(
  textSnippets: string[],
): CursorOnDemandUsageState {
  const matchedSnippet = textSnippets.find((snippet) =>
    ON_DEMAND_PATTERN.test(snippet),
  );

  if (!matchedSnippet) {
    return null;
  }

  const matchedState = matchedSnippet.match(ON_DEMAND_PATTERN)?.[1]?.toLowerCase();
  return matchedState === "on" || matchedState === "off" ? matchedState : null;
}

function parseExportCsvAvailable(textSnippets: string[]): boolean {
  return textSnippets.some(
    (snippet) => normalizeWhitespace(snippet).toLowerCase() === "export csv",
  );
}

function parseSnapshotFromSummary(
  routeKey: CursorPersonalRouteKey,
  summary: CursorPersonalPageSummary,
): CursorPersonalUsageSnapshot | null {
  const textSnippets = uniqueStrings(summary.textSnippets);
  const billingPeriodLabel = parseBillingPeriodLabel(textSnippets);
  const usageSeriesLabel = parseUsageSeriesLabel(textSnippets);
  const visiblePlanLabels = parseVisiblePlanLabels(textSnippets);
  const visibleSectionLabels = parseVisibleSectionLabels(textSnippets);
  const onDemandUsageState = parseOnDemandUsageState(textSnippets);
  const exportCsvAvailable = parseExportCsvAvailable(textSnippets);

  const hasEnoughUsageSignals =
    summary.keywordSignals.hasUsageSignal &&
    (billingPeriodLabel !== null ||
      usageSeriesLabel !== null ||
      onDemandUsageState !== null ||
      exportCsvAvailable ||
      visibleSectionLabels.length > 0);

  if (!hasEnoughUsageSignals) {
    return null;
  }

  return {
    providerId: "cursor",
    providerLabel: "Cursor",
    measurementKind: "billing_period_usage",
    routeKey,
    sourceUrl: summary.url,
    sourceTitle: summary.title,
    localePrefix: summary.localePrefix,
    recommendedSurface: summary.recommendedSurface,
    billingPeriodLabel,
    usageSeriesLabel,
    visiblePlanLabels,
    visibleSectionLabels,
    onDemandUsageState,
    exportCsvAvailable,
    usedAvailability: "window_only",
    remainingAvailability: "unavailable",
    resetAvailability: "window_only",
    note:
      "Cursor personal usage currently supports billing-period usage context, plan metadata, and spend-state signals. It does not expose an exact included-request remainder in the current proven route.",
  };
}

function chooseMatchedRoute(
  fixture: CursorPersonalLiveFixture,
): CursorPersonalRouteCapture | null {
  if (fixture.decision.chosenRoute) {
    const matchedByDecision =
      fixture.routes.find(
        (route) =>
          route.matchedUrl === fixture.decision.chosenRoute && route.summary,
      ) ?? null;

    if (matchedByDecision?.summary) {
      return matchedByDecision;
    }
  }

  return fixture.routes.find((route) => route.summary) ?? null;
}

export function parseCursorPersonalPageSummary(
  routeKey: CursorPersonalRouteKey,
  summary: CursorPersonalPageSummary,
): CursorPersonalUsageSnapshot | null {
  return parseSnapshotFromSummary(routeKey, summary);
}

export function parseCursorPersonalLiveFixture(
  fixture: CursorPersonalLiveFixture,
): CursorPersonalParseResult {
  const matchedRoute = chooseMatchedRoute(fixture);

  if (!matchedRoute?.summary) {
    const hasLoggedOutRoute = fixture.routes.some(
      (route) => route.status === "logged_out",
    );

    return hasLoggedOutRoute
      ? buildFailure(
          "logged_out",
          "The current Cursor tab matched a logged-out state instead of a usable usage page. Sign in again and reopen the Cursor dashboard usage page.",
          fixture,
        )
      : buildFailure(
          "open_page_required",
          "Open the logged-in Cursor dashboard usage page before refreshing personal usage capture.",
          fixture,
        );
  }

  const snapshot = parseSnapshotFromSummary(
    matchedRoute.routeKey,
    matchedRoute.summary,
  );

  if (!snapshot) {
    return buildFailure(
      "route_drift",
      "The matched Cursor usage page no longer exposed parseable billing-period usage signals. Inspect the live route and update the parser.",
      fixture,
    );
  }

  return {
    status: "ok",
    snapshot,
  };
}

export function parseCursorPersonalEvidenceFixture(
  fixture: CursorPersonalEvidenceFixture,
): CursorPersonalUsageSnapshot | null {
  return parseSnapshotFromSummary("dashboard_usage", {
    url: fixture.route.url,
    title: fixture.route.title,
    heading: null,
    localePrefix: fixture.route.pathLocalePrefix,
    recommendedSurface: fixture.decision.recommendedSurface,
    textSnippets: fixture.visiblePageSignals.textSnippets,
    scriptMarkers: {
      hasNextDataScript: fixture.sourceSignals.hasNextDataScript,
      hasNextFlightStream: fixture.sourceSignals.hasNextFlightStream,
      hasBuildManifest: fixture.sourceSignals.hasBuildManifest,
      hasCloudflareChallenge: false,
    },
    keywordSignals: {
      hasUsageSignal:
        fixture.visiblePageSignals.currentBillingPeriodUsageVisible ||
        fixture.sourceSignals.hasVisibleUsageStringsInSource,
      hasRemainingSignal: fixture.visiblePageSignals.exactRemainingCounterVisible,
      hasRequestSignal: true,
      hasResetSignal: true,
      hasPlanSignal: fixture.visiblePageSignals.planMetadataVisible,
    },
  });
}
