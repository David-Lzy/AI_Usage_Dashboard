import type {
  ClaudePersonalLiveFixture,
  ClaudePersonalPageSummary,
  ClaudePersonalRouteCapture,
  ClaudePersonalRouteKey,
  ClaudeRecommendedExtractionSurface,
} from "./personal-page-capture";

export type ClaudePersonalWindowKind =
  | "rolling_5h"
  | "weekly"
  | "monthly"
  | "unknown";

export type ClaudePersonalUsageWindow = {
  label: string;
  normalizedLabel: string;
  kind: ClaudePersonalWindowKind;
  remainingPercent: number | null;
  usedPercent: number | null;
  totalPercent: number | null;
  resetAt: string | null;
  resetText: string | null;
};

export type ClaudePersonalUsageFact = {
  label: string;
  value: string;
  detail: string | null;
};

export type ClaudePersonalUsageSnapshot = {
  providerId: "claude-code";
  providerLabel: "Claude Code";
  measurementKind: "usage_page_context";
  routeKey: ClaudePersonalRouteKey;
  sourceUrl: string;
  sourceTitle: string;
  sourceHeading: string | null;
  recommendedSurface: ClaudeRecommendedExtractionSurface;
  primaryWindow: ClaudePersonalUsageWindow | null;
  windows: ClaudePersonalUsageWindow[];
  facts: ClaudePersonalUsageFact[];
  usedAvailability: "window_only";
  remainingAvailability: "exact" | "unavailable";
  resetAvailability: "window_only" | "unavailable";
  note: string;
};

export type ClaudePersonalParseResult =
  | {
      status: "ok";
      snapshot: ClaudePersonalUsageSnapshot;
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
        routeKey: ClaudePersonalRouteKey;
        status: ClaudePersonalRouteCapture["status"];
        matchedUrl: string | null;
      }>;
    };

const PERCENT_PATTERN = /(\d{1,3}(?:\.\d+)?)\s*[%％]/;
const WINDOW_LABEL_PATTERN =
  /usage|limit|quota|remaining|left|available|messages?|premium|standard|opus|sonnet|5\s*-?\s*hour|5h|week|weekly|month|monthly|额度|配额|限制|剩余|消息|高级|标准|5\s*小时|每周|每月|月/i;
const REMAINING_MARKER_PATTERN = /remaining|left|available|剩余|可用/i;
const USED_MARKER_PATTERN = /used|usage|consumed|使用|已用|消耗/i;
const RESET_LINE_PATTERN =
  /(?:reset(?:s| time)?|renews?|renewal|cycle|period|重置(?:时间)?|刷新|周期)(?:[:：]\s*)?(.+)/i;
const FACT_SIGNAL_PATTERN =
  /usage|remaining|limit|quota|reset|renews|billing|plan|team|pro|max|message|premium|standard|opus|sonnet|使用|剩余|额度|配额|限制|重置|账单|计划|团队|消息/i;
const VALUE_LIKE_PATTERN =
  /(\d|[%％]|\$|A\$|USD|AUD|remaining|left|available|剩余|可用|team|pro|max|团队|计划)/i;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map(normalizeWhitespace).filter(Boolean))];
}

function parsePercent(value: string): number | null {
  const matchedValue = normalizeWhitespace(value).match(PERCENT_PATTERN)?.[1];

  if (!matchedValue) {
    return null;
  }

  const parsed = Number.parseFloat(matchedValue);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    return null;
  }

  return parsed;
}

function classifyWindowKind(label: string): ClaudePersonalWindowKind {
  const lowerLabel = label.toLowerCase();

  if (/5\s*-?\s*hour|5h|5\s*小时/i.test(lowerLabel)) {
    return "rolling_5h";
  }

  if (/week|weekly|每周/i.test(lowerLabel)) {
    return "weekly";
  }

  if (/month|monthly|每月|月/i.test(lowerLabel)) {
    return "monthly";
  }

  return "unknown";
}

function normalizeWindowLabel(
  label: string,
  kind: ClaudePersonalWindowKind,
): string {
  if (kind === "rolling_5h") {
    return "5-hour usage window";
  }

  if (kind === "weekly") {
    return "Weekly usage window";
  }

  if (kind === "monthly") {
    return "Monthly usage window";
  }

  return normalizeWhitespace(
    label
      .replace(/\s*(?:[:：]\s*)?\d{1,3}(?:\.\d+)?\s*[%％].*$/i, "")
      .replace(/\s*[·,，;；|/-]\s*$/g, ""),
  );
}

function stripRuntimeValues(label: string): string {
  return normalizeWhitespace(
    label
      .replace(
        /\s*(?:reset(?:s| time)?|renews?|renewal|cycle|period|重置(?:时间)?|刷新|周期)(?:[:：]\s*)?.*$/i,
        "",
      )
      .replace(/\s*\d{1,3}(?:\.\d+)?\s*[%％]\s*(?:remaining|left|available|剩余|可用)?/gi, "")
      .replace(/\b(?:remaining|left|available|used|usage)\b|(?:剩余|可用|已用|使用)/gi, "")
      .replace(/\s*[·,，;；|/-]\s*$/g, ""),
  );
}

function normalizeResetAt(value: string): string {
  const trimmedValue = normalizeWhitespace(value);
  const zhMatch = trimmedValue.match(
    /(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{2})/,
  );

  if (zhMatch) {
    const [, year, month, day, hour, minute] = zhMatch;
    return `${year}-${month!.padStart(2, "0")}-${day!.padStart(2, "0")} ${hour!.padStart(2, "0")}:${minute}`;
  }

  const isoLikeMatch = trimmedValue.match(
    /(\d{4})[-/](\d{1,2})[-/](\d{1,2})\s+(\d{1,2}):(\d{2})/,
  );

  if (isoLikeMatch) {
    const [, year, month, day, hour, minute] = isoLikeMatch;
    return `${year}-${month!.padStart(2, "0")}-${day!.padStart(2, "0")} ${hour!.padStart(2, "0")}:${minute}`;
  }

  return trimmedValue;
}

function extractResetText(context: string[]): string | null {
  const resetLine =
    context.find((line) => RESET_LINE_PATTERN.test(line)) ?? null;

  if (!resetLine) {
    return null;
  }

  const resetValue =
    normalizeWhitespace(resetLine).match(RESET_LINE_PATTERN)?.[1] ?? resetLine;

  return normalizeWhitespace(resetValue);
}

function createWindowFromContext(
  labelLine: string,
  context: string[],
): ClaudePersonalUsageWindow | null {
  const percentLine =
    context.find(
      (line) => PERCENT_PATTERN.test(line) && REMAINING_MARKER_PATTERN.test(line),
    ) ??
    context.find((line) => PERCENT_PATTERN.test(line) && USED_MARKER_PATTERN.test(line)) ??
    context.find((line) => PERCENT_PATTERN.test(line)) ??
    null;

  if (!percentLine) {
    return null;
  }

  const percentValue = parsePercent(percentLine);

  if (percentValue === null) {
    return null;
  }

  const label = stripRuntimeValues(labelLine) || stripRuntimeValues(percentLine);
  const kind = classifyWindowKind(`${label} ${percentLine}`);
  const normalizedLabel = normalizeWindowLabel(label, kind);
  const hasRemainingMarker = REMAINING_MARKER_PATTERN.test(
    `${labelLine} ${percentLine}`,
  );
  const hasUsedMarker = USED_MARKER_PATTERN.test(`${labelLine} ${percentLine}`);
  const remainingPercent = hasUsedMarker && !hasRemainingMarker
    ? 100 - percentValue
    : percentValue;
  const usedPercent = hasUsedMarker && !hasRemainingMarker
    ? percentValue
    : 100 - remainingPercent;
  const resetText = extractResetText(context);

  return {
    label: normalizeWhitespace(label || normalizedLabel),
    normalizedLabel,
    kind,
    remainingPercent,
    usedPercent,
    totalPercent: 100,
    resetAt: resetText ? normalizeResetAt(resetText) : null,
    resetText,
  };
}

function parseUsageWindows(textSnippets: string[]): ClaudePersonalUsageWindow[] {
  const windows: ClaudePersonalUsageWindow[] = [];
  const normalizedSnippets = textSnippets.map(normalizeWhitespace).filter(Boolean);
  const seenLabels = new Set<string>();

  for (let index = 0; index < normalizedSnippets.length; index += 1) {
    const line = normalizedSnippets[index] ?? "";

    if (!WINDOW_LABEL_PATTERN.test(line) && !PERCENT_PATTERN.test(line)) {
      continue;
    }

    const previousLine = normalizedSnippets[index - 1] ?? "";
    const labelLine =
      WINDOW_LABEL_PATTERN.test(line) && !PERCENT_PATTERN.test(line)
        ? line
        : WINDOW_LABEL_PATTERN.test(previousLine)
          ? previousLine
          : line;
    const context = normalizedSnippets.slice(Math.max(0, index - 1), index + 6);
    const window = createWindowFromContext(labelLine, context);

    if (!window || seenLabels.has(window.normalizedLabel)) {
      continue;
    }

    seenLabels.add(window.normalizedLabel);
    windows.push(window);
  }

  return windows;
}

function parseUsageFacts(textSnippets: string[]): ClaudePersonalUsageFact[] {
  const facts: ClaudePersonalUsageFact[] = [];
  const normalizedSnippets = textSnippets.map(normalizeWhitespace).filter(Boolean);
  const seenValues = new Set<string>();

  for (let index = 0; index < normalizedSnippets.length; index += 1) {
    const snippet = normalizedSnippets[index] ?? "";

    if (!FACT_SIGNAL_PATTERN.test(snippet)) {
      continue;
    }

    const nextSnippet = normalizedSnippets[index + 1] ?? "";
    const hasStandaloneValue =
      nextSnippet.length > 0 &&
      nextSnippet.length <= 120 &&
      VALUE_LIKE_PATTERN.test(nextSnippet) &&
      !FACT_SIGNAL_PATTERN.test(nextSnippet);

    if (!hasStandaloneValue && !VALUE_LIKE_PATTERN.test(snippet)) {
      continue;
    }

    const value = hasStandaloneValue ? nextSnippet : snippet;
    const label = hasStandaloneValue ? snippet : "Visible Claude usage signal";
    const dedupeKey = `${label}=${value}`;

    if (seenValues.has(dedupeKey)) {
      continue;
    }

    seenValues.add(dedupeKey);
    facts.push({
      label,
      value,
      detail: null,
    });

    if (facts.length >= 8) {
      break;
    }
  }

  return facts;
}

function choosePrimaryWindow(
  windows: ClaudePersonalUsageWindow[],
): ClaudePersonalUsageWindow | null {
  return (
    windows
      .filter((window) => window.remainingPercent !== null)
      .reduce<ClaudePersonalUsageWindow | null>((lowest, window) => {
        if (!lowest) {
          return window;
        }

        const lowestRemaining = lowest.remainingPercent ?? Number.POSITIVE_INFINITY;
        const currentRemaining =
          window.remainingPercent ?? Number.POSITIVE_INFINITY;

        return currentRemaining < lowestRemaining ? window : lowest;
      }, null) ?? null
  );
}

function buildFailure(
  status:
    | "logged_out"
    | "open_page_required"
    | "capture_unavailable"
    | "route_drift",
  reason: string,
  fixture: Pick<ClaudePersonalLiveFixture, "decision" | "routes">,
): ClaudePersonalParseResult {
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

function parseSnapshotFromSummary(
  routeKey: ClaudePersonalRouteKey,
  summary: ClaudePersonalPageSummary,
): ClaudePersonalUsageSnapshot | null {
  const textSnippets = uniqueStrings(summary.textSnippets);
  const windows = parseUsageWindows(textSnippets);
  const facts = parseUsageFacts(textSnippets);
  const primaryWindow = choosePrimaryWindow(windows);
  const hasEnoughUsageSignals =
    summary.keywordSignals.hasUsageSignal &&
    (windows.length > 0 ||
      facts.length > 0 ||
      summary.keywordSignals.hasPlanSignal ||
      summary.keywordSignals.hasTeamSignal);

  if (!hasEnoughUsageSignals) {
    return null;
  }

  return {
    providerId: "claude-code",
    providerLabel: "Claude Code",
    measurementKind: "usage_page_context",
    routeKey,
    sourceUrl: summary.url,
    sourceTitle: summary.title,
    sourceHeading: summary.heading,
    recommendedSurface: summary.recommendedSurface,
    primaryWindow,
    windows,
    facts,
    usedAvailability: "window_only",
    remainingAvailability: primaryWindow ? "exact" : "unavailable",
    resetAvailability: windows.some((window) => window.resetAt)
      ? "window_only"
      : "unavailable",
    note:
      "Claude Team usage-page sync reads visible page context only. It does not claim an absolute remaining included quota unless the page exposes a visible remaining percentage.",
  };
}

function chooseMatchedRoute(
  fixture: ClaudePersonalLiveFixture,
): ClaudePersonalRouteCapture | null {
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

export function parseClaudePersonalPageSummary(
  routeKey: ClaudePersonalRouteKey,
  summary: ClaudePersonalPageSummary,
): ClaudePersonalUsageSnapshot | null {
  return parseSnapshotFromSummary(routeKey, summary);
}

export function parseClaudePersonalLiveFixture(
  fixture: ClaudePersonalLiveFixture,
): ClaudePersonalParseResult {
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
        "The current Claude usage page is logged out, redirected to an upgrade gate, or otherwise not exposing a usable Team usage surface. Sign in with the Team account and reopen the usage page.",
        fixture,
      );
    }

    if (hasCaptureUnavailableRoute) {
      return buildFailure(
        "capture_unavailable",
        "The open Claude usage page could not be read by the extension. Reload the page, confirm host access, then refresh again.",
        fixture,
      );
    }

    return buildFailure(
      "open_page_required",
      "Open the logged-in Claude settings usage page before refreshing Claude Team usage capture.",
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
      "The matched Claude usage page no longer exposed parseable usage, plan, or quota signals. Inspect the live route and update the parser.",
      fixture,
    );
  }

  return {
    status: "ok",
    snapshot,
  };
}
