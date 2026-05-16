import usersAndLicensingFixtureHtml from "../../../fixtures/jetbrains/users-and-licensing.fixture.html?raw";
import { normalizePageBinding, reconcilePageBindingFromSessionResult } from "../../shared/page-bindings";
import type { ProviderPageBinding } from "../types";
import { createPageSessionClient } from "../page-session";

export type JetBrainsUsersAndLicensingPage = {
  html: string;
  url?: string;
  title?: string;
  heading?: string | null;
};

type JetBrainsTabQueryApi = {
  query: (queryInfo: { url?: string | string[] }) => Promise<JetBrainsTabQueryResult[]>;
  get?: (tabId: number) => Promise<JetBrainsTabQueryResult>;
};

type JetBrainsScriptingApi = {
  executeScript: (injection: {
    target: { tabId: number };
    world?: `${chrome.scripting.ExecutionWorld}`;
    func: (...args: unknown[]) => unknown;
    args?: unknown[];
  }) => Promise<Array<{ result?: unknown }>>;
};

type JetBrainsConsoleClientOptions = {
  source?: "fixture" | "live";
  tabsApi?: JetBrainsTabQueryApi;
  scriptingApi?: JetBrainsScriptingApi;
};

export type JetBrainsConsoleCaptureResult =
  | {
      status: "ok";
      page: JetBrainsUsersAndLicensingPage;
      pageBinding: ProviderPageBinding;
    }
  | {
      status: "logged_out" | "open_page_required" | "access_unavailable";
      reason: string;
      pageBinding: ProviderPageBinding;
    };

export type JetBrainsConsoleClient = {
  getUsersAndLicensingPage: (
    currentBinding?: ProviderPageBinding,
  ) => Promise<JetBrainsConsoleCaptureResult>;
};

type JetBrainsTabQueryResult = {
  id?: number;
  active?: boolean;
  lastAccessed?: number;
  url?: string;
  title?: string;
};

const JETBRAINS_TAB_URL_PATTERNS = [
  "https://account.jetbrains.com/*",
  "https://*.jetbrains.com/*",
];

const PAGE_MARKERS = [
  "Users and licensing",
  "Users licensed for AI",
  "Top-up AI Credits available",
];

function lower(value: string | null | undefined): string {
  return (value ?? "").toLowerCase();
}

function isUsersAndLicensingPage(page: JetBrainsUsersAndLicensingPage): boolean {
  const heading = lower(page.heading);
  const title = lower(page.title);
  const html = lower(page.html);

  return (
    (heading.includes("users and licensing") ||
      title.includes("users and licensing")) &&
    PAGE_MARKERS.every((marker) => html.includes(marker.toLowerCase()))
  );
}

function isLikelyLoggedOut(page: JetBrainsUsersAndLicensingPage): boolean {
  const title = lower(page.title);
  const html = lower(page.html);
  const url = lower(page.url);

  return (
    title.includes("sign in") ||
    title.includes("log in") ||
    html.includes("sign in to jetbrains") ||
    html.includes("log in to jetbrains") ||
    html.includes("name=\"password\"") ||
    url.includes("/login")
  );
}

function isLikelyAccessUnavailable(attempt: {
  url?: string;
  title?: string;
}): boolean {
  const title = lower(attempt.title);
  const url = lower(attempt.url);

  return (
    url.includes("account.jetbrains.com/organization/ai/users-and-licensing") &&
    (title.includes("error 400") ||
      title.includes("bad request") ||
      title.includes("access denied") ||
      title.includes("forbidden"))
  );
}

export function createJetBrainsConsoleClient(
  options: JetBrainsConsoleClientOptions = {},
): JetBrainsConsoleClient {
  const source = options.source ?? "fixture";

  return {
    async getUsersAndLicensingPage(currentBinding?: ProviderPageBinding) {
      const normalizedBinding = normalizePageBinding(currentBinding);

      if (source === "fixture") {
        return {
          status: "ok",
          page: {
            html: usersAndLicensingFixtureHtml,
          },
          pageBinding: normalizedBinding,
        };
      }

      const pageSessionClient = createPageSessionClient({
        tabsApi: options.tabsApi,
        scriptingApi: options.scriptingApi,
      });
      const capture = await pageSessionClient.capture({
        providerId: "jetbrains-org-page",
        pageLabel: "JetBrains Console Users and licensing page",
        urlPatterns: JETBRAINS_TAB_URL_PATTERNS,
        binding: {
          mode: normalizedBinding.mode,
          tabId: normalizedBinding.tabId,
          matchedUrl: normalizedBinding.matchedUrl,
          matchedTitle: normalizedBinding.matchedTitle,
        },
        extraction: {
          mode: "dom",
        },
        match(page) {
          if (isUsersAndLicensingPage(page)) {
            return "matched";
          }

          if (isLikelyLoggedOut(page)) {
            return "logged_out";
          }

          return "unmatched";
        },
      });
      const nextBinding = reconcilePageBindingFromSessionResult(
        normalizedBinding,
        capture,
        new Date().toISOString(),
      );

      if (capture.status !== "matched") {
        const unavailableAttempt = capture.attempts.find((attempt) =>
          isLikelyAccessUnavailable(attempt),
        );

        if (unavailableAttempt) {
          return {
            status: "access_unavailable",
            reason:
              "The current JetBrains account does not expose a usable organization Users and licensing page. Switch to an organization account with AI visibility, then refresh again.",
            pageBinding: nextBinding,
          };
        }

        return capture.status === "logged_out"
          ? {
              status: "logged_out",
              reason:
                "JetBrains Console session not detected. Log in and reopen Users and licensing before refreshing.",
              pageBinding: nextBinding,
            }
          : {
              status: "open_page_required",
              reason:
                "Open the JetBrains Console Users and licensing page in a browser tab, then refresh again.",
              pageBinding: nextBinding,
            };
      }

      return {
        status: "ok",
        page: {
          html: capture.page.html,
          url: capture.page.url,
          title: capture.page.title,
          heading: capture.page.heading,
        },
        pageBinding: nextBinding,
      };
    },
  };
}
