import personalPageLiveEvidenceFixture from "../../../fixtures/cursor/personal-page-live-evidence.fixture.json";
import { normalizePageBinding, reconcilePageBindingFromSessionResult } from "../../shared/page-bindings";
import type { ProviderPageBinding } from "../types";
import {
  createPageSessionClient,
  hasLivePageSessionApis,
  type PageSessionClient,
} from "../page-session";
import {
  captureCursorPersonalLiveFixture,
  type CursorPersonalLiveFixture,
  type CursorPersonalRouteCapture,
} from "./personal-page-capture";
import {
  parseCursorPersonalEvidenceFixture,
  parseCursorPersonalLiveFixture,
  type CursorPersonalEvidenceFixture,
  type CursorPersonalParseResult,
} from "./personal-page-parser";
import { mergeCursorObservedUsageBillingContracts } from "./usage-billing-contract";

export type CursorPersonalPageClientOptions = {
  source?: "fixture" | "live";
  pageSessionClient?: PageSessionClient;
  openPageWhenMissing?: boolean;
  hydrationRetryAttempts?: number;
  hydrationRetryDelayMs?: number;
};

export type CursorPersonalPageUsageResult = {
  result: CursorPersonalParseResult;
  pageBinding: ProviderPageBinding;
};

export type CursorPersonalPageClient = {
  getUsageSnapshot: (
    currentBinding?: ProviderPageBinding,
  ) => Promise<CursorPersonalPageUsageResult>;
};

const DEFAULT_HYDRATION_RETRY_ATTEMPTS = 2;
const DEFAULT_HYDRATION_RETRY_DELAY_MS = 1_000;

function delay(ms: number): Promise<void> {
  if (ms <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetryHydratingCursorRoute(
  fixture: CursorPersonalLiveFixture,
  result: CursorPersonalParseResult,
): boolean {
  if (fixture.decision.chosenRoute === null) {
    return false;
  }

  if (result.status === "route_drift") {
    return true;
  }

  const contract = result.status === "ok"
    ? result.snapshot.usageBillingContract
    : null;
  return (
    result.status === "ok" &&
    (!contract?.usageSummary || !contract.usageEvents)
  );
}

function mergeCursorCaptureFixtures(
  current: CursorPersonalLiveFixture,
  previous: CursorPersonalLiveFixture,
): CursorPersonalLiveFixture {
  const decision = current.decision.chosenRoute
    ? current.decision
    : previous.decision;

  return {
    ...current,
    decision,
    routes: current.routes.map((route) => {
      const previousRoute = previous.routes.find(
        (candidate) => candidate.routeKey === route.routeKey,
      );
      const routeBase =
        route.status === "matched" || previousRoute?.status !== "matched"
          ? route
          : previousRoute;
      return {
        ...routeBase,
        summary: route.summary ?? previousRoute?.summary ?? null,
        usageBillingContract: mergeCursorObservedUsageBillingContracts([
          route.usageBillingContract,
          previousRoute?.usageBillingContract,
        ]),
      };
    }),
  };
}

function buildBindingFromRouteCapture(
  route: CursorPersonalRouteCapture,
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
  fixture: CursorPersonalLiveFixture,
): CursorPersonalRouteCapture | null {
  return (
    fixture.routes.find((route) => route.status === "matched") ??
    fixture.routes.find((route) => route.status === "logged_out") ??
    fixture.routes.find((route) => route.attempts.length > 0) ??
    null
  );
}

export function createCursorPersonalPageClient(
  options: CursorPersonalPageClientOptions = {},
): CursorPersonalPageClient {
  const source =
    options.source ?? (hasLivePageSessionApis() ? "live" : "fixture");

  return {
    async getUsageSnapshot(currentBinding?: ProviderPageBinding) {
      const normalizedBinding = normalizePageBinding(currentBinding);

      if (source === "fixture") {
        const snapshot = parseCursorPersonalEvidenceFixture(
          personalPageLiveEvidenceFixture as CursorPersonalEvidenceFixture,
        );

        if (!snapshot) {
          return {
            result: {
              status: "route_drift",
              reason:
                "The stored Cursor personal evidence fixture no longer exposes parseable billing-period usage signals.",
              chosenRoute:
                (personalPageLiveEvidenceFixture as CursorPersonalEvidenceFixture)
                  .route.url,
              routeStatuses: [
                {
                  routeKey: "dashboard_usage",
                  status: "matched",
                  matchedUrl:
                    (personalPageLiveEvidenceFixture as CursorPersonalEvidenceFixture)
                      .route.url,
                },
              ],
            } satisfies CursorPersonalParseResult,
            pageBinding: normalizedBinding,
          };
        }

        return {
          result: {
            status: "ok",
            snapshot,
          } satisfies CursorPersonalParseResult,
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
      let fixture = await captureCursorPersonalLiveFixture(
        pageSessionClient,
        pageSessionBinding,
        captureOptions,
      );
      let result = parseCursorPersonalLiveFixture(
        fixture as CursorPersonalLiveFixture,
      );

      for (
        let attempt = 0;
        attempt < retryAttempts &&
        shouldRetryHydratingCursorRoute(fixture, result);
        attempt += 1
      ) {
        await delay(retryDelayMs);
        const retryFixture = await captureCursorPersonalLiveFixture(
          pageSessionClient,
          pageSessionBinding,
          { openPageWhenMissing: false },
        );
        fixture = mergeCursorCaptureFixtures(retryFixture, fixture);
        result = parseCursorPersonalLiveFixture(
          fixture as CursorPersonalLiveFixture,
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
