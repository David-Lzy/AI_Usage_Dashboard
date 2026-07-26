import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createRuntimeI18n } from "../shared/i18n";
import type { ApiGatewayMeteringSnapshot, AppState } from "../providers/types";
import { SAMPLE_APP_STATE } from "../shared/constants";
import { getProviderViewModel } from "../sidepanel/view-models";
import { buildPopupViewModel } from "./view-models";
import { PopupFeaturedProviderList } from "./PopupFeaturedProviderList";

const popupThemeCss = readFileSync(
  new URL("./popup-theme.css", import.meta.url),
  "utf8",
);

function renderFeaturedList(
  cards = buildPopupViewModel(SAMPLE_APP_STATE).featuredProviderCards,
  state = SAMPLE_APP_STATE,
) {
  return renderToStaticMarkup(
    <PopupFeaturedProviderList
      ariaLabel="Featured providers"
      cards={cards}
      i18n={createRuntimeI18n("en")}
      sourcePageActionLabel="Open source page"
      progressColorBands={SAMPLE_APP_STATE.settings.progressColorBands}
      popupCircularProgressItemsPerRow={
        SAMPLE_APP_STATE.settings.popupCircularProgressItemsPerRow
      }
      providerBrowsingMode={state.settings.popupProviderBrowsingMode}
      progressDisplayStyle={SAMPLE_APP_STATE.settings.popupProgressStyle}
      progressItemsBySurface={SAMPLE_APP_STATE.settings.progressItemsBySurface}
      progressThicknessPx={SAMPLE_APP_STATE.settings.progressThicknessPx}
      getSettingsFocusForProvider={() => null}
      onAction={() => {}}
      providerServiceStatuses={state.providerServiceStatuses}
      providerServiceStatusVisibilityBySurface={
        state.settings.providerServiceStatusVisibilityBySurface
      }
      providerAccounts={state.providerAccounts}
      onSelectProviderAccount={() => undefined}
    />,
  );
}

describe("PopupFeaturedProviderList", () => {
  it("defaults to independently collapsible provider cards", () => {
    const html = renderFeaturedList();

    expect(html).toContain(
      'data-popup-provider-browsing-mode="collapsible"',
    );
    expect(html).toContain('data-popup-provider-card-toggle=');
    expect(html).toContain('aria-label="Collapse provider card"');
    expect(html).not.toContain('data-popup-provider-switcher=""');
  });

  it("renders one provider and compact cycling controls in single mode", () => {
    const state: AppState = {
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        popupProviderBrowsingMode: "single",
      },
    };
    const html = renderFeaturedList(
      buildPopupViewModel(state).featuredProviderCards,
      state,
    );

    expect(html).toContain('data-popup-provider-browsing-mode="single"');
    expect(html).toContain('data-popup-provider-switcher=""');
    expect(html).toContain('aria-label="Previous provider"');
    expect(html).toContain('aria-label="Next provider"');
    expect(html.match(/data-popup-hide-provider=/g)).toHaveLength(1);
    expect(html).not.toContain('data-popup-provider-card-toggle=');
  });

  it("preserves the continuous list in scroll mode", () => {
    const state: AppState = {
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        popupProviderBrowsingMode: "scroll",
      },
    };
    const html = renderFeaturedList(
      buildPopupViewModel(state).featuredProviderCards,
      state,
    );

    expect(html).toContain('data-popup-provider-browsing-mode="scroll"');
    expect(html).not.toContain('data-popup-provider-switcher=""');
    expect(html).not.toContain('data-popup-provider-card-toggle=');
    expect(html.match(/data-popup-hide-provider=/g)?.length ?? 0).toBeGreaterThan(
      1,
    );
  });

  it("renders compact API gateway metering instead of generic diagnostics", () => {
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
    const state: AppState = {
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "sub2api-api-key"
          ? { ...provider, apiGatewayMetering: metering, planName: "hze" }
          : provider,
      ),
      providerAccounts: {
        ...SAMPLE_APP_STATE.providerAccounts,
        "sub2api-api-key": {
          activeAccountId: "account_hze12345",
          accounts: [
            {
              id: "account_hze12345",
              label: "hze",
              createdAt: null,
              lastSuccessAt: null,
            },
          ],
          inactiveAccounts: {},
        },
      },
    };
    const [baseCard] = buildPopupViewModel(state).featuredProviderCards;
    const provider = getProviderViewModel(
      state,
      "sub2api-api-key",
    );

    if (!baseCard || !provider) {
      throw new Error("Missing popup card or Sub2API provider fixture.");
    }

    const card = { ...baseCard, provider };

    const html = renderFeaturedList([card], state);
    expect(html).toContain("Usage summary");
    expect(html).toContain("Available balance");
    expect(html).toContain("$18.75");
    expect(html).toContain(
      "api-gateway-metering-deployment--single",
    );
    expect(html).toContain(">hze</span>");
    expect(html).not.toContain("popup-provider-card__plan");
    expect(html).not.toContain(card.primaryDetail);
    expect(html).not.toContain(card.secondaryDetail);
  });

  it("keeps the featured status chip in the provider title row", () => {
    const html = renderFeaturedList();
    const titleRowIndex = html.indexOf("popup-provider-card__title-row");
    const providerNameIndex = html.indexOf("popup-provider-card__provider");
    const actionsIndex = html.indexOf("popup-provider-card__header-actions");
    const statusIndex = html.indexOf("popup-provider-card__status");

    expect(titleRowIndex).toBeGreaterThan(-1);
    expect(providerNameIndex).toBeGreaterThan(titleRowIndex);
    expect(actionsIndex).toBeGreaterThan(providerNameIndex);
    expect(statusIndex).toBeGreaterThan(actionsIndex);
    expect(html).toContain("Details");
    expect(html).toContain("Hide");
    expect(html).toContain('data-popup-featured-status="true"');
    expect(html).toContain("status-chip--compact");
    expect(html).toContain('aria-label="');
  });

  it("links provider names to shipped source pages without relying on browser visited styles", () => {
    const [card] = buildPopupViewModel(SAMPLE_APP_STATE).featuredProviderCards;
    const html = renderFeaturedList([card]);

    expect(html).toContain(
      `data-popup-provider-source-link="${card.provider.providerId}"`,
    );
    expect(html).toContain(`href="${card.provider.openableSessionPageUrl}"`);
    expect(html).toContain(
      `Open source page: ${card.provider.providerLabel}`,
    );
    expect(html).toContain("popup-provider-card__provider-link");
  });

  it("keeps provider names as plain text when no source page can be opened", () => {
    const [card] = buildPopupViewModel(SAMPLE_APP_STATE).featuredProviderCards;
    const html = renderFeaturedList([
      {
        ...card,
        provider: {
          ...card.provider,
          openableSessionPageUrl: null,
        },
      },
    ]);

    expect(html).not.toContain("data-popup-provider-source-link");
    expect(html).not.toContain("popup-provider-card__provider-link");
    expect(html).toContain(card.provider.providerLabel);
  });

  it("keeps the plan below the title row when quota progress is not rendered", () => {
    const [card] = buildPopupViewModel(SAMPLE_APP_STATE).featuredProviderCards;
    const html = renderFeaturedList([
      {
        ...card,
        provider: {
          ...card.provider,
          providerLabel: "Codex Long Provider Name For Wrapping Review",
          used: null,
          remaining: null,
          total: null,
          usageWindows: undefined,
          usageBalances: undefined,
        },
      },
    ]);
    const titleRowIndex = html.indexOf("popup-provider-card__title-row");
    const statusIndex = html.indexOf("popup-provider-card__status");
    const planIndex = html.indexOf("popup-provider-card__plan");

    expect(statusIndex).toBeGreaterThan(titleRowIndex);
    expect(planIndex).toBeGreaterThan(statusIndex);
    expect(html).toContain("Codex Long Provider Name For Wrapping Review");
  });

  it("keeps an explicit Claude Personal plan visible with quota progress", () => {
    const claudeCard = buildPopupViewModel(
      SAMPLE_APP_STATE,
    ).featuredProviderCards.find(
      (card) => card.provider.providerId === "claude-code-team-page",
    );

    if (!claudeCard) {
      throw new Error("Missing Claude Personal popup card fixture.");
    }

    const html = renderFeaturedList([
      {
        ...claudeCard,
        provider: {
          ...claudeCard.provider,
          planName: "Claude Pro (Current session)",
          usageWindows: [
            {
              label: "Current session",
              normalizedLabel: "Current session",
              kind: "rolling_5h",
              modelLabel: null,
              quotaUnit: "percent",
              used: 20,
              remaining: 80,
              total: 100,
              resetAt: "2026-07-21T15:00:00.000Z",
              resetLabel: "Current session resets at 15:00",
            },
          ],
        },
      },
    ]);

    expect(html).toContain("popup-provider-card--quota-first");
    expect(html).toContain("Claude Pro (Current session)");
    expect(html).toContain('class="popup-provider-card__progress');
    expect(html).not.toContain("Shipped personal partial");
  });

  it("suppresses cached progress surfaces while provider host access is missing", () => {
    const [card] = buildPopupViewModel(SAMPLE_APP_STATE).featuredProviderCards;
    const html = renderFeaturedList([
      {
        ...card,
        action: {
          kind: "grant-access",
          label: "Grant access",
          providerId: card.provider.providerId,
        },
        provider: {
          ...card.provider,
          currentSourceStateKind: "host_access_missing",
          permissionStatus: "missing",
          usageWindows: [
            {
              label: "Weekly usage window",
              normalizedLabel: "Weekly usage window",
              kind: "weekly",
              modelLabel: null,
              quotaUnit: "percent",
              used: 59,
              remaining: 41,
              total: 100,
              resetAt: "2026-05-19T09:15:00.000Z",
              resetLabel: "Resets Tuesday",
            },
          ],
        },
      },
    ]);

    expect(html).toContain("Grant access");
    expect(html).not.toContain("popup-provider-card__progress");
    expect(html).not.toContain(">41%<");
  });

  it("does not render duplicate empty history modules before history is captured", () => {
    const codexCard = buildPopupViewModel(
      SAMPLE_APP_STATE,
    ).featuredProviderCards.find(
      (card) => card.provider.providerId === "codex-personal-page",
    );

    if (!codexCard) {
      throw new Error("Missing Codex popup card fixture.");
    }

    const html = renderFeaturedList([
      {
        ...codexCard,
        provider: { ...codexCard.provider, usageHistory: undefined },
      },
    ]);

    expect(html).not.toContain("usage-history-compact");
    expect(html).not.toContain("No history data yet");
  });

  it("keeps the default-off service status unmounted until popup visibility is enabled", () => {
    const status = {
      vendorId: "openai" as const,
      brandId: "codex" as const,
      level: "degraded" as const,
      description: "Elevated errors",
      statusPageUrl: "https://status.openai.com",
      checkedAt: "2026-07-25T06:00:00.000Z",
      sourceUpdatedAt: null,
      retryAt: null,
      stale: false,
      failureReason: null,
      components: [],
      incidents: [],
    };
    const enabledState = {
      ...SAMPLE_APP_STATE,
      providerServiceStatuses: [status],
      settings: {
        ...SAMPLE_APP_STATE.settings,
        providerServiceStatusVisibilityBySurface: {
          ...SAMPLE_APP_STATE.settings
            .providerServiceStatusVisibilityBySurface,
          popup: {
            ...SAMPLE_APP_STATE.settings
              .providerServiceStatusVisibilityBySurface.popup,
            codex: true,
          },
        },
      },
    };
    const cards = buildPopupViewModel(enabledState).featuredProviderCards;

    expect(renderFeaturedList()).not.toContain("data-provider-service-status=");
    expect(renderFeaturedList(cards, enabledState)).toContain(
      'data-provider-service-status="openai"',
    );
  });

  it("groups adjacent history modules without provider-card grid gaps", () => {
    const baseCard = buildPopupViewModel(
      SAMPLE_APP_STATE,
    ).featuredProviderCards.find(
      (candidate) => candidate.provider.providerId === "codex-personal-page",
    );

    if (!baseCard) {
      throw new Error("Missing Codex popup card fixture.");
    }

    const html = renderFeaturedList([
      {
        ...baseCard,
        provider: {
          ...baseCard.provider,
          usageHistory: {
            capturedAt: "2026-07-13T00:00:00.000Z",
            rangeStart: "2026-07-12",
            rangeEnd: "2026-07-13",
            granularity: "day",
            personalUsageBySurface: {
              unit: "percent",
              points: [
                {
                  date: "2026-07-13",
                  values: [
                    {
                      id: "desktop",
                      label: "Desktop",
                      value: 50,
                    },
                  ],
                },
              ],
            },
            turns: {
              total: 7,
              byModel: [
                {
                  date: "2026-07-13",
                  values: [{ id: "gpt", label: "GPT", value: 7 }],
                },
              ],
              bySurface: [],
            },
          },
        },
      },
    ]);

    expect(html).toContain('class="popup-provider-card__history"');
    expect(html).toContain("usage-history-compact");
    expect(html.match(/data-usage-history-range-days="31"/g)).toHaveLength(2);
  });

  it("keeps cached quota content neutral and presents a failed refresh as a warning", () => {
    const card = buildPopupViewModel(SAMPLE_APP_STATE).featuredProviderCards.find(
      (candidate) => candidate.provider.providerId === "codex-personal-page",
    );

    if (!card) {
      throw new Error("Missing Codex popup card fixture.");
    }

    const html = renderFeaturedList([
      {
        ...card,
        provider: {
          ...card.provider,
          displayTone: "error",
          syncStatus: "error",
        },
      },
    ]);

    expect(html).toContain(
      "popup-provider-card popup-provider-card--neutral popup-provider-card--quota-first",
    );
    expect(html).toContain("status-chip--warning");
    expect(html).not.toContain("status-chip--error");
  });

  it("aligns provider identity, compact actions, and status on a stable header grid", () => {
    expect(popupThemeCss).toContain(".popup-provider-card__title-row {");
    expect(popupThemeCss).toContain(
      "grid-template-columns: minmax(0, 1fr) auto auto;",
    );
    expect(popupThemeCss).toContain("min-height: 30px;");
    expect(popupThemeCss).toContain(".popup-provider-card__header-actions {");
    expect(popupThemeCss).toContain("flex-wrap: nowrap;");
    expect(popupThemeCss).toContain("justify-self: end;");
    expect(popupThemeCss).toContain("max-inline-size: 100%;");
    expect(popupThemeCss).toContain(".popup-provider-card__header-action {");
    expect(popupThemeCss).toContain("height: 30px;");
    expect(popupThemeCss).toContain("max-width: none;");
    expect(popupThemeCss).toContain("overflow: visible;");
    expect(popupThemeCss).toContain("white-space: nowrap;");
    expect(popupThemeCss).not.toContain("max-width: 7rem;");
    expect(popupThemeCss).toContain(".popup-provider-card__history {");
    expect(popupThemeCss).not.toContain(
      ".popup-provider-card__header-actions {\n    grid-column: 1;",
    );
    expect(popupThemeCss).toContain(".popup-provider-card__collapse-toggle {");
    expect(popupThemeCss).toContain(".popup-provider-switcher {");
    expect(popupThemeCss).toContain(
      "grid-template-columns: 34px minmax(0, 1fr) 34px;",
    );
  });
});
