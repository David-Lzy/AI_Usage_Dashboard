import {
  createPageSessionClient,
  type PageSessionCapturedPage,
  type PageSessionBinding,
  type PageSessionClient,
  type PageSessionObservedNetworkEntry,
  type PageSessionResult,
} from "../page-session";
import {
  CURSOR_FILTERED_USAGE_EVENTS_PATH,
  CURSOR_HARD_LIMIT_PATH,
  CURSOR_PLAN_INFO_PATH,
  CURSOR_USAGE_BILLING_PATHS,
  CURSOR_USAGE_SUMMARY_PATH,
  extractCursorObservedUsageBillingContract,
  mergeCursorObservedUsageBillingContracts,
  parseCursorFilteredUsageEventsBodyText,
  type CursorObservedUsageBillingContract,
} from "./usage-billing-contract";

export type CursorPersonalRouteKey =
  | "dashboard_usage"
  | "dashboard_spending";

export type CursorRecommendedExtractionSurface =
  | "boot_data"
  | "dom"
  | "network_observer"
  | "session_api"
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
  usageBillingContract: CursorObservedUsageBillingContract | null;
};

export type CursorPersonalLiveFixture = {
  capturedAt: string;
  extractionMode: "network_observer";
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
  {
    routeKey: "dashboard_spending",
    pageLabel: "Cursor personal dashboard spending page",
    urlPatterns: [
      "https://cursor.com/cn/dashboard/spending*",
      "https://cursor.com/dashboard/spending*",
      "https://cursor.com/*/dashboard/spending*",
    ],
  },
];

const CURSOR_USAGE_PAGE_URL = "https://cursor.com/cn/dashboard/usage";
const MAX_CURSOR_USAGE_EVENT_PAGES = 10;
const MAX_CURSOR_USAGE_RESPONSE_LENGTH = 240_000;
const CURSOR_DIRECT_SUMMARY_PATHS = [
  CURSOR_USAGE_SUMMARY_PATH,
  CURSOR_PLAN_INFO_PATH,
  CURSOR_HARD_LIMIT_PATH,
] as const;

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

function getCursorDashboardRouteKey(
  parsedUrl: URL | null,
): CursorPersonalRouteKey | null {
  if (!parsedUrl || parsedUrl.hostname !== "cursor.com") {
    return null;
  }

  const match = parsedUrl.pathname.match(
    /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?dashboard\/(usage|spending)\/?$/i,
  );

  return match?.[1]?.toLowerCase() === "usage"
    ? "dashboard_usage"
    : match?.[1]?.toLowerCase() === "spending"
      ? "dashboard_spending"
      : null;
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
    getCursorDashboardRouteKey(parsedUrl) !== null &&
    (hasCursorUsageDashboardShell(page) ||
      extractCursorObservedUsageBillingContract(
        page.observedNetwork?.entries,
      ) !== null)
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

  if (getCursorDashboardRouteKey(parsedUrl) !== route.routeKey) {
    return false;
  }

  return (
    page.title.toLowerCase().includes("cursor") ||
    page.html.toLowerCase().includes("cursor")
  );
}

function bindingMatchesRoute(
  binding: PageSessionBinding | undefined,
  route: CursorRouteDefinition,
): boolean {
  if (!binding?.matchedUrl) {
    return binding?.mode !== "bound";
  }

  return getCursorDashboardRouteKey(parseUrl(binding.matchedUrl)) === route.routeKey;
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

type CursorUsageEventsRequestBody = {
  startDate: string;
  endDate: string;
  page: number;
  pageSize: number;
  teamId: number;
};

function parseUsageEventsRequestBody(
  requestBodyText: string | null | undefined,
): CursorUsageEventsRequestBody | null {
  if (!requestBodyText) {
    return null;
  }

  try {
    const value = JSON.parse(requestBodyText) as Record<string, unknown>;
    const startDate = typeof value.startDate === "string" ? value.startDate : "";
    const endDate = typeof value.endDate === "string" ? value.endDate : "";
    const page = typeof value.page === "number" ? value.page : Number.NaN;
    const pageSize =
      typeof value.pageSize === "number" ? value.pageSize : Number.NaN;
    const teamId = typeof value.teamId === "number" ? value.teamId : Number.NaN;

    if (
      !startDate ||
      startDate.length > 64 ||
      !endDate ||
      endDate.length > 64 ||
      !Number.isInteger(page) ||
      page < 0 ||
      !Number.isInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > 100 ||
      !Number.isInteger(teamId) ||
      teamId < 0
    ) {
      return null;
    }

    return { startDate, endDate, page, pageSize, teamId };
  } catch {
    return null;
  }
}

async function captureDirectUsageSummary(
  client: PageSessionClient,
  tabId: number,
): Promise<CursorObservedUsageBillingContract | null> {
  if (!client.executeMainWorld) {
    return null;
  }

  const entries = await client
    .executeMainWorld<
      Array<{ url: string; ok: boolean; bodyText: string | null }>
    >(
      tabId,
      async (...rawArgs: unknown[]) => {
        const rawPaths = rawArgs[0];
        const rawMaxBodyLength = rawArgs[1];
        if (!Array.isArray(rawPaths)) {
          return [];
        }

        const origin = globalThis.location.origin;
        if (globalThis.location.hostname !== "cursor.com") {
          return [];
        }

        const maxBodyLength =
          typeof rawMaxBodyLength === "number" && rawMaxBodyLength > 0
            ? Math.min(250_000, rawMaxBodyLength)
            : 240_000;
        const paths = rawPaths
          .filter(
            (path): path is string =>
              typeof path === "string" &&
              path.startsWith("/") &&
              !path.startsWith("//"),
          )
          .slice(0, 3);

        return Promise.all(
          paths.map(async (path) => {
            const target = new URL(path, origin);
            if (target.origin !== origin) {
              return { url: target.href, ok: false, bodyText: null };
            }

            const controller = new AbortController();
            const timeoutId = globalThis.setTimeout(
              () => controller.abort(),
              8_000,
            );

            try {
              const response = await globalThis.fetch(target.href, {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                signal: controller.signal,
              });
              if (!response.ok) {
                return { url: target.href, ok: false, bodyText: null };
              }

              const bodyText = await response.text();
              return bodyText.length <= maxBodyLength
                ? { url: target.href, ok: true, bodyText }
                : { url: target.href, ok: false, bodyText: null };
            } catch {
              return { url: target.href, ok: false, bodyText: null };
            } finally {
              globalThis.clearTimeout(timeoutId);
            }
          }),
        );
      },
      [[...CURSOR_DIRECT_SUMMARY_PATHS], MAX_CURSOR_USAGE_RESPONSE_LENGTH],
    )
    .catch(() => []);

  return extractCursorObservedUsageBillingContract(entries);
}

async function captureAdditionalUsageEventPages(
  client: PageSessionClient,
  tabId: number,
  entries: readonly PageSessionObservedNetworkEntry[],
  contract: CursorObservedUsageBillingContract | null,
): Promise<CursorObservedUsageBillingContract | null> {
  const initialEvents = contract?.usageEvents;
  if (
    !initialEvents ||
    initialEvents.usageEventsDisplay.length >=
      initialEvents.totalUsageEventsCount ||
    !client.executeMainWorld
  ) {
    return contract;
  }

  const sourceEntry = entries.find(
    (entry) =>
      entry.ok === true &&
      entry.url.includes(CURSOR_FILTERED_USAGE_EVENTS_PATH) &&
      typeof entry.requestBodyText === "string",
  );
  const requestBody = parseUsageEventsRequestBody(sourceEntry?.requestBodyText);
  if (!sourceEntry || !requestBody) {
    return contract;
  }

  const firstPage = requestBody.page === 0 ? 0 : 1;
  const totalPages = Math.ceil(
    initialEvents.totalUsageEventsCount / requestBody.pageSize,
  );
  const pages = Array.from(
    { length: Math.min(totalPages, MAX_CURSOR_USAGE_EVENT_PAGES) },
    (_, index) => firstPage + index,
  ).filter((page) => page !== requestBody.page);

  if (pages.length === 0) {
    return contract;
  }

  const bodyTexts = await client
    .executeMainWorld<string[]>(
      tabId,
      async (...rawArgs: unknown[]) => {
        const rawUrl = rawArgs[0];
        const rawBody = rawArgs[1];
        const rawPages = rawArgs[2];
        const rawMaxBodyLength = rawArgs[3];
        if (
          typeof rawUrl !== "string" ||
          typeof rawBody !== "object" ||
          rawBody === null ||
          !Array.isArray(rawPages)
        ) {
          return [];
        }

        const target = new URL(rawUrl, globalThis.location.href);
        if (target.origin !== globalThis.location.origin) {
          return [];
        }

        const maxBodyLength =
          typeof rawMaxBodyLength === "number" && rawMaxBodyLength > 0
            ? Math.min(250_000, rawMaxBodyLength)
            : 240_000;
        const boundedPages = rawPages
          .filter(
            (page): page is number =>
              typeof page === "number" && Number.isInteger(page) && page >= 0,
          )
          .slice(0, 9);
        const responseBodies: string[] = [];

        for (const page of boundedPages) {
          const controller = new AbortController();
          const timeoutId = globalThis.setTimeout(
            () => controller.abort(),
            8_000,
          );

          try {
            const response = await globalThis.fetch(target.href, {
              method: "POST",
              credentials: "include",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                ...(rawBody as Record<string, unknown>),
                page,
              }),
              signal: controller.signal,
            });
            if (!response.ok) {
              break;
            }

            const bodyText = await response.text();
            if (bodyText.length > maxBodyLength) {
              break;
            }
            responseBodies.push(bodyText);
          } catch {
            break;
          } finally {
            globalThis.clearTimeout(timeoutId);
          }
        }

        return responseBodies;
      },
      [
        sourceEntry.url,
        requestBody,
        pages,
        MAX_CURSOR_USAGE_RESPONSE_LENGTH,
      ],
    )
    .catch(() => []);
  const additionalContracts = bodyTexts.flatMap((bodyText) => {
    const usageEvents = parseCursorFilteredUsageEventsBodyText(bodyText);
    return usageEvents
      ? [{ usageSummary: null, planInfo: null, hardLimit: null, usageEvents }]
      : [];
  });

  return mergeCursorObservedUsageBillingContracts([
    contract,
    ...additionalContracts,
  ]);
}

async function captureRoute(
  client: PageSessionClient,
  route: CursorRouteDefinition,
  binding?: PageSessionBinding,
  options: CursorPersonalLiveCaptureOptions = {},
): Promise<CursorPersonalRouteCapture> {
  const result = await client.capture({
    providerId: "cursor-personal-page",
    pageLabel: route.pageLabel,
    urlPatterns: route.urlPatterns,
    binding: bindingMatchesRoute(binding, route) ? binding : undefined,
    reloadBeforeCapture: {
      bypassCache: true,
      waitForLoadTimeoutMs: 12_000,
      loadPollIntervalMs: 250,
      postLoadDelayMs: 250,
    },
    ...(options.openPageWhenMissing && route.routeKey === "dashboard_usage"
      ? {
          openWhenMissing: {
            url: CURSOR_USAGE_PAGE_URL,
            active: false,
            closeOnUnmatched: true,
          },
        }
      : {}),
    extraction: {
      mode: "network_observer",
      matchUrlSubstrings: [...CURSOR_USAGE_BILLING_PATHS],
      requiredMatchUrlSubstrings:
        route.routeKey === "dashboard_usage"
          ? [CURSOR_USAGE_SUMMARY_PATH, CURSOR_FILTERED_USAGE_EVENTS_PATH]
          : [CURSOR_USAGE_SUMMARY_PATH],
      maxEntries: 10,
      maxBodyLength: MAX_CURSOR_USAGE_RESPONSE_LENGTH,
      captureRequestBody: route.routeKey === "dashboard_usage",
      maxRequestBodyLength: 4_000,
      observeReload: true,
      waitForRequiredEntriesTimeoutMs: 15_000,
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
      usageBillingContract: null,
    };
  }

  const observedEntries = result.page.observedNetwork?.entries ?? [];
  const observedContract = extractCursorObservedUsageBillingContract(
    observedEntries,
  );
  const directSummaryContract =
    route.routeKey === "dashboard_usage" && !observedContract?.usageSummary
      ? await captureDirectUsageSummary(client, result.target.tabId)
      : null;
  const recoveredContract = mergeCursorObservedUsageBillingContracts([
    observedContract,
    directSummaryContract,
  ]);
  const usageBillingContract =
    route.routeKey === "dashboard_usage"
      ? await captureAdditionalUsageEventPages(
          client,
          result.target.tabId,
          observedEntries,
          recoveredContract,
        )
      : recoveredContract;
  const summary = summarizeCursorPersonalPage(result.page);

  return {
    routeKey: route.routeKey,
    pageLabel: route.pageLabel,
    urlPatterns: route.urlPatterns,
    status: result.status,
    attempts: result.attempts,
    matchedUrl: result.page.url,
    matchedTitle: result.page.title,
    summary: usageBillingContract
      ? { ...summary, recommendedSurface: "network_observer" }
      : summary,
    usageBillingContract,
  };
}

export async function captureCursorPersonalLiveFixture(
  client: PageSessionClient = createPageSessionClient(),
  binding?: PageSessionBinding,
  options: CursorPersonalLiveCaptureOptions = {},
): Promise<CursorPersonalLiveFixture> {
  const routes: CursorPersonalRouteCapture[] = [];
  for (const route of CURSOR_PERSONAL_ROUTE_DEFINITIONS) {
    routes.push(await captureRoute(client, route, binding, options));
  }
  const matchedRoute =
    routes.find(
      (route) =>
        route.routeKey === "dashboard_usage" && route.status === "matched",
    ) ?? routes.find((route) => route.status === "matched");

  return {
    capturedAt: new Date().toISOString(),
    extractionMode: "network_observer",
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
