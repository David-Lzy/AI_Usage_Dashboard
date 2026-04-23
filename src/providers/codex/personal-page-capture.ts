import {
  createPageSessionClient,
  type PageSessionCapturedPage,
  type PageSessionBinding,
  type PageSessionClient,
  type PageSessionResult,
} from "../page-session";

export type CodexPersonalRouteKey =
  | "personal_usage"
  | "cloud_usage"
  | "cloud_analytics";

export type CodexRecommendedExtractionSurface =
  | "boot_data"
  | "dom"
  | "network_observer"
  | "blocked";

export type CodexPersonalPageSummary = {
  url: string;
  title: string;
  heading: string | null;
  recommendedSurface: CodexRecommendedExtractionSurface;
  textSnippets: string[];
  scriptMarkers: {
    hasNextDataScript: boolean;
    hasNextFlightStream: boolean;
    hasCloudflareChallenge: boolean;
  };
  keywordSignals: {
    hasUsageSignal: boolean;
    hasRemainingSignal: boolean;
    hasCreditSignal: boolean;
    hasResetSignal: boolean;
  };
};

export type CodexPersonalRouteCapture = {
  routeKey: CodexPersonalRouteKey;
  pageLabel: string;
  urlPatterns: string[];
  status: PageSessionResult["status"];
  attempts: PageSessionResult["attempts"];
  matchedUrl: string | null;
  matchedTitle: string | null;
  summary: CodexPersonalPageSummary | null;
};

export type CodexPersonalLiveFixture = {
  capturedAt: string;
  extractionMode: "dom";
  primaryCandidateRoute: string;
  routes: CodexPersonalRouteCapture[];
  decision: {
    chosenRoute: string | null;
    chosenSurface: CodexRecommendedExtractionSurface | null;
    rationale: string;
  };
};

type CodexRouteDefinition = {
  routeKey: CodexPersonalRouteKey;
  pageLabel: string;
  urlPatterns: string[];
};

const CODEX_PERSONAL_ROUTE_DEFINITIONS: CodexRouteDefinition[] = [
  {
    routeKey: "personal_usage",
    pageLabel: "Codex personal usage page",
    urlPatterns: ["https://chatgpt.com/codex/settings/usage*"],
  },
  {
    routeKey: "cloud_usage",
    pageLabel: "Codex cloud usage page",
    urlPatterns: ["https://chatgpt.com/codex/cloud/settings/usage*"],
  },
  {
    routeKey: "cloud_analytics",
    pageLabel: "Codex cloud analytics page",
    urlPatterns: ["https://chatgpt.com/codex/cloud/settings/analytics*"],
  },
];

const TEXT_SIGNAL_PATTERN =
  /usage|remaining|limit|quota|credit|credits|thread|threads|turn|turns|billing|reset|window|额度|剩余|限制|使用|信用|重置/i;
const REMAINING_SIGNAL_PATTERN = /remaining|left|available|剩余|可用/i;
const CREDIT_SIGNAL_PATTERN = /credit|credits|额度|信用/i;
const RESET_SIGNAL_PATTERN = /reset|window|renews|重置|刷新|窗口/i;

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
      TEXT_SIGNAL_PATTERN.test(line) || (/\d/.test(line) && line.length <= 120)
    );
  });

  return [...new Set(snippets)].slice(0, 12);
}

function isLoggedOutChatGptPage(page: PageSessionCapturedPage): boolean {
  const url = page.url.toLowerCase();
  const html = page.html.toLowerCase();
  const title = page.title.toLowerCase();

  return (
    url === "https://chatgpt.com/" ||
    url === "https://chatgpt.com" ||
    title === "chatgpt" ||
    html.includes("登录以获取基于已保存聊天的回答") ||
    html.includes("login to get answers based on saved chats") ||
    html.includes("免费注册")
  );
}

function matchesCodexRoute(
  route: CodexRouteDefinition,
  page: PageSessionCapturedPage,
): boolean {
  const expectedPath = route.urlPatterns[0]
    .replace("https://chatgpt.com", "")
    .replace("*", "");
  const url = page.url.toLowerCase();

  if (!url.includes(expectedPath.toLowerCase())) {
    return false;
  }

  return (
    page.title.toLowerCase().includes("codex") ||
    page.html.toLowerCase().includes("codex")
  );
}

function chooseRecommendedSurface(
  page: PageSessionCapturedPage,
  snippets: string[],
): CodexRecommendedExtractionSurface {
  if (page.html.includes("cf-turnstile") || page.title.includes("请稍候")) {
    return "blocked";
  }

  if (page.html.includes("__NEXT_DATA__") || page.html.includes("__next_f.push")) {
    return "boot_data";
  }

  if (snippets.length > 0) {
    return "dom";
  }

  return "network_observer";
}

export function summarizeCodexPersonalPage(
  page: PageSessionCapturedPage,
): CodexPersonalPageSummary {
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
        page.html.includes("cf-turnstile") || page.title.includes("请稍候"),
    },
    keywordSignals: {
      hasUsageSignal: TEXT_SIGNAL_PATTERN.test(joinedText),
      hasRemainingSignal: REMAINING_SIGNAL_PATTERN.test(joinedText),
      hasCreditSignal: CREDIT_SIGNAL_PATTERN.test(joinedText),
      hasResetSignal: RESET_SIGNAL_PATTERN.test(joinedText),
    },
  };
}

async function captureRoute(
  client: PageSessionClient,
  route: CodexRouteDefinition,
  binding?: PageSessionBinding,
): Promise<CodexPersonalRouteCapture> {
  const result = await client.capture({
    providerId: "codex",
    pageLabel: route.pageLabel,
    urlPatterns: route.urlPatterns,
    binding,
    extraction: {
      mode: "dom",
    },
    match(page) {
      if (isLoggedOutChatGptPage(page)) {
        return "logged_out";
      }

      return matchesCodexRoute(route, page) ? "matched" : "unmatched";
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
    summary: summarizeCodexPersonalPage(result.page),
  };
}

function buildDecision(
  routes: CodexPersonalRouteCapture[],
): CodexPersonalLiveFixture["decision"] {
  const preferredOrder: CodexPersonalRouteKey[] = [
    "personal_usage",
    "cloud_usage",
    "cloud_analytics",
  ];
  const chosen = preferredOrder
    .map((routeKey) => routes.find((route) => route.routeKey === routeKey))
    .find((route) => route?.summary);

  if (!chosen?.summary) {
    return {
      chosenRoute: null,
      chosenSurface: null,
      rationale:
        "No logged-in Codex page was matched from the current browser tabs.",
    };
  }

  return {
    chosenRoute: chosen.summary.url,
    chosenSurface: chosen.summary.recommendedSurface,
    rationale:
      chosen.routeKey === "personal_usage"
        ? "Selected the non-cloud Codex usage route first because it is the cleanest personal-user candidate. Its structural markers decide the next extraction surface."
        : "Selected the highest-priority matched Codex page from the current live ChatGPT tabs.",
  };
}

export async function captureCodexPersonalLiveFixture(
  client: PageSessionClient = createPageSessionClient(),
  binding?: PageSessionBinding,
): Promise<CodexPersonalLiveFixture> {
  const routes: CodexPersonalRouteCapture[] = [];

  for (const route of CODEX_PERSONAL_ROUTE_DEFINITIONS) {
    routes.push(await captureRoute(client, route, binding));
  }

  return {
    capturedAt: new Date().toISOString(),
    extractionMode: "dom",
    primaryCandidateRoute: "https://chatgpt.com/codex/settings/usage",
    routes,
    decision: buildDecision(routes),
  };
}
