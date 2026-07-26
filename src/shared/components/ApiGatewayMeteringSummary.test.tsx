import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type {
  ApiGatewayMeteringDisplayPreferences,
  ApiGatewayMeteringSnapshot,
  ApiGatewayUsageMetric,
} from "../../providers/types";
import { buildApiGatewayMeteringLocalizedCopy } from "../api-gateway-metering-localized-copy";
import { ApiGatewayMeteringSummary } from "./ApiGatewayMeteringSummary";

const css = readFileSync(
  new URL("./api-gateway-metering-summary.css", import.meta.url),
  "utf8",
);

function money(amount: number, unit = "USD") {
  return { amount, unit };
}

function metric(
  overrides: Partial<ApiGatewayUsageMetric> = {},
): ApiGatewayUsageMetric {
  return {
    requests: 12,
    inputTokens: 4_200,
    outputTokens: 900,
    cacheCreationTokens: 400,
    cacheReadTokens: 1_800,
    totalTokens: 7_300,
    referenceCost: money(1.25),
    actualCost: money(0.92),
    ...overrides,
  };
}

function snapshot(
  overrides: Partial<ApiGatewayMeteringSnapshot> = {},
): ApiGatewayMeteringSnapshot {
  return {
    schemaVersion: 1,
    accountId: "account_12345678",
    productKind: "metered_api_gateway",
    displayLabel: "Gateway 1",
    origin: "https://gateway.example.test",
    transport: "https",
    scope: "api_key",
    billingMode: "wallet",
    capturedAt: "2026-07-25T10:00:00.000Z",
    stale: false,
    isValid: true,
    status: "active",
    planName: "Wallet",
    remaining: money(18.75),
    balance: money(18.75),
    quota: null,
    subscription: null,
    rateLimits: [],
    usage: {
      today: metric(),
      total: metric({ requests: 80, totalTokens: 44_700 }),
      averageDurationMs: 1_840,
      requestsPerMinute: 2,
      tokensPerMinute: 1_450,
    },
    dailyUsage: [
      { date: "2026-07-24", totals: metric({ requests: 8, actualCost: money(0.4) }) },
      { date: "2026-07-25", totals: metric({ requests: 12, actualCost: money(0.6) }) },
    ],
    modelUsage: [
      { id: "model-a", label: "Model Alpha", totals: metric({ totalTokens: 70_000 }) },
      { id: "model-b", label: "Model Beta", totals: metric({ totalTokens: 20_000 }) },
      { id: "model-c", label: "Model Gamma", totals: metric({ totalTokens: 7_000 }) },
      { id: "model-d", label: "A Very Long Model Delta", totals: metric({ totalTokens: 3_000 }) },
    ],
    modelSeriesTruncated: false,
    ...overrides,
  };
}

function render(
  metering: ApiGatewayMeteringSnapshot,
  preferences?: ApiGatewayMeteringDisplayPreferences,
  density: "compact" | "detail" = "compact",
  deployment?: {
    activeDeploymentId?: string | null;
    deploymentOptions?: readonly { id: string; label: string }[];
    onSelectDeployment?: (accountId: string) => void;
  },
) {
  return renderToStaticMarkup(
    <ApiGatewayMeteringSummary
      activeDeploymentId={deployment?.activeDeploymentId}
      copy={buildApiGatewayMeteringLocalizedCopy("en")}
      density={density}
      deploymentOptions={deployment?.deploymentOptions}
      locale="en"
      metering={metering}
      onSelectDeployment={deployment?.onSelectDeployment}
      preferences={preferences}
      providerId="sub2api-api-key"
      surface="popup"
    />,
  );
}

describe("ApiGatewayMeteringSummary", () => {
  it("renders a truthful wallet summary, selected-period facts, trend, and bounded models", () => {
    const html = render(snapshot());

    expect(html).toContain("Available balance");
    expect(html).toContain("$18.75");
    expect(html).toContain("Actual spend");
    expect(html).toContain("$1");
    expect(html).toContain("20");
    expect(html).toContain("14.6K");
    expect(html).toContain("Usage trend");
    expect(html).toContain("usage-history-chart--area");
    expect(html).toContain("Leading models");
    expect(html).toContain("usage-composition-chart--compact");
    expect(html).toContain('data-composition-layer="model-a"');
    expect(html).not.toContain("api-gateway-metering-model-bar");
    expect(html).toContain("Model Alpha");
    expect(html).toContain("Other");
    expect(html).not.toContain("1,840");
    expect(html).not.toContain("1,450");
  });

  it("uses a real finite quota for progress without inventing a percentage", () => {
    const quotaHtml = render(
      snapshot({
        billingMode: "quota",
        balance: null,
        remaining: null,
        quota: {
          limit: money(100),
          used: money(40),
          remaining: money(60),
        },
      }),
    );
    const unrestrictedHtml = render(
      snapshot({
        billingMode: "unrestricted",
        balance: null,
        remaining: null,
      }),
    );

    expect(quotaHtml).toContain('role="progressbar"');
    expect(quotaHtml).toContain('aria-valuenow="40"');
    expect(quotaHtml).toContain("$60");
    expect(unrestrictedHtml).toContain("No fixed limit returned");
    expect(unrestrictedHtml).not.toContain('role="progressbar"');
  });

  it("chooses the strongest returned subscription allowance and keeps scope metadata in detail only", () => {
    const metering = snapshot({
      billingMode: "subscription",
      scope: "account",
      stale: true,
      balance: null,
      remaining: null,
      subscription: {
        dailyUsage: money(2),
        weeklyUsage: money(11),
        monthlyUsage: money(37),
        dailyLimit: money(10),
        weeklyLimit: money(60),
        monthlyLimit: money(200),
        expiresAt: "2026-08-25T00:00:00.000Z",
      },
    });
    const html = render(metering);
    const detailHtml = render(metering, undefined, "detail");

    expect(html).toContain("Monthly allowance remaining");
    expect(html).toContain("$163");
    expect(html).not.toContain("Account scope · Saved data");
    expect(detailHtml).toContain("Account scope · Saved data");
    expect(html).toContain('data-api-gateway-metering-stale="true"');
  });

  it("places deployment and range controls in compact module headers without duplicate period text", () => {
    const singleHtml = render(snapshot({ displayLabel: "hze" }), undefined, "compact", {
      activeDeploymentId: "account_hze12345",
      deploymentOptions: [{ id: "account_hze12345", label: "hze" }],
      onSelectDeployment: () => undefined,
    });
    const multipleHtml = render(snapshot({ displayLabel: "hze" }), undefined, "compact", {
      activeDeploymentId: "account_hze12345",
      deploymentOptions: [
        { id: "account_hze12345", label: "hze" },
        { id: "account_backup1234", label: "Backup gateway" },
      ],
      onSelectDeployment: () => undefined,
    });

    expect(singleHtml).toContain(
      "api-gateway-metering-deployment--single",
    );
    expect(singleHtml).not.toContain("<select");
    expect(singleHtml.match(/(?:7|30) days/g)).toHaveLength(1);
    expect(multipleHtml).toContain(
      "api-gateway-metering-deployment--select",
    );
    expect(multipleHtml).toContain('<option value="account_backup1234">');
    expect(multipleHtml).toContain("Backup gateway");
  });

  it("unmounts hidden modules and preserves account-local module order", () => {
    const html = render(snapshot(), {
      popup: [
        { id: "model_breakdown", visible: true },
        { id: "summary", visible: true },
        { id: "trend", visible: false },
        { id: "limit_windows", visible: false },
      ],
      sidebar: [],
      fullPage: [],
    });

    expect(html.indexOf("Leading models")).toBeLessThan(
      html.indexOf("Usage summary"),
    );
    expect(html).not.toContain("Usage trend");
    expect(html).not.toContain(
      'class="usage-history-chart usage-history-chart--area',
    );
  });

  it("keeps the compact surface responsive without decorative nested cards", () => {
    expect(css).toContain(
      "grid-template-columns: minmax(0, 1.55fr) repeat(3, minmax(0, 1fr))",
    );
    expect(css).toContain("grid-template-rows: subgrid");
    expect(css).toContain(
      "border-block-start: 1px solid var(--md-sys-color-outline-variant);",
    );
    expect(css).not.toContain(
      "border-block: 1px solid var(--md-sys-color-outline-variant);",
    );
    expect(css).toContain("@media (max-width: 420px)");
    expect(css).toContain("overflow-wrap: anywhere");
    expect(css).not.toContain("backdrop-filter");
  });

  it("renders detailed cost, token, model, latency, trend, and limit analysis", () => {
    const html = render(
      snapshot({
        rateLimits: [
          {
            id: "daily-budget",
            limit: money(25),
            used: money(10),
            remaining: money(15),
            windowStart: "2026-07-25T00:00:00.000Z",
            resetAt: "2026-07-26T00:00:00.000Z",
          },
        ],
      }),
      undefined,
      "detail",
    );

    expect(html).toContain("Reference cost");
    expect(html).toContain("Estimated savings");
    expect(html).toContain("Average latency");
    expect(html).toContain("1.84 s");
    expect(html).toContain("Token breakdown");
    expect(html).toContain("Input");
    expect(html).toContain("Output");
    expect(html).toContain("Cache creation");
    expect(html).toContain("Cache read");
    expect(html).toContain("7 days");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("usage-history-chart--area");
    expect(html).toContain('d="M');
    expect(html).toContain("Model Alpha");
    expect(html).toContain("daily-budget");
    expect(html).toContain("Resets");
  });

  it("omits unavailable detail facts instead of rendering false zero values", () => {
    const emptyMetric = metric({
      actualCost: null,
      referenceCost: null,
      requests: null,
      inputTokens: null,
      outputTokens: null,
      cacheCreationTokens: null,
      cacheReadTokens: null,
      totalTokens: null,
    });
    const html = render(
      snapshot({
        usage: {
          today: emptyMetric,
          total: emptyMetric,
          averageDurationMs: null,
          requestsPerMinute: null,
          tokensPerMinute: null,
        },
        dailyUsage: [],
        modelUsage: [],
      }),
      undefined,
      "detail",
    );

    expect(html).not.toContain("Reference cost");
    expect(html).not.toContain("Estimated savings");
    expect(html).not.toContain("Average latency");
    expect(html).not.toContain("Token breakdown");
    expect(html).not.toContain("Usage trend");
    expect(html).not.toContain("Leading models");
    expect(html).not.toContain("$0");
  });

  it("keeps detailed analytics responsive and clipped to their owning surface", () => {
    expect(css).toContain("api-gateway-metering-summary--detail");
    expect(css).toContain("repeat(auto-fit, minmax(min(100%, 150px), 1fr))");
    expect(css).toContain("overflow: hidden");
    expect(css).toContain("min-width: 0");
  });
});
