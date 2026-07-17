import personalPageLiveFixture from "../../../fixtures/codex/personal-page-live.fixture.json";
import type { ProviderPageBinding, SyncTrigger } from "../types";
import {
  createPageSessionClient,
  hasLivePageSessionApis,
  type PageSessionClient,
} from "../page-session";
import {
  normalizePageBinding,
  reconcilePageBindingFromSessionResult,
} from "../../shared/page-bindings";
import {
  captureCodexPersonalLiveFixture,
  type CodexPersonalLiveFixture,
  type CodexPersonalRouteCapture,
} from "./personal-page-capture";
import type { CodexObservedUsageHistoryContract } from "./usage-history-contract";
import {
  parseCodexPersonalLiveFixture,
  type CodexPersonalParseResult,
} from "./personal-page-parser";
import {
  codexSessionApiClient,
  type CodexSessionApiClient,
  type CodexSessionApiFailureCode,
} from "./session-api-client";

export type CodexPersonalPageClientOptions = {
  source?: "fixture" | "live";
  pageSessionClient?: PageSessionClient;
  openPageWhenMissing?: boolean;
  hydrationRetryAttempts?: number;
  hydrationRetryDelayMs?: number;
  sessionApiClient?: CodexSessionApiClient;
  trigger?: SyncTrigger;
};

export type CodexPersonalPageUsageResult = {
  captureSource: "fixture" | "page_parse" | "session_api";
  directApiFailure?: {
    code: CodexSessionApiFailureCode;
    reason: string;
    retryAt: number | null;
  };
  replacePreviousSnapshot?: boolean;
  result: CodexPersonalParseResult;
  pageBinding: ProviderPageBinding;
};

export type CodexPersonalPageClient = {
  getUsageSnapshot: (
    currentBinding?: ProviderPageBinding,
  ) => Promise<CodexPersonalPageUsageResult>;
};

const DEFAULT_HYDRATION_RETRY_ATTEMPTS = 2;
const DEFAULT_HYDRATION_RETRY_DELAY_MS = 750;

function delay(ms: number): Promise<void> {
  if (ms <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetryHydratingCodexRoute(
  fixture: CodexPersonalLiveFixture,
  result: CodexPersonalParseResult,
): boolean {
  if (result.status === "route_drift") {
    return fixture.decision.chosenRoute !== null;
  }

  return (
    result.status === "capture_unavailable" &&
    fixture.routes.some(
      (route) =>
        route.status === "capture_unavailable" && route.attempts.length > 0,
    )
  );
}

function mergeUsageHistoryContract(
  current: CodexObservedUsageHistoryContract | null | undefined,
  previous: CodexObservedUsageHistoryContract | null | undefined,
): CodexObservedUsageHistoryContract | null {
  if (!current && !previous) {
    return null;
  }

  return {
    dailyTokenUsageBreakdown:
      current?.dailyTokenUsageBreakdown ??
      previous?.dailyTokenUsageBreakdown ??
      null,
    dailyWorkspaceUsageCounts:
      current?.dailyWorkspaceUsageCounts ??
      previous?.dailyWorkspaceUsageCounts ??
      null,
  };
}

function retainObservedUsageHistory(
  current: CodexPersonalLiveFixture,
  previous: CodexPersonalLiveFixture,
): CodexPersonalLiveFixture {
  const previousRoutes = new Map(
    previous.routes.map((route) => [route.routeKey, route] as const),
  );

  return {
    ...current,
    routes: current.routes.map((route) => ({
      ...route,
      usageHistoryContract: mergeUsageHistoryContract(
        route.usageHistoryContract,
        previousRoutes.get(route.routeKey)?.usageHistoryContract,
      ),
    })),
  };
}

function buildBindingFromRouteCapture(
  route: CodexPersonalRouteCapture,
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
  fixture: CodexPersonalLiveFixture,
): CodexPersonalRouteCapture | null {
  if (fixture.decision.chosenRoute) {
    const chosenRoute =
      fixture.routes.find(
        (route) => route.matchedUrl === fixture.decision.chosenRoute,
      ) ?? null;

    if (chosenRoute) {
      return chosenRoute;
    }
  }

  return (
    fixture.routes.find((route) => route.status === "matched") ??
    fixture.routes.find((route) => route.status === "logged_out") ??
    fixture.routes.find((route) => route.attempts.length > 0) ??
    null
  );
}

export function createCodexPersonalPageClient(
  options: CodexPersonalPageClientOptions = {},
): CodexPersonalPageClient {
  const source =
    options.source ?? (hasLivePageSessionApis() ? "live" : "fixture");

  return {
    async getUsageSnapshot(currentBinding?: ProviderPageBinding) {
      const normalizedBinding = normalizePageBinding(currentBinding);

      if (source === "fixture") {
        return {
          captureSource: "fixture",
          result: parseCodexPersonalLiveFixture(
            personalPageLiveFixture as CodexPersonalLiveFixture,
          ),
          pageBinding: normalizedBinding,
        };
      }

      const trigger = options.trigger ?? "manual";
      const directResult = await (
        options.sessionApiClient ?? codexSessionApiClient
      ).getUsageSnapshot(trigger);

      if (directResult.ok) {
        return {
          captureSource: "session_api",
          replacePreviousSnapshot: directResult.replacePreviousSnapshot,
          result: directResult.result,
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
        openPageWhenMissing:
          trigger === "manual" && (options.openPageWhenMissing ?? false),
        reloadPageBeforeCapture: trigger === "manual",
      };
      const hydrationCaptureOptions = {
        openPageWhenMissing: false,
        reloadPageBeforeCapture: false,
      };
      const retryAttempts = Math.max(
        0,
        options.hydrationRetryAttempts ?? DEFAULT_HYDRATION_RETRY_ATTEMPTS,
      );
      const retryDelayMs = Math.max(
        0,
        options.hydrationRetryDelayMs ?? DEFAULT_HYDRATION_RETRY_DELAY_MS,
      );
      let fixture = await captureCodexPersonalLiveFixture(
        pageSessionClient,
        pageSessionBinding,
        captureOptions,
      );
      let result = parseCodexPersonalLiveFixture(fixture);

      for (
        let attempt = 0;
        attempt < retryAttempts &&
        shouldRetryHydratingCodexRoute(fixture, result);
        attempt += 1
      ) {
        await delay(retryDelayMs);
        const hydratedFixture = await captureCodexPersonalLiveFixture(
          pageSessionClient,
          pageSessionBinding,
          hydrationCaptureOptions,
        );
        fixture = retainObservedUsageHistory(hydratedFixture, fixture);
        result = parseCodexPersonalLiveFixture(fixture);
      }

      const routeForBinding = chooseBindingRoute(fixture);

      return {
        captureSource: "page_parse",
        directApiFailure: directResult,
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
