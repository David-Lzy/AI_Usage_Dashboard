import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { ApiGatewayMeteringSnapshot, AppState } from "../../providers/types";
import { DEFAULT_APP_STATE } from "../../shared/constants";
import { createRuntimeI18n } from "../../shared/i18n";
import { UsageExport } from "./UsageExport";

function createState(): Pick<AppState, "providers" | "providerSettings" | "providerAccounts"> {
  const state = structuredClone(DEFAULT_APP_STATE);
  const snapshot = state.providers.find((entry) => entry.providerId === "sub2api-api-key")!;
  const setting = state.providerSettings.find((entry) => entry.id === "sub2api-api-key")!;
  const metering: ApiGatewayMeteringSnapshot = { schemaVersion: 1, accountId: "default", productKind: "metered_api_gateway", displayLabel: "Local account", origin: "https://gateway.example.test", transport: "https", scope: "api_key", billingMode: "wallet", capturedAt: "2026-09-22T10:00:00.000Z", stale: false, isValid: true, status: "active", planName: null, remaining: null, balance: null, quota: null, subscription: null, rateLimits: [], usage: null, dailyUsage: [{ date: "2026-09-20", totals: { requests: 0, inputTokens: 0, outputTokens: 0, cacheCreationTokens: 0, cacheReadTokens: 0, totalTokens: 0, actualCost: { amount: 0, unit: "USD" }, referenceCost: { amount: 0, unit: "USD" } } }], dailyUsageContext: { capturedAt: "2026-09-22T10:00:00.000Z", bucketTimezone: "UTC", requestedTimezone: "UTC" }, modelUsage: [], modelSeriesTruncated: false };
  snapshot.apiGatewayMetering = metering;
  snapshot.syncStatus = "ok";
  setting.status = "granted";
  state.providerAccounts = { "sub2api-api-key": { activeAccountId: "default", accounts: [{ id: "default", label: "Local account", createdAt: null, lastSuccessAt: metering.capturedAt, apiGatewayConnection: { schemaVersion: 1, displayLabel: "Local account", baseUrl: metering.origin, insecureTransportAcknowledged: false } }], inactiveAccounts: {} } };
  return state;
}

describe("UsageExport", () => {
  it("renders a local saved-account scope and requires an explicit preview", () => {
    const html = renderToStaticMarkup(<UsageExport i18n={createRuntimeI18n("en")} providerId="sub2api-api-key" state={createState()} />);

    expect(html).toContain('data-usage-export=""');
    expect(html).toContain("Saved account");
    expect(html).toContain("Gateway daily usage");
    expect(html).toContain('data-usage-export-action="preview"');
    expect(html).not.toContain("data-usage-export-preview");
    expect(html).not.toContain('data-usage-export-action="download"');
  });

  it("renders a localized unavailable-family state without exporting", () => {
    const state = createState();
    state.providers.find((provider) => provider.providerId === "sub2api-api-key")!.apiGatewayMetering = undefined;
    const html = renderToStaticMarkup(<UsageExport i18n={createRuntimeI18n("ar")} providerId="sub2api-api-key" state={state} />);

    expect(html).toContain('data-usage-export=""');
    expect(html).toContain("لا توجد بيانات استخدام محفوظة قابلة للتصدير");
    expect(html).not.toContain('data-usage-export-action="preview"');
    expect(html).not.toContain('type="date"');
  });
});
