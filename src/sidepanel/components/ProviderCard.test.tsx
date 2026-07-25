import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createAdapterErrorDiagnostic } from "../../providers/diagnostics";
import type {
  ApiGatewayMeteringDisplayPreferences,
  ApiGatewayMeteringSnapshot,
  AppLocalePreference,
  AppState,
  ProviderId,
} from "../../providers/types";
import { SAMPLE_APP_STATE } from "../../shared/constants";
import { getProviderViewModel } from "../view-models";
import { ProviderCard } from "./ProviderCard";

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

function renderProviderCard(
  state: AppState,
  providerId: ProviderId,
  options: {
    apiGatewayMeteringDisplayPreferences?: ApiGatewayMeteringDisplayPreferences;
    localePreference?: AppLocalePreference;
    onOpenSourcePage?: () => void;
    usageHistoryModulesBySurface?: AppState["settings"]["usageHistoryModulesBySurface"];
  } = {},
) {
  const provider = getProviderViewModel(state, providerId);

  if (!provider) {
    throw new Error(`Missing provider ${providerId}`);
  }

  return renderToStaticMarkup(
    <ProviderCard
      apiGatewayMeteringDisplayPreferences={
        options.apiGatewayMeteringDisplayPreferences
      }
      localePreference={options.localePreference ?? "en"}
      progressColorBands={state.settings.progressColorBands}
      progressDisplayStyle="line"
      progressItemsBySurface={state.settings.progressItemsBySurface}
      progressThicknessPx={state.settings.progressThicknessPx}
      progressSurface="sidebar"
      usageHistoryModulesBySurface={options.usageHistoryModulesBySurface}
      providerServiceStatuses={state.providerServiceStatuses}
      providerServiceStatusVisibilityBySurface={
        state.settings.providerServiceStatusVisibilityBySurface
      }
      provider={provider}
      onOpen={() => undefined}
      onOpenSourcePage={options.onOpenSourcePage}
      onRefresh={() => undefined}
    />,
  );
}

describe("ProviderCard", () => {
  it("renders API gateway metering without the generic unknown-usage block", () => {
    const metering: ApiGatewayMeteringSnapshot = {
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
      remaining: { amount: 18.75, unit: "USD" },
      balance: { amount: 18.75, unit: "USD" },
      quota: null,
      subscription: null,
      rateLimits: [],
      usage: null,
      dailyUsage: [],
      modelUsage: [],
      modelSeriesTruncated: false,
    };
    const state = createState({
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "sub2api-api-key"
          ? { ...provider, apiGatewayMetering: metering }
          : provider,
      ),
    });
    const html = renderProviderCard(state, "sub2api-api-key");

    expect(html).toContain("Usage summary");
    expect(html).toContain("Available balance");
    expect(html).toContain("$18.75");
    expect(html).not.toContain("Provider source context");
    expect(html).not.toContain("Usage unknown");
  });

  it("renders available history and unmounts a hidden surface module", () => {
    const state = createState({
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "codex-personal-page"
          ? {
              ...provider,
              usageHistory: {
                capturedAt: "2026-07-13T00:00:00.000Z",
                rangeStart: "2026-07-13",
                rangeEnd: "2026-07-13",
                granularity: "day" as const,
                personalUsageBySurface: { unit: "percent" as const, points: [{ date: "2026-07-13", values: [{ id: "desktop", label: "Desktop", value: 50 }] }] },
                turns: { total: 7, byModel: [{ date: "2026-07-13", values: [{ id: "gpt", label: "GPT", value: 7 }] }], bySurface: [] },
              },
            }
          : provider,
      ),
    });
    const visibleHtml = renderProviderCard(state, "codex-personal-page");
    const hiddenHtml = renderProviderCard(state, "codex-personal-page", {
      usageHistoryModulesBySurface: {
        popup: {},
        fullPage: {},
        sidebar: { "codex-personal-page": [
          { id: "personal_usage_by_surface", visible: true },
          { id: "turns_history", visible: false },
        ] },
      },
    });

    expect(visibleHtml).toContain("Personal usage");
    expect(visibleHtml).toContain("Turns trend");
    expect(hiddenHtml).toContain("Personal usage");
    expect(hiddenHtml).not.toContain("Turns trend");
  });

  it("renders visible history modules in the configured surface order", () => {
    const state = createState({
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "codex-personal-page"
          ? {
              ...provider,
              usageHistory: {
                capturedAt: "2026-07-13T00:00:00.000Z",
                rangeStart: "2026-07-13",
                rangeEnd: "2026-07-13",
                granularity: "day" as const,
                personalUsageBySurface: {
                  unit: "percent" as const,
                  points: [],
                },
                turns: { total: 0, byModel: [], bySurface: [] },
              },
            }
          : provider,
      ),
    });
    const html = renderProviderCard(state, "codex-personal-page", {
      usageHistoryModulesBySurface: {
        popup: {},
        fullPage: {},
        sidebar: {
          "codex-personal-page": [
            { id: "turns_history", visible: true },
            { id: "personal_usage_by_surface", visible: true },
          ],
        },
      },
    });

    expect(
      html.indexOf('usage-history-compact__title">Turns trend<'),
    ).toBeLessThan(
      html.indexOf('usage-history-compact__title">Personal usage<'),
    );
  });

  it("does not reserve two empty modules before history is captured", () => {
    const html = renderProviderCard(createState(), "codex-personal-page");

    expect(html).not.toContain("usage-history-compact");
    expect(html).not.toContain("No history data yet");
  });

  it("mounts service status only when it is enabled for the current surface", () => {
    const status = {
      vendorId: "openai" as const,
      brandId: "codex" as const,
      level: "operational" as const,
      description: "All Systems Operational",
      statusPageUrl: "https://status.openai.com",
      checkedAt: "2026-07-25T06:00:00.000Z",
      sourceUpdatedAt: null,
      retryAt: null,
      stale: false,
      failureReason: null,
      components: [],
      incidents: [],
    };
    const hiddenState = createState({ providerServiceStatuses: [status] });
    const visibleState = createState({
      providerServiceStatuses: [status],
      settings: {
        ...SAMPLE_APP_STATE.settings,
        providerServiceStatusVisibilityBySurface: {
          ...SAMPLE_APP_STATE.settings
            .providerServiceStatusVisibilityBySurface,
          sidebar: {
            ...SAMPLE_APP_STATE.settings
              .providerServiceStatusVisibilityBySurface.sidebar,
            codex: true,
          },
        },
      },
    });

    expect(renderProviderCard(hiddenState, "codex-personal-page")).not.toContain(
      "data-provider-service-status=",
    );
    expect(renderProviderCard(visibleState, "codex-personal-page")).toContain(
      'data-provider-service-status="openai"',
    );
  });

  it("uses the Material provider-card hierarchy for summary, progress, chips, and actions", () => {
    const html = renderProviderCard(createState(), "codex-personal-page");

    expect(html).toContain('<header class="provider-card__header">');
    expect(html).toContain('class="provider-card__identity"');
    expect(html).toContain('class="provider-card__status"');
    expect(html).toContain('class="provider-card__summary"');
    expect(html).toContain('class="provider-card__usage-label"');
    expect(html).toContain('class="provider-card__progress-surface"');
    expect(html).toContain('class="provider-card__meta"');
    expect(html).toContain('<footer class="provider-card__footer">');
    expect(html).toContain(
      'class="text-button provider-card__action provider-card__action--primary"',
    );
  });

  it("does not render stale progress when host access is missing", () => {
    const html = renderProviderCard(createState(), "jetbrains-org-page");

    expect(html).toContain("Host access missing");
    expect(html).not.toContain('class="provider-card__progress-surface"');
    expect(html).not.toContain('role="progressbar"');
  });

  it("does not render empty percent progress when Codex page parsing fails", () => {
    const warningReason =
      "The matched Codex usage page no longer exposed a parseable remaining-percentage window.";
    const state = createState({
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "codex-personal-page"
          ? {
              ...provider,
              planName: "Codex Personal Usage Page",
              quotaUnit: "percent",
              quotaWindow: "rolling",
              used: null,
              remaining: null,
              total: 100,
              resetAt: "Visible usage-window reset time",
              resetLabel:
                "Inspect the live Codex page and update the parser assumptions",
              syncSource: "page_parse",
              syncStatus: "error",
              tone: "error",
              warningReason,
              warningDiagnostic: createAdapterErrorDiagnostic({
                providerId: "codex-personal-page",
                adapterErrorKind: "parse_failed",
                sourceKind: "session_page",
                failureCode: "route_drift",
                parserStage: "personal_usage_page",
                rawMessage: warningReason,
              }),
              usageWindows: undefined,
              usageBalances: undefined,
              usageSummary: null,
              lastSyncLabel: "Codex usage page parse failed",
            }
          : provider,
      ),
    });

    const html = renderProviderCard(state, "codex-personal-page");

    expect(html).toContain("Usage window percent unavailable");
    expect(html).toContain("Inspect the live Codex page");
    expect(html).not.toContain('role="progressbar"');
    expect(html).not.toContain("rolling percent");
    expect(html).not.toContain("&gt;Unknown&lt;");
  });

  it("does not render policy-only totals as fabricated progress", () => {
    const html = renderProviderCard(createState(), "gemini-policy");

    expect(html).not.toContain('role="progressbar"');
    expect(html).toContain("Unknown / 2,000 requests");
    expect(html).toContain("Documented quota snapshot");
  });

  it("renders a source-page recovery action for shipped session-page providers", () => {
    const html = renderProviderCard(createState(), "codex-personal-page", {
      onOpenSourcePage: () => undefined,
    });

    expect(html).toContain('data-provider-card-open-source-page="true"');
    expect(html).toContain(">Source page<");
    expect(html).toContain('title="Open source page"');
  });

  it("renders Cursor personal spend facts as structured usage context", () => {
    const html = renderProviderCard(createState(), "cursor-personal-page");

    expect(html).toContain("Visible usage context");
    expect(html).toContain('class="usage-facts usage-facts--compact"');
    expect(html).toContain("Billing period");
    expect(html).toContain("Mar 23 - Apr 21");
    expect(html).toContain("Total spend");
    expect(html).toContain("$0");
    expect(html).not.toContain("Usage unknown · requests");
    expect(html).not.toContain("Visible Cursor usage:");
  });

  it("renders Claude Personal plan, windows, and freshness without primary-card diagnostics", () => {
    const state = createState({
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "claude-code-team-page"
          ? {
              ...provider,
              planName: "Claude Pro (Current session)",
              quotaUnit: "percent",
              quotaWindow: "rolling",
              used: 49,
              remaining: 51,
              total: 100,
              resetAt: "in 29 min",
              resetLabel: "Current session resets in 29 min",
              syncSource: "page_parse",
              syncStatus: "ok",
              tone: "neutral",
              warningReason: null,
              usageWindows: [
                {
                  label: "Current session",
                  normalizedLabel: "Current session",
                  kind: "unknown",
                  modelLabel: null,
                  quotaUnit: "percent",
                  used: 49,
                  remaining: 51,
                  total: 100,
                  resetAt: "in 29 min",
                  resetLabel: "Current session resets in 29 min",
                },
                {
                  label: "All models",
                  normalizedLabel: "All models weekly limit",
                  kind: "weekly",
                  modelLabel: null,
                  quotaUnit: "percent",
                  used: 15,
                  remaining: 85,
                  total: 100,
                  resetAt: "in 9 hr 49 min",
                  resetLabel: "All models weekly limit resets in 9 hr 49 min",
                },
                {
                  label: "Claude Design",
                  normalizedLabel: "Claude Design",
                  kind: "unknown",
                  modelLabel: null,
                  quotaUnit: "percent",
                  used: 0,
                  remaining: 100,
                  total: 100,
                  resetAt: null,
                  resetLabel: "You haven't used Claude Design yet",
                },
                {
                  label: "Daily included routine runs",
                  normalizedLabel: "Daily included routine runs",
                  kind: "unknown",
                  modelLabel: null,
                  quotaUnit: "percent",
                  used: 0,
                  remaining: 100,
                  total: 100,
                  resetAt: null,
                  resetLabel: "0 / 25",
                },
              ],
              usageFacts: [],
              usageSummary: null,
              lastSyncLabel: "Claude usage page synced just now",
            }
          : provider,
      ),
    });

    const html = renderProviderCard(state, "claude-code-team-page");

    expect(html).toContain('class="provider-progress-item-list');
    expect(html.match(/role="progressbar"/g)).toHaveLength(4);
    expect(html).toContain("Current session");
    expect(html).toContain("Weekly limit");
    expect(html).toContain("Claude Design");
    expect(html).toContain("Daily included routine runs");
    expect(html).toContain("Claude Pro (Current session)");
    expect(html).toContain("Claude usage page synced just now");
    expect(html).not.toContain("Shipped personal partial");
    expect(html).not.toContain("Provider source context");
    expect(html).not.toContain("Usage window percent unavailable");
    expect(html).not.toContain("rolling percent");
  });

  it("keeps an empty Claude recovery card compact and localizes its status", () => {
    const html = renderProviderCard(
      createState(),
      "claude-code-team-page",
      {
        localePreference: "zh-CN",
        onOpenSourcePage: () => undefined,
      },
    );

    expect(html).toContain("告警");
    expect(html).toContain("provider-card__product-context");
    expect(html).toContain('data-provider-card-open-source-page="true"');
    expect(html).not.toContain("Shipped personal partial");
    expect(html).not.toContain("Provider source context");
    expect(html).not.toContain(">Refresh<");
  });

  it("honors hidden sidebar progress item preferences", () => {
    const state = createState({
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "cursor-team-api"
          ? {
              ...provider,
              quotaUnit: "credits" as const,
              quotaWindow: "monthly" as const,
              used: 16,
              remaining: 4,
              total: 20,
            }
          : provider,
      ),
      settings: {
        ...SAMPLE_APP_STATE.settings,
        progressItemsBySurface: {
          ...SAMPLE_APP_STATE.settings.progressItemsBySurface,
          sidebar: {
            "cursor-team-api": [{ id: "primary", visible: false }],
          },
        },
      },
    });
    const html = renderProviderCard(state, "cursor-team-api");

    expect(html).not.toContain('role="progressbar"');
    expect(html).toContain("16 / 20 credits");
  });

  it("omits the source-page recovery action for deferred session-page providers", () => {
    const html = renderProviderCard(createState(), "gemini-policy", {
      onOpenSourcePage: () => undefined,
    });

    expect(html).not.toContain('data-provider-card-open-source-page="true"');
    expect(html).not.toContain(">Source page<");
  });
});
