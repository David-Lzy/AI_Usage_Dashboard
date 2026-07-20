import personalUpgradeGateFixture from "../../../fixtures/claude/personal-upgrade-gate.fixture.json";
import {
  normalizePageBinding,
  reconcilePageBindingFromSessionResult,
} from "../../shared/page-bindings";
import type { ProviderPageBinding } from "../types";
import {
  createPageSessionClient,
  hasLivePageSessionApis,
  type PageSessionClient,
} from "../page-session";
import {
  captureClaudePersonalLiveFixture,
  type ClaudePersonalLiveFixture,
  type ClaudePersonalRouteCapture,
} from "./personal-page-capture";
import {
  parseClaudePersonalLiveFixture,
  type ClaudePersonalParseResult,
} from "./personal-page-parser";

export type ClaudePersonalPageClientOptions = {
  source?: "fixture" | "live";
  pageSessionClient?: PageSessionClient;
  openPageWhenMissing?: boolean;
  hydrationRetryAttempts?: number;
  hydrationRetryDelayMs?: number;
};

export type ClaudePersonalPageUsageResult = {
  result: ClaudePersonalParseResult;
  pageBinding: ProviderPageBinding;
};

export type ClaudePersonalPageClient = {
  getUsageSnapshot: (
    currentBinding?: ProviderPageBinding,
  ) => Promise<ClaudePersonalPageUsageResult>;
};

type ClaudeUpgradeGateFixture = {
  finalRoute: string;
};

// The network observer already waits through one bounded reload/recovery cycle.
// Avoid multiplying that work with page-level hydration polling by default.
const DEFAULT_HYDRATION_RETRY_ATTEMPTS = 0;
const DEFAULT_HYDRATION_RETRY_DELAY_MS = 500;

function delay(ms: number): Promise<void> {
  if (ms <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetryHydratingClaudeRoute(
  fixture: ClaudePersonalLiveFixture,
  result: ClaudePersonalParseResult,
  openedPageWhenMissing: boolean,
): boolean {
  // Route drift: the matched page exists but no parseable usage signal was found.
  if (result.status === "route_drift" && fixture.decision.chosenRoute !== null) {
    return true;
  }
  // P1b fix: When the extension just opened a new background tab, the tab may
  // still be loading during the first capture attempt, returning not_found /
  // open_page_required. Retrying gives the tab time to finish rendering before
  // surfacing a permanent error to the user.
  if (result.status === "open_page_required" && openedPageWhenMissing) {
    return true;
  }
  return false;
}

function buildBindingFromRouteCapture(
  route: ClaudePersonalRouteCapture,
  currentBinding: ProviderPageBinding,
  capturedAt: string,
): ProviderPageBinding {
  if (route.status === "matched") {
    const matchedAttempt =
      route.attempts.find((attempt) => attempt.status === "matched") ?? null;

    if (matchedAttempt) {
      return normalizePageBinding({
        mode: currentBinding.mode === "bound" ? "bound" : "auto",
        status: "bound",
        tabId: matchedAttempt.tabId,
        matchedUrl: route.matchedUrl,
        matchedTitle: route.matchedTitle,
        updatedAt: capturedAt,
      });
    }
  }

  return reconcilePageBindingFromSessionResult(
    currentBinding,
    {
      status:
        route.status === "logged_out"
          ? "logged_out"
          : route.status === "capture_unavailable"
            ? "capture_unavailable"
            : "not_found",
      attempts: route.attempts,
    },
    capturedAt,
  );
}

function chooseBindingRoute(
  fixture: ClaudePersonalLiveFixture,
): ClaudePersonalRouteCapture | null {
  return (
    fixture.routes.find((route) => route.status === "matched") ??
    fixture.routes.find((route) => route.status === "logged_out") ??
    fixture.routes.find((route) => route.attempts.length > 0) ??
    null
  );
}

function buildUpgradeGateFixtureResult(): ClaudePersonalParseResult {
  const fixture = personalUpgradeGateFixture as ClaudeUpgradeGateFixture;

  return {
    status: "logged_out",
    reason:
      "The stored Claude evidence fixture is an upgrade-only page, not a usable personal usage page. Use the live extension runtime with a logged-in Claude paid-plan session.",
    chosenRoute: fixture.finalRoute ?? "https://claude.ai/upgrade",
    routeStatuses: [
      {
        routeKey: "settings_usage",
        status: "logged_out",
        matchedUrl: fixture.finalRoute ?? "https://claude.ai/upgrade",
      },
    ],
  };
}

export function createClaudePersonalPageClient(
  options: ClaudePersonalPageClientOptions = {},
): ClaudePersonalPageClient {
  const source =
    options.source ?? (hasLivePageSessionApis() ? "live" : "fixture");

  return {
    async getUsageSnapshot(currentBinding?: ProviderPageBinding) {
      const normalizedBinding = normalizePageBinding(currentBinding);

      if (source === "fixture") {
        return {
          result: buildUpgradeGateFixtureResult(),
          pageBinding: normalizedBinding,
        };
      }

      const pageSessionClient =
        options.pageSessionClient ?? createPageSessionClient();
      const pageSessionBinding = {
        mode: normalizedBinding.mode,
        tabId: normalizedBinding.tabId,
        matchedUrl: normalizedBinding.matchedUrl,
        matchedTitle: normalizedBinding.matchedTitle,
      };
      const captureOptions = {
        openPageWhenMissing: options.openPageWhenMissing ?? false,
      };
      const retryAttempts = Math.max(
        0,
        options.hydrationRetryAttempts ?? DEFAULT_HYDRATION_RETRY_ATTEMPTS,
      );
      const retryDelayMs = Math.max(
        0,
        options.hydrationRetryDelayMs ?? DEFAULT_HYDRATION_RETRY_DELAY_MS,
      );
      let fixture = await captureClaudePersonalLiveFixture(
        pageSessionClient,
        pageSessionBinding,
        captureOptions,
      );
      let result = parseClaudePersonalLiveFixture(
        fixture as ClaudePersonalLiveFixture,
      );
      const openedPageWhenMissing = captureOptions.openPageWhenMissing ?? false;

      for (
        let attempt = 0;
        attempt < retryAttempts &&
        shouldRetryHydratingClaudeRoute(fixture, result, openedPageWhenMissing);
        attempt += 1
      ) {
        await delay(retryDelayMs);
        fixture = await captureClaudePersonalLiveFixture(
          pageSessionClient,
          pageSessionBinding,
          captureOptions,
        );
        result = parseClaudePersonalLiveFixture(
          fixture as ClaudePersonalLiveFixture,
        );
      }
      const routeForBinding = chooseBindingRoute(fixture);

      return {
        result,
        pageBinding: routeForBinding
          ? buildBindingFromRouteCapture(
              routeForBinding,
              normalizedBinding,
              fixture.capturedAt,
            )
          : normalizedBinding,
      };
    },
  };
}
