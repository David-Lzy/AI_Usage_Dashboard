import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type {
  ApiGatewayMeteringSnapshot,
  AppState,
  CursorUsageBilling,
} from "../../providers/types";
import { SAMPLE_APP_STATE } from "../../shared/constants";
import { getProviderViewModel } from "../view-models";
import { ProviderDetailPage } from "./ProviderDetailPage";

function createState(overrides?: Partial<AppState>): AppState {
  return {
    ...SAMPLE_APP_STATE,
    ...overrides,
    providers: overrides?.providers ?? SAMPLE_APP_STATE.providers,
    providerSettings:
      overrides?.providerSettings ?? SAMPLE_APP_STATE.providerSettings,
    settings: overrides?.settings ?? SAMPLE_APP_STATE.settings,
  };
}

const CURSOR_USAGE: CursorUsageBilling = {
  capturedAt: "2026-07-15T00:00:00.000Z",
  billingCapturedAt: "2026-07-15T00:00:00.000Z",
  historyCapturedAt: "2026-07-15T00:00:00.000Z",
  billingCycleStart: "2026-07-01T00:00:00.000Z",
  billingCycleEnd: "2026-08-01T00:00:00.000Z",
  membershipType: "pro",
  limitType: "plan",
  isUnlimited: false,
  currency: "USD",
  planName: "Pro",
  planIncludedAmountCents: 10000,
  planPriceLabel: "$20",
  planOwner: "individual",
  plan: {
    enabled: true,
    usedCents: 4200,
    limitCents: 10000,
    remainingCents: 5800,
    includedUsageCents: 4000,
    bonusUsageCents: 200,
    totalUsageCents: 4200,
    autoPercentUsed: 18,
    apiPercentUsed: 24,
    totalPercentUsed: 42,
  },
  onDemand: {
    enabled: true,
    usedCents: 350,
    limitCents: 2000,
    remainingCents: 1650,
  },
  noUsageBasedAllowed: false,
  history: null,
};

const SUB2API_METERING: ApiGatewayMeteringSnapshot = {
  schemaVersion: 1,
  accountId: "account_sub2api",
  productKind: "metered_api_gateway",
  displayLabel: "Production gateway",
  origin: "https://gateway.example.test",
  transport: "https",
  scope: "api_key",
  billingMode: "wallet",
  capturedAt: "2026-07-25T10:00:00.000Z",
  stale: false,
  isValid: true,
  status: "active",
  planName: "Wallet",
  remaining: { amount: 18.75, unit: "USD" },
  balance: { amount: 18.75, unit: "USD" },
  quota: null,
  subscription: null,
  rateLimits: [
    {
      id: "daily-budget",
      limit: { amount: 25, unit: "USD" },
      used: { amount: 10, unit: "USD" },
      remaining: { amount: 15, unit: "USD" },
      windowStart: "2026-07-25T00:00:00.000Z",
      resetAt: "2026-07-26T00:00:00.000Z",
    },
  ],
  usage: {
    today: null,
    total: {
      requests: 315,
      inputTokens: 5_300_000,
      outputTokens: 180_000,
      cacheCreationTokens: 0,
      cacheReadTokens: 47_000_000,
      totalTokens: 52_480_000,
      referenceCost: { amount: 72.44, unit: "USD" },
      actualCost: { amount: 55.67, unit: "USD" },
    },
    averageDurationMs: 25_840,
    requestsPerMinute: 1,
    tokensPerMinute: 28_300,
  },
  dailyUsage: [
    {
      date: "2026-07-24",
      totals: {
        requests: 120,
        inputTokens: 2_100_000,
        outputTokens: 80_000,
        cacheCreationTokens: 0,
        cacheReadTokens: 18_000_000,
        totalTokens: 20_180_000,
        referenceCost: { amount: 29.2, unit: "USD" },
        actualCost: { amount: 22.1, unit: "USD" },
      },
    },
    {
      date: "2026-07-25",
      totals: {
        requests: 195,
        inputTokens: 3_200_000,
        outputTokens: 100_000,
        cacheCreationTokens: 0,
        cacheReadTokens: 29_000_000,
        totalTokens: 32_300_000,
        referenceCost: { amount: 43.24, unit: "USD" },
        actualCost: { amount: 33.57, unit: "USD" },
      },
    },
  ],
  modelUsage: [
    {
      id: "gpt-main",
      label: "GPT main",
      totals: {
        requests: 313,
        inputTokens: 5_290_000,
        outputTokens: 170_000,
        cacheCreationTokens: 0,
        cacheReadTokens: 47_000_000,
        totalTokens: 52_460_000,
        referenceCost: { amount: 72.43, unit: "USD" },
        actualCost: { amount: 55.66, unit: "USD" },
      },
    },
  ],
  modelSeriesTruncated: false,
};

function renderProviderDetail(
  state: AppState,
  providerId:
    | "codex-personal-page"
    | "cursor-personal-page"
    | "gemini-policy"
    | "sub2api-api-key",
  options: {
    onOpenSourcePage?: () => void;
    progressSurface?: "sidebar" | "fullPage";
    quotaPaceForecastEnabled?: boolean;
    quotaPaceNow?: Date;
  } = {},
) {
  const provider = getProviderViewModel(state, providerId);

  if (!provider) {
    throw new Error(`Missing provider ${providerId}`);
  }

  return renderToStaticMarkup(
    <ProviderDetailPage
      localePreference="en"
      progressColorBands={state.settings.progressColorBands}
      progressDisplayStyle="line"
      progressItemsBySurface={state.settings.progressItemsBySurface}
      progressThicknessPx={state.settings.progressThicknessPx}
      progressSurface={options.progressSurface ?? "sidebar"}
      provider={provider}
      providerAccounts={state.providerAccounts}
      quotaPaceForecastEnabled={options.quotaPaceForecastEnabled}
      quotaPaceNow={options.quotaPaceNow}
      providerServiceStatuses={state.providerServiceStatuses}
      providerServiceStatusVisibilityBySurface={
        state.settings.providerServiceStatusVisibilityBySurface
      }
      onBack={() => undefined}
      onOpenSourcePage={options.onOpenSourcePage}
      onRefresh={() => undefined}
    />,
  );
}

describe("ProviderDetailPage", () => {
  it("renders a source-page recovery action for shipped session-page providers", () => {
    const html = renderProviderDetail(createState(), "codex-personal-page", {
      onOpenSourcePage: () => undefined,
    });

    expect(html).toContain('data-provider-detail-open-source-page="true"');
    expect(html).toContain("Source-page recovery");
    expect(html).toContain(">Open source page<");
  });

  it("omits the source-page recovery action for deferred session-page providers", () => {
    const html = renderProviderDetail(createState(), "gemini-policy", {
      onOpenSourcePage: () => undefined,
    });

    expect(html).not.toContain('data-provider-detail-open-source-page="true"');
    expect(html).not.toContain("Source-page recovery");
  });

  it("renders Cursor personal spend facts without claiming request remaining", () => {
    const html = renderProviderDetail(createState(), "cursor-personal-page");

    expect(html).toContain("Visible usage context");
    expect(html).toContain('class="usage-facts usage-facts--regular"');
    expect(html).toContain("Total spend");
    expect(html).toContain("Included");
    expect(html).toContain("On-demand");
    expect(html).toContain("Plan-included spend shown by Cursor");
    expect(html).not.toContain("Usage unknown · requests");
    expect(html).not.toContain("Visible Cursor usage:");
  });

  it("renders the detailed Cursor billing modules and source actions", () => {
    const state = createState({
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "cursor-personal-page"
          ? { ...provider, cursorUsage: CURSOR_USAGE }
          : provider,
      ),
    });
    const html = renderProviderDetail(state, "cursor-personal-page");

    expect(html).toContain('data-cursor-usage-detail=""');
    expect(html).toContain("cursor-usage-summary--detail");
    expect(html).toContain("Plan usage value");
    expect(html).toContain("Actual charge: $3.50");
    expect(html).toContain('href="https://cursor.com/dashboard/usage"');
    expect(html).toContain('href="https://cursor.com/dashboard/spending"');
    expect(html).not.toContain("request ledger");
  });

  it("renders truthful API gateway analytics without generic quota placeholders", () => {
    const state = createState({
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "sub2api-api-key"
          ? { ...provider, apiGatewayMetering: SUB2API_METERING }
          : provider,
      ),
    });
    const html = renderProviderDetail(state, "sub2api-api-key", {
      progressSurface: "fullPage",
    });

    expect(html).toContain('data-api-gateway-metering-detail=""');
    expect(html).toContain("Reference cost");
    expect(html).toContain("Estimated savings");
    expect(html).toContain("Average latency");
    expect(html).toContain("Token breakdown");
    expect(html).toContain("GPT main");
    expect(html).toContain("daily-budget");
    expect(html).toContain('href="https://gateway.example.test"');
    expect(html).toContain("Open source dashboard");
    expect(html).not.toContain("Usage unknown");
    expect(html).not.toContain("daily credits");
    expect(html).not.toContain("/v1/responses");
    expect(html).not.toContain("API key 1");
  });

  it("renders fresh fixed-window pace estimates only when opted in", () => {
    const state = createState({
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "codex-personal-page"
          ? {
              ...provider,
              syncedAt: "2026-07-25T11:55:00.000Z",
              usageWindows: [
                {
                  label: "Weekly usage window",
                  normalizedLabel: "weekly usage window",
                  kind: "weekly" as const,
                  modelLabel: null,
                  quotaUnit: "percent" as const,
                  used: 75,
                  remaining: 25,
                  total: 100,
                  resetAt: "2026-07-29T00:00:00.000Z",
                  resetLabel: "Resets Jul 29",
                },
              ],
            }
          : provider,
      ),
    });

    expect(
      renderProviderDetail(state, "codex-personal-page", {
        quotaPaceNow: new Date("2026-07-25T12:00:00.000Z"),
      }),
    ).not.toContain('data-provider-quota-pace=""');

    const html = renderProviderDetail(state, "codex-personal-page", {
      quotaPaceForecastEnabled: true,
      quotaPaceNow: new Date("2026-07-25T12:00:00.000Z"),
    });

    expect(html).toContain('data-provider-quota-pace=""');
    expect(html).toContain('data-quota-pace-status="at_risk"');
    expect(html).toContain("Quota pace");
    expect(html).toContain("Estimate");
    expect(html).toContain("May run out around");
  });

  it("renders detailed official status only when full-page visibility is enabled", () => {
    const status = {
      vendorId: "openai" as const,
      brandId: "codex" as const,
      level: "maintenance" as const,
      description: "Scheduled maintenance",
      statusPageUrl: "https://status.openai.com",
      checkedAt: "2026-07-25T06:00:00.000Z",
      sourceUpdatedAt: null,
      retryAt: null,
      stale: false,
      failureReason: null,
      components: [],
      incidents: [],
    };
    const enabledState = createState({
      providerServiceStatuses: [status],
      settings: {
        ...SAMPLE_APP_STATE.settings,
        providerServiceStatusVisibilityBySurface: {
          ...SAMPLE_APP_STATE.settings
            .providerServiceStatusVisibilityBySurface,
          fullPage: {
            ...SAMPLE_APP_STATE.settings
              .providerServiceStatusVisibilityBySurface.fullPage,
            codex: true,
          },
        },
      },
    });

    expect(renderProviderDetail(createState(), "codex-personal-page")).not.toContain(
      "data-provider-service-status-detail",
    );
    const html = renderProviderDetail(enabledState, "codex-personal-page", {
      progressSurface: "fullPage",
    });
    expect(html).toContain("data-provider-service-status-detail");
    expect(html).toContain("Scheduled maintenance");
  });
});
