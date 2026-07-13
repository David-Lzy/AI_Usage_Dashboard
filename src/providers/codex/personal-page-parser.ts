import type {
  CodexPersonalLiveFixture,
  CodexPersonalPageSummary,
  CodexPersonalRouteCapture,
  CodexPersonalRouteKey,
} from "./personal-page-capture";

export type CodexPersonalWindowKind =
  | "rolling_5h"
  | "weekly"
  | "model_rolling_5h"
  | "model_weekly"
  | "unknown";

export type CodexPersonalUsageWindow = {
  label: string;
  normalizedLabel: string;
  kind: CodexPersonalWindowKind;
  modelLabel: string | null;
  remainingPercent: number | null;
  usedPercent: number | null;
  totalPercent: number | null;
  resetAt: string | null;
  resetText: string | null;
};

export type CodexPersonalUsageBalance = {
  label: string;
  normalizedLabel: string;
  kind: "flex_credit_balance" | "unknown";
  remainingCredits: number | null;
  totalCredits: number | null;
  detail: string | null;
};

export type CodexPersonalUsageSnapshot = {
  providerId: "codex-personal-page";
  providerLabel: "Codex";
  measurementKind: "window_percent";
  routeKey: CodexPersonalRouteKey;
  sourceUrl: string;
  sourceHeading: string | null;
  primaryWindow: CodexPersonalUsageWindow;
  windows: CodexPersonalUsageWindow[];
  balances: CodexPersonalUsageBalance[];
  note: string;
};

export type CodexPersonalParseResult =
  | {
      status: "ok";
      snapshot: CodexPersonalUsageSnapshot;
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
        routeKey: CodexPersonalRouteKey;
        status: CodexPersonalRouteCapture["status"];
        matchedUrl: string | null;
      }>;
    };

const STANDALONE_PERCENT_PATTERN = /^(\d{1,3})\s*[%％]$/;
const INLINE_PERCENT_PATTERN = /(\d{1,3})\s*[%％]/;
const WINDOW_LABEL_PATTERN =
  /(?:usage limit|usage window|weekly|week|5\s*hour|5小时|5 小时|每周|限额)/i;
const MODEL_PATTERN = /(gpt[-\w.]+)/i;
const STANDALONE_MODEL_LABEL_PATTERN = /^gpt-[a-z0-9][a-z0-9._-]*$/i;
const REMAINING_MARKER_PATTERN = /(?:remaining|left|available|剩余|可用)/i;
const RESET_LINE_PATTERN = /(?:重置时间|resets?(?: time)?|renews?)(?:[:：]\s*)?(.+)/i;
const BALANCE_LABEL_PATTERN =
  /(?:余额额度|credit balance|credits balance|remaining credits|usage credits|flex credits)/i;
const BALANCE_DETAIL_PATTERN =
  /(?:使用积分|超出套餐|continue using codex|beyond.*plan|over.*limit|credit|credits|积分|套餐|Codex)/i;
const USAGE_HISTORY_BOUNDARY_PATTERN =
  /(?:usage details|personal usage|credit usage history|usage history|使用详情|个人使用|额度使用记录)/i;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function parsePercentValue(rawValue: string | undefined): number | null {
  if (!rawValue) {
    return null;
  }

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100
    ? parsed
    : null;
}

function parsePercent(value: string): number | null {
  const normalizedValue = normalizeWhitespace(value);
  const standaloneMatch = normalizedValue.match(STANDALONE_PERCENT_PATTERN);

  if (standaloneMatch) {
    return parsePercentValue(standaloneMatch[1]);
  }

  if (!REMAINING_MARKER_PATTERN.test(normalizedValue)) {
    return null;
  }

  const inlineMatch = normalizedValue.match(INLINE_PERCENT_PATTERN);
  return parsePercentValue(inlineMatch?.[1]);
}

function parseInlineWindowPercent(value: string): number | null {
  const normalizedValue = normalizeWhitespace(value);
  const matched = normalizedValue.match(INLINE_PERCENT_PATTERN);

  return parsePercentValue(matched?.[1]);
}

function parseBalanceNumber(value: string): number | null {
  const normalizedValue = normalizeWhitespace(value);

  if (!normalizedValue || normalizedValue.includes("%")) {
    return null;
  }

  const labelValueMatch = normalizedValue.match(
    /(?:余额额度|credit balance|credits balance|remaining credits|usage credits|flex credits)[^\d]*(\d+(?:[.,]\d+)?)/i,
  );
  const exactValueMatch = normalizedValue.match(/^(\d+(?:[.,]\d+)?)$/);
  const matchedValue = labelValueMatch?.[1] ?? exactValueMatch?.[1] ?? null;

  if (!matchedValue) {
    return null;
  }

  const parsed = Number(matchedValue.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
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

function classifyWindowKind(label: string): CodexPersonalWindowKind {
  const lowerLabel = label.toLowerCase();

  if (MODEL_PATTERN.test(label)) {
    if (/5\s*hour|5小时|5 小时/i.test(label)) {
      return "model_rolling_5h";
    }

    if (/每周|weekly|week/i.test(lowerLabel)) {
      return "model_weekly";
    }

    return "unknown";
  }

  if (/每周|weekly|week/i.test(lowerLabel)) {
    return "weekly";
  }

  if (/5\s*hour|5小时|5 小时/i.test(lowerLabel)) {
    return "rolling_5h";
  }

  return "unknown";
}

function normalizeWindowLabel(
  label: string,
  kind: CodexPersonalWindowKind,
): string {
  if (kind === "rolling_5h") {
    return "5-hour usage window";
  }

  if (kind === "weekly") {
    return "Weekly usage window";
  }

  return normalizeWhitespace(label);
}

function stripInlineWindowRuntimeValues(label: string): string {
  const stripped = normalizeWhitespace(label)
    .replace(
      /\s*(?:重置时间|resets?(?: time)?|renews?)(?:[:：]\s*)?.*$/i,
      " ",
    )
    .replace(
      /\s*[\(（]?\d{1,3}\s*[%％]\s*(?:remaining|left|available|剩余|可用)?[\)）]?/gi,
      " ",
    )
    .replace(/\b(?:remaining|left|available)\b|(?:剩余|可用)/gi, " ")
    .replace(/\s*[·,，;；|/-]\s*$/g, " ");

  return normalizeWhitespace(stripped);
}

function extractModelLabel(label: string): string | null {
  const matched = label.match(MODEL_PATTERN);
  return matched ? matched[1] : null;
}

function isWindowLabel(value: string): boolean {
  return WINDOW_LABEL_PATTERN.test(value);
}

function isStandaloneModelLabel(value: string): boolean {
  return STANDALONE_MODEL_LABEL_PATTERN.test(normalizeWhitespace(value));
}

function isStandaloneModelWindowLabel(
  snippets: string[],
  index: number,
): boolean {
  if (!isStandaloneModelLabel(snippets[index] ?? "")) {
    return false;
  }

  return snippets
    .slice(index + 1, index + 3)
    .some((candidate) => parsePercent(candidate) !== null);
}

function isBalanceLabel(value: string): boolean {
  return BALANCE_LABEL_PATTERN.test(value);
}

function normalizeBalanceLabel(label: string): string {
  return BALANCE_LABEL_PATTERN.test(label)
    ? "Flex credit balance"
    : normalizeWhitespace(label);
}

function extractResetText(value: string): string | null {
  const matched = normalizeWhitespace(value).match(RESET_LINE_PATTERN);
  return matched?.[1] ? normalizeWhitespace(matched[1]) : null;
}

function finalizeWindow(
  currentWindow: CodexPersonalUsageWindow | null,
  windows: CodexPersonalUsageWindow[],
): CodexPersonalUsageWindow | null {
  if (!currentWindow) {
    return null;
  }

  windows.push(currentWindow);
  return null;
}

function buildWindows(summary: CodexPersonalPageSummary): CodexPersonalUsageWindow[] {
  const snippets = summary.textSnippets.map(normalizeWhitespace).filter(Boolean);
  const windows: CodexPersonalUsageWindow[] = [];
  let currentWindow: CodexPersonalUsageWindow | null = null;

  for (let index = 0; index < snippets.length; index += 1) {
    const snippet = snippets[index]!;

    if (USAGE_HISTORY_BOUNDARY_PATTERN.test(snippet)) {
      currentWindow = finalizeWindow(currentWindow, windows);
      break;
    }

    if (isWindowLabel(snippet) || isStandaloneModelWindowLabel(snippets, index)) {
      currentWindow = finalizeWindow(currentWindow, windows);
      const label = stripInlineWindowRuntimeValues(snippet) || snippet;
      const kind = classifyWindowKind(label);
      const remainingPercent = parseInlineWindowPercent(snippet);
      const resetText = extractResetText(snippet);

      currentWindow = {
        label,
        normalizedLabel: normalizeWindowLabel(label, kind),
        kind,
        modelLabel: extractModelLabel(label),
        remainingPercent,
        usedPercent:
          remainingPercent === null ? null : Math.max(0, 100 - remainingPercent),
        totalPercent: remainingPercent === null ? null : 100,
        resetAt: resetText ? normalizeResetAt(resetText) : null,
        resetText,
      };
      continue;
    }

    if (!currentWindow) {
      continue;
    }

    const percent = parsePercent(snippet);

    if (percent !== null && currentWindow.remainingPercent === null) {
      currentWindow.remainingPercent = percent;
      currentWindow.usedPercent = Math.max(0, 100 - percent);
      currentWindow.totalPercent = 100;
      continue;
    }

    if (REMAINING_MARKER_PATTERN.test(snippet)) {
      continue;
    }

    const resetText = extractResetText(snippet);

    if (resetText) {
      currentWindow.resetText = resetText;
      currentWindow.resetAt = normalizeResetAt(resetText);
    }
  }

  finalizeWindow(currentWindow, windows);
  return windows.filter((window) => window.remainingPercent !== null);
}

function buildBalances(
  summary: CodexPersonalPageSummary,
): CodexPersonalUsageBalance[] {
  const snippets = summary.textSnippets.map(normalizeWhitespace).filter(Boolean);
  const balances: CodexPersonalUsageBalance[] = [];

  for (let index = 0; index < snippets.length; index += 1) {
    const snippet = snippets[index]!;

    if (!isBalanceLabel(snippet)) {
      continue;
    }

    let remainingCredits = parseBalanceNumber(snippet);
    let valueIndex = index;

    if (remainingCredits === null) {
      for (
        let candidateIndex = index + 1;
        candidateIndex < Math.min(index + 5, snippets.length);
        candidateIndex += 1
      ) {
        const candidate = snippets[candidateIndex]!;

        if (isWindowLabel(candidate) || isBalanceLabel(candidate)) {
          break;
        }

        const parsedValue = parseBalanceNumber(candidate);

        if (parsedValue !== null) {
          remainingCredits = parsedValue;
          valueIndex = candidateIndex;
          break;
        }
      }
    }

    if (remainingCredits === null) {
      continue;
    }

    let detail: string | null = null;

    for (
      let candidateIndex = valueIndex + 1;
      candidateIndex < Math.min(valueIndex + 4, snippets.length);
      candidateIndex += 1
    ) {
      const candidate = snippets[candidateIndex]!;

      if (isWindowLabel(candidate) || isBalanceLabel(candidate)) {
        break;
      }

      if (parsePercent(candidate) !== null || parseBalanceNumber(candidate) !== null) {
        continue;
      }

      if (BALANCE_DETAIL_PATTERN.test(candidate)) {
        detail = candidate;
        break;
      }
    }

    const balance: CodexPersonalUsageBalance = {
      label: snippet,
      normalizedLabel: normalizeBalanceLabel(snippet),
      kind: BALANCE_LABEL_PATTERN.test(snippet)
        ? "flex_credit_balance"
        : "unknown",
      remainingCredits,
      totalCredits: null,
      detail,
    };
    const duplicateIndex = balances.findIndex(
      (candidate) =>
        candidate.kind === balance.kind &&
        candidate.normalizedLabel === balance.normalizedLabel &&
        candidate.remainingCredits === balance.remainingCredits &&
        candidate.totalCredits === balance.totalCredits,
    );

    if (duplicateIndex === -1) {
      balances.push(balance);
    } else if (!balances[duplicateIndex]!.detail && balance.detail) {
      balances[duplicateIndex] = balance;
    }
  }

  return balances;
}

function chooseMatchedRoute(
  fixture: CodexPersonalLiveFixture,
): CodexPersonalRouteCapture | null {
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

function choosePrimaryWindow(
  windows: CodexPersonalUsageWindow[],
): CodexPersonalUsageWindow | null {
  return (
    windows.find(
      (window) =>
        window.kind === "rolling_5h" &&
        window.modelLabel === null &&
        window.remainingPercent !== null,
    ) ??
    windows.find(
      (window) => window.kind === "weekly" && window.remainingPercent !== null,
    ) ??
    windows.find((window) => window.remainingPercent !== null) ??
    null
  );
}

function buildFailure(
  fixture: CodexPersonalLiveFixture,
  status:
    | "logged_out"
    | "open_page_required"
    | "capture_unavailable"
    | "route_drift",
  reason: string,
): CodexPersonalParseResult {
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

export function parseCodexPersonalLiveFixture(
  fixture: CodexPersonalLiveFixture,
): CodexPersonalParseResult {
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
        fixture,
        "logged_out",
        "The current ChatGPT tab matched a logged-out state instead of a usable Codex page. Log in again and reopen the Codex usage page.",
      );
    }

    if (hasCaptureUnavailableRoute) {
      return buildFailure(
        fixture,
        "capture_unavailable",
        "The open Codex usage page could not be read by the extension. Reload the page, confirm host access, then refresh again.",
      );
    }

    return buildFailure(
      fixture,
      "open_page_required",
      "Open the logged-in Codex usage page in ChatGPT before refreshing personal usage capture.",
    );
  }

  const windows = buildWindows(matchedRoute.summary);
  const balances = buildBalances(matchedRoute.summary);
  const primaryWindow = choosePrimaryWindow(windows);

  if (!primaryWindow) {
    return buildFailure(
      fixture,
      "route_drift",
      "The matched Codex usage page no longer exposed a parseable remaining-percentage window. Inspect the live route and update the parser.",
    );
  }

  return {
    status: "ok",
    snapshot: {
      providerId: "codex-personal-page",
      providerLabel: "Codex",
      measurementKind: "window_percent",
      routeKey: matchedRoute.routeKey,
      sourceUrl: matchedRoute.summary.url,
      sourceHeading: matchedRoute.summary.heading,
      primaryWindow,
      windows,
      balances,
      note:
        "Personal Codex session-page data currently exposes exact remaining percentages, reset timestamps, and optional flex credit balance cards for visible usage context, not one absolute workspace-wide remaining limit.",
    },
  };
}
