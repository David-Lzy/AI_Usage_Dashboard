import type {
  ClaudePersonalLiveFixture,
  ClaudePersonalPageSummary,
  ClaudePersonalRouteCapture,
  ClaudePersonalRouteKey,
  ClaudeRecommendedExtractionSurface,
} from "./personal-page-capture";
import type {
  ClaudePersonalPlanIdentity,
  ClaudePersonalStructuredLimit,
  ClaudePersonalUsageContract,
} from "./personal-usage-contract";

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
  providerId: "claude-code-team-page";
  providerLabel: "Claude Personal";
  measurementKind: "usage_page_context";
  routeKey: ClaudePersonalRouteKey;
  sourceUrl: string;
  sourceTitle: string;
  sourceHeading: string | null;
  recommendedSurface: ClaudeRecommendedExtractionSurface;
  planIdentity?: ClaudePersonalPlanIdentity | null;
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
const COUNT_OF_TOTAL_PATTERN = /(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/;
const WINDOW_LABEL_PATTERN =
  /usage|limit|quota|remaining|left|available|messages?|premium|standard|opus|sonnet|5\s*-?\s*hour|5h|week|weekly|month|monthly|额度|配额|限制|剩余|消息|高级|标准|5\s*小时|每周|每月|月/i;
const CLAUDE_USAGE_ROW_LABEL_PATTERN =
  /^(?:current session|all models|claude design|daily included routine runs|daily routine runs|当前会话|所有模型|每日例程运行)$/i;
const CLAUDE_USAGE_SECTION_BOUNDARY_PATTERN =
  /^(?:your usage limits?|your limits?|weekly limits?|monthly limits?|additional features|last updated.*|team|你的使用限制|你的限制|每周限制|每月限制|附加功能|上次更新.*|团队)$/i;
const REMAINING_MARKER_PATTERN = /remaining|left|available|剩余|可用/i;
const USED_MARKER_PATTERN = /used|usage|consumed|使用|已用|消耗/i;
const RESET_LINE_PATTERN =
  /(?:reset(?:s| time)?|renews?|renewal|cycle|period|重置(?:时间)?|刷新|周期)(?:[:：]\s*)?(.+)/i;
const DETAIL_LINE_PATTERN =
  /starts when a message is sent|haven['’]t used|haven['’]t run|发送消息时开始|尚未使用|还没有使用|尚未运行|还没有运行/i;
const FACT_SIGNAL_PATTERN =
  /usage|remaining|limit|quota|reset|renews|billing|plan|team|pro|max|message|premium|standard|opus|sonnet|使用|剩余|额度|配额|限制|重置|账单|计划|团队|消息/i;
const VALUE_LIKE_PATTERN =
  /(\d|[%％]|\$|A\$|USD|AUD|remaining|left|available|剩余|可用|team|pro|max|团队|计划)/i;
const GENERIC_WINDOW_LABEL_PATTERN =
  /^(?:your usage limits?|your limits?|weekly limits|monthly limits|learn more(?: about (?:usage )?limits)?|starts when a message is sent|reset(?:s| time)?(?: in| at)?.*|renews?(?: in| at)?.*|usage|claude code|team|projects?|invite team members?|settings|profile|account|你的使用限制|你的限制|每周限制|每月限制|了解(?:更多)?(?:使用)?限制|发送消息时开始|使用情况|团队|项目|邀请团队成员)$/i;
const MEANINGFUL_WINDOW_LABEL_PATTERN =
  /usage window|usage limit|quota|limit|messages?|premium|standard|opus|sonnet|5\s*-?\s*hour|5h|week|weekly|month|monthly|daily|current session|all models|claude design|routine runs|额度|配额|限制|消息|高级|标准|5\s*小时|每周|每月|每日|当前会话|所有模型|例程运行|月/i;
const GENERIC_FACT_LABEL_PATTERN =
  /^(?:visible claude usage signal|usage|your usage limits?|your limits?|weekly limits|monthly limits|learn more(?: about (?:usage )?limits)?|starts when a message is sent|reset(?:s| time)?(?: in| at)?.*|renews?(?: in| at)?.*|claude code|team|projects?|invite team members?|settings|profile|account|使用情况|你的使用限制|你的限制|每周限制|每月限制|团队|项目|邀请团队成员)$/i;
const GENERIC_FACT_VALUE_PATTERN =
  /^(?:usage|your usage limits?|your limits?|weekly limits|monthly limits|learn more(?: about (?:usage )?limits)?|starts when a message is sent|claude code|team|projects?|invite team members?|settings|profile|account|使用情况|你的使用限制|你的限制|每周限制|每月限制|团队|项目|邀请团队成员)$/i;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeComparableLabel(value: string): string {
  return normalizeWhitespace(value)
    .replace(/[.。]+$/g, "")
    .trim();
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

function parseCountOfTotal(
  value: string,
): { used: number; total: number } | null {
  const match = normalizeWhitespace(value).match(COUNT_OF_TOTAL_PATTERN);

  if (!match) {
    return null;
  }

  const used = Number.parseFloat(match[1] ?? "");
  const total = Number.parseFloat(match[2] ?? "");

  if (
    !Number.isFinite(used) ||
    !Number.isFinite(total) ||
    used < 0 ||
    total <= 0
  ) {
    return null;
  }

  return {
    used: Math.min(used, total),
    total,
  };
}

function toBoundedPercent(value: number): number {
  return Math.max(0, Math.min(100, Number(value.toFixed(2))));
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
  const strippedLabel = normalizeWhitespace(
    label
      .replace(/\s*(?:[:：]\s*)?\d{1,3}(?:\.\d+)?\s*[%％].*$/i, "")
      .replace(/\s*[·,，;；|/-]\s*$/g, ""),
  );
  const lowerLabel = strippedLabel.toLowerCase();

  if (/^current session$/i.test(strippedLabel)) {
    return "Current session";
  }

  if (/^all models$/i.test(strippedLabel)) {
    return kind === "weekly" ? "All models weekly limit" : "All models";
  }

  if (/^claude design$/i.test(strippedLabel)) {
    return "Claude Design";
  }

  if (/routine runs/i.test(lowerLabel)) {
    return "Daily included routine runs";
  }

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
    strippedLabel,
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

function isMeaningfulWindowLabel(
  label: string,
  kind: ClaudePersonalWindowKind,
): boolean {
  const comparableLabel = normalizeComparableLabel(label);

  if (!comparableLabel || GENERIC_WINDOW_LABEL_PATTERN.test(comparableLabel)) {
    return false;
  }

  if (kind !== "unknown") {
    return true;
  }

  return MEANINGFUL_WINDOW_LABEL_PATTERN.test(comparableLabel);
}

function isMeaningfulFact(label: string, value: string): boolean {
  const comparableLabel = normalizeComparableLabel(label);
  const comparableValue = normalizeComparableLabel(value);

  if (!comparableValue || GENERIC_FACT_VALUE_PATTERN.test(comparableValue)) {
    return false;
  }

  if (GENERIC_FACT_LABEL_PATTERN.test(comparableLabel)) {
    return false;
  }

  return true;
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

function extractDetailText(context: string[]): string | null {
  return (
    context
      .map(normalizeWhitespace)
      .find((line) => DETAIL_LINE_PATTERN.test(line)) ?? null
  );
}

function createWindowFromContext(
  labelLine: string,
  context: string[],
  sectionContext = "",
): ClaudePersonalUsageWindow | null {
  const percentLine =
    context.find(
      (line) => PERCENT_PATTERN.test(line) && REMAINING_MARKER_PATTERN.test(line),
    ) ??
    context.find((line) => PERCENT_PATTERN.test(line) && USED_MARKER_PATTERN.test(line)) ??
    context.find((line) => PERCENT_PATTERN.test(line)) ??
    null;
  const countLine =
    percentLine === null
      ? (context.find((line) => COUNT_OF_TOTAL_PATTERN.test(line)) ?? null)
      : null;

  if (!percentLine && !countLine) {
    return null;
  }

  const label =
    stripRuntimeValues(labelLine) ||
    stripRuntimeValues(percentLine ?? countLine ?? "");
  const kind = classifyWindowKind(
    `${label} ${percentLine ?? countLine ?? ""} ${sectionContext}`,
  );
  const normalizedLabel = normalizeWindowLabel(label, kind);

  if (!isMeaningfulWindowLabel(label, kind)) {
    return null;
  }

  const resetText = extractResetText(context);
  const detailText = resetText ?? extractDetailText(context);

  if (percentLine) {
    const percentValue = parsePercent(percentLine);

    if (percentValue === null) {
      return null;
    }

    const hasRemainingMarker = REMAINING_MARKER_PATTERN.test(
      `${labelLine} ${percentLine}`,
    );
    const hasUsedMarker = USED_MARKER_PATTERN.test(`${labelLine} ${percentLine}`);
    const remainingPercent =
      hasUsedMarker && !hasRemainingMarker ? 100 - percentValue : percentValue;
    const usedPercent =
      hasUsedMarker && !hasRemainingMarker ? percentValue : 100 - remainingPercent;

    return {
      label: normalizeWhitespace(label || normalizedLabel),
      normalizedLabel,
      kind,
      remainingPercent,
      usedPercent,
      totalPercent: 100,
      resetAt: resetText ? normalizeResetAt(resetText) : null,
      resetText: detailText,
    };
  }

  const countValue = countLine ? parseCountOfTotal(countLine) : null;

  if (!countValue) {
    return null;
  }

  const usedPercent = toBoundedPercent((countValue.used / countValue.total) * 100);
  const remainingPercent = toBoundedPercent(100 - usedPercent);

  return {
    label: normalizeWhitespace(label || normalizedLabel),
    normalizedLabel,
    kind,
    remainingPercent,
    usedPercent,
    totalPercent: 100,
    resetAt: resetText ? normalizeResetAt(resetText) : null,
    resetText: resetText ?? normalizeWhitespace(countLine ?? "") ?? detailText,
  };
}

function isUsageWindowLabelCandidate(line: string): boolean {
  return (
    !PERCENT_PATTERN.test(line) &&
    !COUNT_OF_TOTAL_PATTERN.test(line) &&
    (CLAUDE_USAGE_ROW_LABEL_PATTERN.test(line) || WINDOW_LABEL_PATTERN.test(line))
  );
}

function isClaudeUsageContextBoundary(line: string): boolean {
  return (
    CLAUDE_USAGE_ROW_LABEL_PATTERN.test(line) ||
    CLAUDE_USAGE_SECTION_BOUNDARY_PATTERN.test(line)
  );
}

function buildWindowContext(
  snippets: string[],
  index: number,
): { context: string[]; sectionContext: string } {
  const context = [snippets[index] ?? ""].filter(Boolean);
  const sectionContext = snippets
    .slice(Math.max(0, index - 4), index)
    .filter((line) => CLAUDE_USAGE_SECTION_BOUNDARY_PATTERN.test(line))
    .join(" ");

  for (
    let contextIndex = index + 1;
    contextIndex < snippets.length && context.length < 8;
    contextIndex += 1
  ) {
    const line = snippets[contextIndex] ?? "";

    if (contextIndex > index + 1 && isClaudeUsageContextBoundary(line)) {
      break;
    }

    context.push(line);

    if (PERCENT_PATTERN.test(line) || COUNT_OF_TOTAL_PATTERN.test(line)) {
      const nextLine = snippets[contextIndex + 1] ?? "";

      if (isClaudeUsageContextBoundary(nextLine)) {
        break;
      }
    }
  }

  return {
    context,
    sectionContext,
  };
}

function parseUsageWindows(textSnippets: string[]): ClaudePersonalUsageWindow[] {
  const windows: ClaudePersonalUsageWindow[] = [];
  const normalizedSnippets = textSnippets.map(normalizeWhitespace).filter(Boolean);
  const seenLabels = new Set<string>();

  for (let index = 0; index < normalizedSnippets.length; index += 1) {
    const line = normalizedSnippets[index] ?? "";

    if (
      !isUsageWindowLabelCandidate(line) &&
      !PERCENT_PATTERN.test(line) &&
      !COUNT_OF_TOTAL_PATTERN.test(line)
    ) {
      continue;
    }

    const previousLine = normalizedSnippets[index - 1] ?? "";
    const labelLine =
      isUsageWindowLabelCandidate(line)
        ? line
        : isUsageWindowLabelCandidate(previousLine)
          ? previousLine
          : line;
    const { context, sectionContext } = buildWindowContext(
      normalizedSnippets,
      isUsageWindowLabelCandidate(line) ? index : Math.max(0, index - 1),
    );
    const window = createWindowFromContext(labelLine, context, sectionContext);

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

    if (seenValues.has(dedupeKey) || !isMeaningfulFact(label, value)) {
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
  const orderedTextSnippets = summary.textSnippets
    .map(normalizeWhitespace)
    .filter(Boolean);
  const textSnippets = uniqueStrings(summary.textSnippets);
  const windows = parseUsageWindows(orderedTextSnippets);
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
    providerId: "claude-code-team-page",
    providerLabel: "Claude Personal",
    measurementKind: "usage_page_context",
    routeKey,
    sourceUrl: summary.url,
    sourceTitle: summary.title,
    sourceHeading: summary.heading,
    recommendedSurface: summary.recommendedSurface,
    planIdentity: null,
    primaryWindow,
    windows,
    facts,
    usedAvailability: "window_only",
    remainingAvailability: primaryWindow ? "exact" : "unavailable",
    resetAvailability: windows.some((window) => window.resetAt)
      ? "window_only"
      : "unavailable",
    note:
      "Claude personal usage-page sync reads shared plan usage context only. It does not claim an absolute remaining allowance unless the verified source exposes an exact percentage.",
  };
}

function normalizeStructuredLimitLabel(
  limit: ClaudePersonalStructuredLimit,
): string {
  if (limit.kind === "session" || limit.group === "session") {
    return "Current session";
  }
  if (limit.kind === "weekly_all") {
    return "All models weekly limit";
  }
  if (limit.scope) {
    return limit.scope;
  }

  return limit.kind.replace(/[_-]+/g, " ").replace(/^./, (value) =>
    value.toUpperCase(),
  );
}

function structuredLimitToWindow(
  limit: ClaudePersonalStructuredLimit,
): ClaudePersonalUsageWindow {
  const normalizedLabel = normalizeStructuredLimitLabel(limit);
  return {
    label: normalizedLabel,
    normalizedLabel,
    kind:
      limit.kind === "session" || limit.group === "session"
        ? "rolling_5h"
        : limit.group === "weekly" || limit.kind.startsWith("weekly")
          ? "weekly"
          : "unknown",
    remainingPercent: limit.remainingPercent,
    usedPercent: limit.usedPercent,
    totalPercent: 100,
    resetAt: limit.resetsAt,
    resetText: limit.resetsAt,
  };
}

function formatMinorCurrency(
  amountMinor: number,
  currency: string,
  exponent: number,
): string {
  const divisor = 10 ** Math.min(Math.max(Math.trunc(exponent), 0), 6);
  return `${currency} ${(amountMinor / divisor).toFixed(Math.min(exponent, 2))}`;
}

function buildStructuredUsageFacts(
  contract: ClaudePersonalUsageContract,
): ClaudePersonalUsageFact[] {
  const facts: ClaudePersonalUsageFact[] = [];
  const extraUsage = contract.extraUsage;
  if (extraUsage) {
    facts.push({
      label: "Usage credits",
      value: extraUsage.isEnabled ? "Enabled" : "Disabled",
      detail: extraUsage.disabledReason,
    });

    if (
      extraUsage.spentAmountMinor !== null &&
      (extraUsage.spentAmountMinor > 0 || extraUsage.isEnabled) &&
      extraUsage.spentCurrency &&
      extraUsage.spentExponent !== null
    ) {
      facts.push({
        label: "Extra usage spent",
        value: formatMinorCurrency(
          extraUsage.spentAmountMinor,
          extraUsage.spentCurrency,
          extraUsage.spentExponent,
        ),
        detail: null,
      });
    }
  }

  if (contract.credits && contract.credits.balanceCredits !== null) {
    facts.push({
      label: "Credit balance",
      value: String(contract.credits.balanceCredits),
      detail: contract.credits.nextExpiresAt,
    });
  } else if (
    contract.credits?.amount !== null &&
    contract.credits?.currency
  ) {
    facts.push({
      label: "Credit balance",
      value: `${contract.credits.currency} ${contract.credits.amount}`,
      detail: contract.credits.nextExpiresAt,
    });
  }

  return facts;
}

function parseSnapshotFromStructuredContract(
  routeKey: ClaudePersonalRouteKey,
  summary: ClaudePersonalPageSummary,
  contract: ClaudePersonalUsageContract,
): ClaudePersonalUsageSnapshot | null {
  const windows = contract.limits
    .filter((limit) => limit.isActive)
    .map(structuredLimitToWindow);
  const facts = buildStructuredUsageFacts(contract);
  const primaryWindow = choosePrimaryWindow(windows);

  if (windows.length === 0 && facts.length === 0 && !contract.planIdentity) {
    return null;
  }

  return {
    providerId: "claude-code-team-page",
    providerLabel: "Claude Personal",
    measurementKind: "usage_page_context",
    routeKey,
    sourceUrl: summary.url,
    sourceTitle: summary.title,
    sourceHeading: summary.heading,
    recommendedSurface: "network_observer",
    planIdentity: contract.planIdentity,
    primaryWindow,
    windows,
    facts,
    usedAvailability: "window_only",
    remainingAvailability: primaryWindow ? "exact" : "unavailable",
    resetAvailability: windows.some((window) => window.resetAt)
      ? "window_only"
      : "unavailable",
    note:
      "Claude personal usage sync reads bounded aggregate plan windows and separate usage-credit state. It does not store raw responses or claim a synthetic plan-wide balance.",
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
        "The current Claude usage page is logged out, redirected to an upgrade gate, or otherwise not exposing a usable personal usage surface. Sign in with the paid personal account and reopen the usage page.",
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
      "Open the logged-in Claude personal usage page before refreshing Claude usage capture.",
      fixture,
    );
  }

  const snapshot = parseSnapshotFromSummary(
    matchedRoute.routeKey,
    matchedRoute.summary,
  );
  const preferredSnapshot = matchedRoute.usageContract
    ? parseSnapshotFromStructuredContract(
        matchedRoute.routeKey,
        matchedRoute.summary,
        matchedRoute.usageContract,
      ) ?? snapshot
    : snapshot;

  if (!preferredSnapshot) {
    return buildFailure(
      "route_drift",
      "The matched Claude usage page no longer exposed parseable usage, plan, or quota signals. Inspect the live route and update the parser.",
      fixture,
    );
  }

  return {
    status: "ok",
    snapshot: preferredSnapshot,
  };
}
