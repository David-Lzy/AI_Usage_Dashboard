import {
  createPageSessionClient,
  type PageSessionCapturedPage,
  type PageSessionBinding,
  type PageSessionClient,
  type PageSessionResult,
} from "../page-session";

export type ClaudePersonalRouteKey = "settings_usage";

export type ClaudeRecommendedExtractionSurface =
  | "boot_data"
  | "dom"
  | "network_observer"
  | "blocked";

export type ClaudePersonalPageSummary = {
  url: string;
  title: string;
  heading: string | null;
  recommendedSurface: ClaudeRecommendedExtractionSurface;
  textSnippets: string[];
  scriptMarkers: {
    hasNextDataScript: boolean;
    hasNextFlightStream: boolean;
    hasCloudflareChallenge: boolean;
  };
  keywordSignals: {
    hasUsageSignal: boolean;
    hasRemainingSignal: boolean;
    hasResetSignal: boolean;
    hasPlanSignal: boolean;
    hasTeamSignal: boolean;
    hasUpgradeSignal: boolean;
  };
};

export type ClaudePersonalRouteCapture = {
  routeKey: ClaudePersonalRouteKey;
  pageLabel: string;
  urlPatterns: string[];
  status: PageSessionResult["status"];
  attempts: PageSessionResult["attempts"];
  matchedUrl: string | null;
  matchedTitle: string | null;
  summary: ClaudePersonalPageSummary | null;
};

export type ClaudePersonalLiveFixture = {
  capturedAt: string;
  extractionMode: "dom";
  routes: ClaudePersonalRouteCapture[];
  decision: {
    chosenRoute: string | null;
    chosenSurface: ClaudeRecommendedExtractionSurface | null;
    rationale: string;
  };
};

type ClaudeRouteDefinition = {
  routeKey: ClaudePersonalRouteKey;
  pageLabel: string;
  urlPatterns: string[];
};

type ClaudePersonalLiveCaptureOptions = {
  openPageWhenMissing?: boolean;
};

const CLAUDE_PERSONAL_ROUTE_DEFINITIONS: ClaudeRouteDefinition[] = [
  {
    routeKey: "settings_usage",
    pageLabel: "Claude Team usage settings page",
    urlPatterns: ["https://claude.ai/settings/usage*"],
  },
];

const TEXT_SIGNAL_PATTERN =
  /claude|usage|remaining|left|limit|quota|reset|renews|billing|plan|team|pro|max|message|messages|premium|standard|opus|sonnet|hours?|month|week|使用|剩余|额度|配额|限制|重置|账单|计划|团队|消息|小时|每周|每月/i;
const REMAINING_SIGNAL_PATTERN = /remaining|left|available|剩余|可用/i;
const RESET_SIGNAL_PATTERN = /reset|renews|renewal|cycle|period|重置|刷新|周期/i;
const PLAN_SIGNAL_PATTERN = /team|pro|max|free|plan|seat|member|billing|团队|计划|席位|成员|账单/i;
const TEAM_SIGNAL_PATTERN = /team|workspace|organization|seat|member|团队|组织|工作区|席位|成员/i;
const UPGRADE_SIGNAL_PATTERN =
  /upgrade|plans that grow with you|choose a plan|free|pro|max|升级|选择计划/i;
const CLAUDE_USAGE_UI_LABEL_PATTERN =
  /^(usage|your usage|messages|premium|standard|billing|plan|team|members|使用情况|用量|消息|账单|计划|团队)$/i;
const CLAUDE_USAGE_ROW_LABEL_PATTERN =
  /^(?:current session|all models|claude design|daily included routine runs|daily routine runs|当前会话|所有模型|每日例程运行)$/i;
const MAX_INTERESTING_TEXT_SNIPPETS = 72;

function decodeEntities(value: string): string {
  return value
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'");
}

function toTextLines(html: string): string[] {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "\n")
      .replace(/<style[\s\S]*?<\/style>/gi, "\n")
      .replace(/<[^>]+>/g, "\n"),
  )
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function pickInterestingTextSnippets(lines: string[]): string[] {
  return lines
    .filter((line) => {
      if (line.length < 2 || line.length > 180) {
        return false;
      }

      return (
        TEXT_SIGNAL_PATTERN.test(line) ||
        CLAUDE_USAGE_UI_LABEL_PATTERN.test(line) ||
        CLAUDE_USAGE_ROW_LABEL_PATTERN.test(line) ||
        (/\d/.test(line) && line.length <= 120)
      );
    })
    .slice(0, MAX_INTERESTING_TEXT_SNIPPETS);
}

function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function isClaudeSettingsUsagePath(parsedUrl: URL | null): boolean {
  return (
    parsedUrl?.hostname === "claude.ai" &&
    /^\/settings\/usage\/?$/i.test(parsedUrl.pathname)
  );
}

function hasClaudeUsageShell(page: PageSessionCapturedPage): boolean {
  const textLines = toTextLines(page.html).map((line) => line.toLowerCase());
  const hasUsageHeading = textLines.some(
    (line) =>
      line === "usage" ||
      line === "your usage" ||
      line.includes("settings") ||
      line.includes("使用"),
  );
  const hasQuotaText = textLines.some((line) =>
    /(remaining|usage|limit|quota|reset|messages?|premium|standard|剩余|额度|配额|消息)/i.test(
      line,
    ),
  );

  return hasUsageHeading && hasQuotaText;
}

function isLoggedOutOrUpgradeClaudePage(page: PageSessionCapturedPage): boolean {
  const parsedUrl = parseUrl(page.url);
  const url = page.url.toLowerCase();
  const title = page.title.toLowerCase();
  const visibleText = toTextLines(page.html).join("\n").toLowerCase();

  if (parsedUrl?.hostname !== "claude.ai") {
    return true;
  }

  if (isClaudeSettingsUsagePath(parsedUrl) && hasClaudeUsageShell(page)) {
    return false;
  }

  if (
    url.includes("/login") ||
    url.includes("/sign-in") ||
    url.includes("/signup") ||
    url.includes("/upgrade")
  ) {
    return true;
  }

  return (
    title.includes("login") ||
    title.includes("sign in") ||
    visibleText.includes("continue with google") ||
    visibleText.includes("sign in") ||
    visibleText.includes("log in") ||
    visibleText.includes("plans that grow with you") ||
    visibleText.includes("choose a plan") ||
    visibleText.includes("登录") ||
    visibleText.includes("升级")
  );
}

function matchesClaudeRoute(
  route: ClaudeRouteDefinition,
  page: PageSessionCapturedPage,
): boolean {
  const parsedUrl = parseUrl(page.url);

  if (!isClaudeSettingsUsagePath(parsedUrl)) {
    return false;
  }

  if (route.routeKey !== "settings_usage") {
    return false;
  }

  return (
    page.title.toLowerCase().includes("claude") ||
    page.html.toLowerCase().includes("claude") ||
    hasClaudeUsageShell(page)
  );
}

function chooseRecommendedSurface(
  page: PageSessionCapturedPage,
  snippets: string[],
): ClaudeRecommendedExtractionSurface {
  if (
    page.html.includes("cf-turnstile") ||
    page.html.toLowerCase().includes("attention required")
  ) {
    return "blocked";
  }

  if (
    page.html.includes("__NEXT_DATA__") ||
    page.html.includes("__next_f.push") ||
    page.html.includes("_buildManifest")
  ) {
    return "boot_data";
  }

  if (snippets.length > 0) {
    return "dom";
  }

  return "network_observer";
}

export function summarizeClaudePersonalPage(
  page: PageSessionCapturedPage,
): ClaudePersonalPageSummary {
  const textLines = toTextLines(page.html);
  const textSnippets = pickInterestingTextSnippets(textLines);
  const joinedText = textLines.join("\n");

  return {
    url: page.url,
    title: page.title,
    heading: page.heading,
    recommendedSurface: chooseRecommendedSurface(page, textSnippets),
    textSnippets,
    scriptMarkers: {
      hasNextDataScript: page.html.includes("__NEXT_DATA__"),
      hasNextFlightStream: page.html.includes("__next_f.push"),
      hasCloudflareChallenge:
        page.html.includes("cf-turnstile") ||
        page.html.toLowerCase().includes("attention required"),
    },
    keywordSignals: {
      hasUsageSignal: TEXT_SIGNAL_PATTERN.test(joinedText),
      hasRemainingSignal: REMAINING_SIGNAL_PATTERN.test(joinedText),
      hasResetSignal: RESET_SIGNAL_PATTERN.test(joinedText),
      hasPlanSignal: PLAN_SIGNAL_PATTERN.test(joinedText),
      hasTeamSignal: TEAM_SIGNAL_PATTERN.test(joinedText),
      hasUpgradeSignal: UPGRADE_SIGNAL_PATTERN.test(joinedText),
    },
  };
}

async function captureRoute(
  client: PageSessionClient,
  route: ClaudeRouteDefinition,
  binding?: PageSessionBinding,
  options: ClaudePersonalLiveCaptureOptions = {},
): Promise<ClaudePersonalRouteCapture> {
  const result = await client.capture({
    providerId: "claude-code-team-page",
    pageLabel: route.pageLabel,
    urlPatterns: route.urlPatterns,
    binding,
    reloadBeforeCapture: {
      bypassCache: true,
      waitForLoadTimeoutMs: 10_000,
      loadPollIntervalMs: 250,
      postLoadDelayMs: 2_000,
    },
    reloadOnCaptureFailure: {
      bypassCache: true,
      waitForLoadTimeoutMs: 10_000,
      loadPollIntervalMs: 250,
      postLoadDelayMs: 2_000,
    },
    ...(options.openPageWhenMissing
      ? {
          openWhenMissing: {
            url: "https://claude.ai/settings/usage",
            active: false,
            closeOnUnmatched: true,
          },
        }
      : {}),
    extraction: {
      mode: "dom",
    },
    match(page) {
      if (isLoggedOutOrUpgradeClaudePage(page)) {
        return "logged_out";
      }

      return matchesClaudeRoute(route, page) ? "matched" : "unmatched";
    },
  });

  if (result.status !== "matched") {
    return {
      routeKey: route.routeKey,
      pageLabel: route.pageLabel,
      urlPatterns: route.urlPatterns,
      status: result.status,
      attempts: result.attempts,
      matchedUrl: null,
      matchedTitle: null,
      summary: null,
    };
  }

  return {
    routeKey: route.routeKey,
    pageLabel: route.pageLabel,
    urlPatterns: route.urlPatterns,
    status: result.status,
    attempts: result.attempts,
    matchedUrl: result.page.url,
    matchedTitle: result.page.title,
    summary: summarizeClaudePersonalPage(result.page),
  };
}

export async function captureClaudePersonalLiveFixture(
  client: PageSessionClient = createPageSessionClient(),
  binding?: PageSessionBinding,
  options: ClaudePersonalLiveCaptureOptions = {},
): Promise<ClaudePersonalLiveFixture> {
  const routes = await Promise.all(
    CLAUDE_PERSONAL_ROUTE_DEFINITIONS.map((route) =>
      captureRoute(client, route, binding, options),
    ),
  );
  const matchedRoute = routes.find((route) => route.status === "matched");

  return {
    capturedAt: new Date().toISOString(),
    extractionMode: "dom",
    routes,
    decision: matchedRoute?.summary
      ? {
          chosenRoute: matchedRoute.matchedUrl,
          chosenSurface: matchedRoute.summary.recommendedSurface,
          rationale:
            "Selected the matched Claude settings usage page from the current live Claude tabs.",
        }
      : {
          chosenRoute: null,
          chosenSurface: null,
          rationale:
            "No matching logged-in Claude settings usage tab was available in the current browser session.",
        },
  };
}
