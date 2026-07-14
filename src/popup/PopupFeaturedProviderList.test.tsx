import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createRuntimeI18n } from "../shared/i18n";
import { SAMPLE_APP_STATE } from "../shared/constants";
import { buildPopupViewModel } from "./view-models";
import { PopupFeaturedProviderList } from "./PopupFeaturedProviderList";

const popupThemeCss = readFileSync(
  new URL("./popup-theme.css", import.meta.url),
  "utf8",
);

function renderFeaturedList(
  cards = buildPopupViewModel(SAMPLE_APP_STATE).featuredProviderCards,
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
      progressDisplayStyle={SAMPLE_APP_STATE.settings.popupProgressStyle}
      progressItemsBySurface={SAMPLE_APP_STATE.settings.progressItemsBySurface}
      progressThicknessPx={SAMPLE_APP_STATE.settings.progressThicknessPx}
      getSettingsFocusForProvider={() => null}
      onAction={() => {}}
    />,
  );
}

describe("PopupFeaturedProviderList", () => {
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
  });
});
