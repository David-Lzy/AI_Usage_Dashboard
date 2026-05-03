import {
  createPageSessionClient,
  type PageSessionCapturedPage,
  type PageSessionBinding,
  type PageSessionClient,
  type PageSessionResult,
} from "../page-session";

export type CursorPersonalRouteKey = "dashboard_usage";

export type CursorRecommendedExtractionSurface =
  | "boot_data"
  | "dom"
  | "network_observer"
  | "blocked";

export type CursorPersonalPageSummary = {
  url: string;
  title: string;
  heading: string | null;
  localePrefix: string | null;
  recommendedSurface: CursorRecommendedExtractionSurface;
  textSnippets: string[];
  scriptMarkers: {
    hasNextDataScript: boolean;
    hasNextFlightStream: boolean;
    hasBuildManifest: boolean;
    hasCloudflareChallenge: boolean;
  };
  keywordSignals: {
    hasUsageSignal: boolean;
    hasRemainingSignal: boolean;
    hasRequestSignal: boolean;
    hasResetSignal: boolean;
    hasPlanSignal: boolean;
  };
};

export type CursorPersonalRouteCapture = {
  routeKey: CursorPersonalRouteKey;
  pageLabel: string;
  urlPatterns: string[];
  status: PageSessionResult["status"];
  attempts: PageSessionResult["attempts"];
  matchedUrl: string | null;
  matchedTitle: string | null;
  summary: CursorPersonalPageSummary | null;
};

export type CursorPersonalLiveFixture = {
  capturedAt: string;
  extractionMode: "dom";
  routes: CursorPersonalRouteCapture[];
  decision: {
    chosenRoute: string | null;
    chosenSurface: CursorRecommendedExtractionSurface | null;
    rationale: string;
  };
};

type CursorRouteDefinition = {
  routeKey: CursorPersonalRouteKey;
  pageLabel: string;
  urlPatterns: string[];
};

type CursorPersonalLiveCaptureOptions = {
  openPageWhenMissing?: boolean;
};

const CURSOR_PERSONAL_ROUTE_DEFINITIONS: CursorRouteDefinition[] = [
  {
    routeKey: "dashboard_usage",
    pageLabel: "Cursor personal dashboard usage page",
    urlPatterns: [
      "https://cursor.com/cn/dashboard/usage*",
      "https://cursor.com/dashboard/usage*",
      "https://cursor.com/*/dashboard/usage*",
    ],
  },
];

const TEXT_SIGNAL_PATTERN =
  /usage|remaining|request|requests|billing|reset|limit|quota|plan|included|spend|on-demand|overage|usage-based|premium|fast|period|cycle|requests used|requests left|使用|剩余|请求|额度|配额|计划|周期|重置|刷新/i;
const REMAINING_SIGNAL_PATTERN = /remaining|left|available|剩余|可用/i;
const REQUEST_SIGNAL_PATTERN = /request|requests|premium|fast|included|请求|次数/i;
const RESET_SIGNAL_PATTERN = /reset|renews|period|cycle|刷新|重置|周期/i;
const PLAN_SIGNAL_PATTERN = /pro|ultra|hobby|business|team|plan|计划/i;
const CURSOR_USAGE_UI_LABEL_PATTERN =
  /^(hobby|pro|pro\+|ultra|business|team|usage|your usage|by model|spend|total spend|included|on-demand|export csv)$/i;
const LOCALE_PREFIX_PATTERN = /^[a-z]{2}(?:-[a-z]{2})?$/i;
const MONEY_SNIPPET_PATTERN = /^\$[0-9][0-9,]*(?:\.\d{1,2})?$/;

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
  const snippets = lines.filter((line) => {
    if (line.length < 2 || line.length > 180) {
      return false;
    }

    return (
      TEXT_SIGNAL_PATTERN.test(line) ||
      CURSOR_USAGE_UI_LABEL_PATTERN.test(line) ||
      (/\d/.test(line) && line.length <= 120)
    );
  });

  const seenNonMoneySnippets = new Set<string>();

  return snippets
    .filter((snippet) => {
      if (MONEY_SNIPPET_PATTERN.test(snippet)) {
        return true;
      }

      if (seenNonMoneySnippets.has(snippet)) {
        return false;
      }

      seenNonMoneySnippets.add(snippet);
      return true;
    })
    .slice(0, 28);
}

function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function detectLocalePrefix(url: string): string | null {
  const parsedUrl = parseUrl(url);

  if (!parsedUrl) {
    return null;
  }

  const segments = parsedUrl.pathname.split("/").filter(Boolean);

  if (segments.length >= 3 && LOCALE_PREFIX_PATTERN.test(segments[0] ?? "")) {
    return segments[0] ?? null;
  }

  return null;
}

function isCursorUsageDashboardPath(parsedUrl: URL | null): boolean {
  if (!parsedUrl || parsedUrl.hostname !== "cursor.com") {
    return false;
  }

  return (
    /^\/dashboard\/usage\/?$/i.test(parsedUrl.pathname) ||
    /^\/[a-z]{2}(?:-[a-z]{2})?\/dashboard\/usage\/?$/i.test(
      parsedUrl.pathname,
    )
  );
}

function hasCursorUsageDashboardShell(page: PageSessionCapturedPage): boolean {
  const textLines = toTextLines(page.html).map((line) => line.toLowerCase());
  const hasUsageHeading = textLines.some(
    (line) =>
      line === "usage" ||
      line === "your usage" ||
      line.includes("your usage per day across this billing period") ||
      line.includes("使用情况"),
  );
  const hasSpendCards = textLines.some(
    (line) =>
      line === "total spend" ||
      line === "included" ||
      line === "on-demand" ||
      line.includes("cumulative spend"),
  );
  const hasOnDemandState = textLines.some((line) =>
    /on-demand usage is (on|off)/i.test(line),
  );
  const hasPlanCard = textLines.some((line) =>
    /^(hobby|pro|pro\+|ultra|business|team)(\s|$)/i.test(line),
  );

  return (
    (hasUsageHeading && (hasSpendCards || hasOnDemandState || hasPlanCard)) ||
    hasOnDemandState
  );
}

function isLoggedOutCursorPage(page: PageSessionCapturedPage): boolean {
  const parsedUrl = parseUrl(page.url);
  const url = page.url.toLowerCase();
  const title = page.title.toLowerCase();
  const visibleText = toTextLines(page.html).join("\n").toLowerCase();

  if (parsedUrl?.hostname !== "cursor.com") {
    return true;
  }

  if (url.includes("/sign-in") || url.includes("/login")) {
    return true;
  }

  if (
    isCursorUsageDashboardPath(parsedUrl) &&
    hasCursorUsageDashboardShell(page)
  ) {
    return false;
  }

  return (
    title.includes("sign in") ||
    visibleText.includes("sign in to cursor") ||
    visibleText.includes("continue with google") ||
    visibleText.includes("continue with github") ||
    visibleText.includes("登录") ||
    visibleText.includes("继续使用 google")
  );
}

function matchesCursorRoute(
  route: CursorRouteDefinition,
  page: PageSessionCapturedPage,
): boolean {
  const parsedUrl = parseUrl(page.url);

  if (!parsedUrl || parsedUrl.hostname !== "cursor.com") {
    return false;
  }

  if (!isCursorUsageDashboardPath(parsedUrl)) {
    return false;
  }

  if (route.routeKey !== "dashboard_usage") {
    return false;
  }

  return (
    page.title.toLowerCase().includes("cursor") ||
    page.html.toLowerCase().includes("cursor")
  );
}

function chooseRecommendedSurface(
  page: PageSessionCapturedPage,
  snippets: string[],
): CursorRecommendedExtractionSurface {
  if (
    page.html.includes("cf-turnstile") ||
    page.html.toLowerCase().includes("attention required")
  ) {
    return "blocked";
  }

  if (
    page.html.includes("__NEXT_DATA__") ||
    page.html.includes("__next_f.push") ||
    page.html.includes("_buildManifest") ||
    page.html.includes("__NUXT__") ||
    page.html.includes("__APOLLO_STATE__")
  ) {
    return "boot_data";
  }

  if (snippets.length > 0) {
    return "dom";
  }

  return "network_observer";
}

export function summarizeCursorPersonalPage(
  page: PageSessionCapturedPage,
): CursorPersonalPageSummary {
  const textLines = toTextLines(page.html);
  const textSnippets = pickInterestingTextSnippets(textLines);
  const joinedText = textLines.join("\n");

  return {
    url: page.url,
    title: page.title,
    heading: page.heading,
    localePrefix: detectLocalePrefix(page.url),
    recommendedSurface: chooseRecommendedSurface(page, textSnippets),
    textSnippets,
    scriptMarkers: {
      hasNextDataScript: page.html.includes("__NEXT_DATA__"),
      hasNextFlightStream: page.html.includes("__next_f.push"),
      hasBuildManifest:
        page.html.includes("_buildManifest") ||
        page.html.includes("__NUXT__") ||
        page.html.includes("__APOLLO_STATE__"),
      hasCloudflareChallenge:
        page.html.includes("cf-turnstile") ||
        page.html.toLowerCase().includes("attention required"),
    },
    keywordSignals: {
      hasUsageSignal: TEXT_SIGNAL_PATTERN.test(joinedText),
      hasRemainingSignal: REMAINING_SIGNAL_PATTERN.test(joinedText),
      hasRequestSignal: REQUEST_SIGNAL_PATTERN.test(joinedText),
      hasResetSignal: RESET_SIGNAL_PATTERN.test(joinedText),
      hasPlanSignal: PLAN_SIGNAL_PATTERN.test(joinedText),
    },
  };
}

async function captureRoute(
  client: PageSessionClient,
  route: CursorRouteDefinition,
  binding?: PageSessionBinding,
  options: CursorPersonalLiveCaptureOptions = {},
): Promise<CursorPersonalRouteCapture> {
  const result = await client.capture({
    providerId: "cursor",
    pageLabel: route.pageLabel,
    urlPatterns: route.urlPatterns,
    binding,
    reloadOnCaptureFailure: {
      bypassCache: true,
      waitForLoadTimeoutMs: 10_000,
      loadPollIntervalMs: 250,
    },
    ...(options.openPageWhenMissing
      ? {
          openWhenMissing: {
            url: "https://cursor.com/cn/dashboard/usage",
            active: false,
            closeOnUnmatched: true,
          },
        }
      : {}),
    extraction: {
      mode: "dom",
    },
    match(page) {
      if (isLoggedOutCursorPage(page)) {
        return "logged_out";
      }

      return matchesCursorRoute(route, page) ? "matched" : "unmatched";
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
    summary: summarizeCursorPersonalPage(result.page),
  };
}

export async function captureCursorPersonalLiveFixture(
  client: PageSessionClient = createPageSessionClient(),
  binding?: PageSessionBinding,
  options: CursorPersonalLiveCaptureOptions = {},
): Promise<CursorPersonalLiveFixture> {
  const routes = await Promise.all(
    CURSOR_PERSONAL_ROUTE_DEFINITIONS.map((route) =>
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
            "Selected the matched Cursor dashboard usage page from the current live Cursor tabs.",
        }
      : {
          chosenRoute: null,
          chosenSurface: null,
          rationale:
            "No matching logged-in Cursor dashboard usage tab was available in the current browser session.",
        },
  };
}
