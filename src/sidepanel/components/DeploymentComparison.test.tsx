import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { ApiGatewayMeteringSnapshot, AppState } from "../../providers/types";
import { DEFAULT_APP_STATE } from "../../shared/constants";
import { createRuntimeI18n } from "../../shared/i18n";
import { DeploymentComparison } from "./DeploymentComparison";

const PROVIDER_ID = "sub2api-api-key" as const;
const CAPTURED_AT = "2026-09-22T11:50:00.000Z";

function createMetering(): ApiGatewayMeteringSnapshot {
  return {
    schemaVersion: 1,
    accountId: "default",
    productKind: "metered_api_gateway",
    displayLabel: "Production deployment with a deliberately long label",
    origin: "https://gateway.example.test",
    transport: "https",
    scope: "api_key",
    billingMode: "wallet",
    capturedAt: CAPTURED_AT,
    stale: false,
    isValid: true,
    status: "active",
    planName: null,
    remaining: null,
    balance: null,
    quota: null,
    subscription: null,
    rateLimits: [],
    usage: null,
    dailyUsage: [
      {
        date: "2026-09-20",
        totals: {
          requests: 4,
          inputTokens: 10,
          outputTokens: 20,
          cacheCreationTokens: 0,
          cacheReadTokens: 0,
          totalTokens: 30,
          actualCost: { amount: 1.25, unit: "USD" },
          referenceCost: { amount: 1.5, unit: "USD" },
        },
      },
    ],
    dailyUsageContext: {
      capturedAt: CAPTURED_AT,
      requestedTimezone: "UTC",
      bucketTimezone: "UTC",
    },
    modelUsage: [],
    modelSeriesTruncated: false,
  };
}

function createState(): Pick<
  AppState,
  "providers" | "providerSettings" | "providerAccounts"
> {
  const state = structuredClone(DEFAULT_APP_STATE);
  const snapshot = state.providers.find((entry) => entry.providerId === PROVIDER_ID)!;
  const setting = state.providerSettings.find((entry) => entry.id === PROVIDER_ID)!;
  snapshot.apiGatewayMetering = createMetering();
  snapshot.syncStatus = "ok";
  setting.status = "granted";
  setting.credentialStatus = "configured";
  state.providerAccounts = {
    [PROVIDER_ID]: {
      activeAccountId: "default",
      accounts: [
        {
          id: "default",
          label: "Production deployment with a deliberately long label",
          createdAt: null,
          lastSuccessAt: CAPTURED_AT,
          apiGatewayConnection: {
            schemaVersion: 1,
            displayLabel: "Production",
            baseUrl: "https://gateway.example.test",
            insecureTransportAcknowledged: false,
          },
        },
      ],
      inactiveAccounts: {},
    },
  };

  return state;
}

describe("DeploymentComparison", () => {
  it("renders a named scrollable table with localized source totals", () => {
    const html = renderToStaticMarkup(
      <DeploymentComparison
        i18n={createRuntimeI18n("en")}
        state={createState()}
        onRefreshAccount={async () => undefined}
      />,
    );

    expect(html).toContain('data-deployment-comparison=""');
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="Deployment comparison table"');
    expect(html).toContain('data-gateway-comparison-status=""');
    expect(html).toContain("Sep 22, 2026");
    expect(html).toContain('data-material-action-icon="refresh"');
    expect(html).not.toContain(">4 requests<");
  });
});
