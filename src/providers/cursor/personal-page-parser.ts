import type {
  CursorPersonalLiveFixture,
  CursorPersonalPageSummary,
  CursorPersonalRouteCapture,
  CursorPersonalRouteKey,
  CursorRecommendedExtractionSurface,
} from "./personal-page-capture";
import {
  mergeCursorObservedUsageBillingContracts,
  type CursorObservedUsageBillingContract,
} from "./usage-billing-contract";

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

export type CursorPersonalSpendCard = {
  label: string;
  normalizedLabel: "total_spend" | "included" | "on_demand";
  amountText: string;
  amount: number | null;
  currency: "USD" | null;
};

export type CursorPersonalUsageSnapshot = {
  providerId: "cursor-personal-page";
  providerLabel: "Cursor";
  capturedAt: string;
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
  spendCards: CursorPersonalSpendCard[];
  onDemandUsageState: CursorOnDemandUsageState;
  exportCsvAvailable: boolean;
  usageBillingContract: CursorObservedUsageBillingContract | null;
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
      status:
        | "logged_out"
        | "open_page_required"
        | "capture_unavailable"
        | "route_drift";
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
const SPEND_CARD_LABELS = new Map<
  string,
  CursorPersonalSpendCard["normalizedLabel"]
>([
  ["total spend", "total_spend"],
  ["included", "included"],
  ["on-demand", "on_demand"],
]);
const MONEY_AMOUNT_PATTERN = /^\$([0-9][0-9,]*(?:\.\d{1,2})?)$/;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map(normalizeWhitespace).filter(Boolean))];
}

function buildFailure(
  status:
    | "logged_out"
    | "open_page_required"
    | "capture_unavailable"
    | "route_drift",
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

function parseMoneyAmount(value: string): number | null {
  const matchedAmount = normalizeWhitespace(value).match(MONEY_AMOUNT_PATTERN)?.[1];

  if (!matchedAmount) {
    return null;
  }

  const parsedAmount = Number.parseFloat(matchedAmount.replaceAll(",", ""));

  return Number.isFinite(parsedAmount) ? parsedAmount : null;
}

function parseSpendCards(textSnippets: string[]): CursorPersonalSpendCard[] {
  const normalizedSnippets = textSnippets.map(normalizeWhitespace);
  const spendCards: CursorPersonalSpendCard[] = [];

  for (let index = 0; index < normalizedSnippets.length; index += 1) {
    const label = normalizedSnippets[index] ?? "";
    const normalizedLabel = SPEND_CARD_LABELS.get(label.toLowerCase());

    if (!normalizedLabel) {
      continue;
    }

    const amountText =
      normalizedSnippets
        .slice(index + 1, index + 4)
        .find((snippet) => MONEY_AMOUNT_PATTERN.test(snippet)) ?? null;

    if (!amountText) {
      continue;
    }

    spendCards.push({
      label,
      normalizedLabel,
      amountText,
      amount: parseMoneyAmount(amountText),
      currency: "USD",
    });
  }

  return spendCards;
}

function parseSnapshotFromSummary(
  routeKey: CursorPersonalRouteKey,
  summary: CursorPersonalPageSummary,
  usageBillingContract: CursorObservedUsageBillingContract | null = null,
  capturedAt = new Date(0).toISOString(),
): CursorPersonalUsageSnapshot | null {
  const rawTextSnippets = summary.textSnippets
    .map(normalizeWhitespace)
    .filter(Boolean);
  const textSnippets = uniqueStrings(rawTextSnippets);
  const contractSummary = usageBillingContract?.usageSummary;
  const billingPeriodLabel =
    parseBillingPeriodLabel(textSnippets) ??
    (contractSummary
      ? `${contractSummary.billingCycleStart.slice(0, 10)} - ${contractSummary.billingCycleEnd.slice(0, 10)}`
      : null);
  const usageSeriesLabel = parseUsageSeriesLabel(textSnippets);
  const visiblePlanLabels = uniqueStrings([
    ...parseVisiblePlanLabels(textSnippets),
    usageBillingContract?.planInfo?.planInfo?.planName ?? "",
    contractSummary?.membershipType ?? "",
  ]);
  const visibleSectionLabels = parseVisibleSectionLabels(textSnippets);
  const spendCards = parseSpendCards(rawTextSnippets);
  const onDemandUsageState =
    parseOnDemandUsageState(textSnippets) ??
    (contractSummary?.individualUsage.onDemand
      ? contractSummary.individualUsage.onDemand.enabled
        ? "on"
        : "off"
      : null);
  const exportCsvAvailable = parseExportCsvAvailable(textSnippets);

  const hasEnoughUsageSignals =
    (summary.keywordSignals.hasUsageSignal || usageBillingContract !== null) &&
    (billingPeriodLabel !== null ||
      usageSeriesLabel !== null ||
      onDemandUsageState !== null ||
      exportCsvAvailable ||
      spendCards.length > 0 ||
      visibleSectionLabels.length > 0 ||
      usageBillingContract !== null);

  if (!hasEnoughUsageSignals) {
    return null;
  }

  return {
    providerId: "cursor-personal-page",
    providerLabel: "Cursor",
    capturedAt,
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
    spendCards,
    onDemandUsageState,
    exportCsvAvailable,
    usageBillingContract,
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

  return (
    fixture.routes.find(
      (route) => route.routeKey === "dashboard_usage" && route.summary,
    ) ?? fixture.routes.find((route) => route.summary) ?? null
  );
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
    const hasCaptureUnavailableRoute = fixture.routes.some(
      (route) => route.status === "capture_unavailable",
    );

    if (hasLoggedOutRoute) {
      return buildFailure(
        "logged_out",
        "The current Cursor tab matched a logged-out state instead of a usable usage page. Sign in again and reopen the Cursor dashboard usage page.",
        fixture,
      );
    }

    if (hasCaptureUnavailableRoute) {
      return buildFailure(
        "capture_unavailable",
        "The open Cursor dashboard usage page could not be read by the extension. Reload the page, confirm host access, then refresh again.",
        fixture,
      );
    }

    return buildFailure(
      "open_page_required",
      "Open the logged-in Cursor dashboard usage page before refreshing personal usage capture.",
      fixture,
    );
  }

  const snapshot = parseSnapshotFromSummary(
    matchedRoute.routeKey,
    matchedRoute.summary,
    mergeCursorObservedUsageBillingContracts(
      fixture.routes.map((route) => route.usageBillingContract),
    ),
    fixture.capturedAt,
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
  }, null, fixture.capturedAt);
}
