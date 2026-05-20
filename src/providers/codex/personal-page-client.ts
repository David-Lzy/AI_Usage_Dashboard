import personalPageLiveFixture from "../../../fixtures/codex/personal-page-live.fixture.json";
import type { ProviderPageBinding } from "../types";
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
import {
  parseCodexPersonalLiveFixture,
  type CodexPersonalParseResult,
} from "./personal-page-parser";

export type CodexPersonalPageClientOptions = {
  source?: "fixture" | "live";
  pageSessionClient?: PageSessionClient;
  openPageWhenMissing?: boolean;
  hydrationRetryAttempts?: number;
  hydrationRetryDelayMs?: number;
};

export type CodexPersonalPageUsageResult = {
  result: CodexPersonalParseResult;
  pageBinding: ProviderPageBinding;
};

export type CodexPersonalPageClient = {
  getUsageSnapshot: (
    currentBinding?: ProviderPageBinding,
  ) => Promise<CodexPersonalPageUsageResult>;
};

const DEFAULT_HYDRATION_RETRY_ATTEMPTS = 4;
const DEFAULT_HYDRATION_RETRY_DELAY_MS = 1_000;

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
  return result.status === "route_drift" && fixture.decision.chosenRoute !== null;
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
          result: parseCodexPersonalLiveFixture(
            personalPageLiveFixture as CodexPersonalLiveFixture,
          ),
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
        fixture = await captureCodexPersonalLiveFixture(
          pageSessionClient,
          pageSessionBinding,
          captureOptions,
        );
        result = parseCodexPersonalLiveFixture(fixture);
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
