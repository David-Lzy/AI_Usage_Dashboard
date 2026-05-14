import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createRuntimeI18n } from "../shared/i18n";
import { SAMPLE_APP_STATE } from "../shared/constants";
import { buildPopupViewModel } from "./view-models";
import { PopupFeaturedProviderList } from "./PopupFeaturedProviderList";

function renderFeaturedList(
  cards = buildPopupViewModel(SAMPLE_APP_STATE).featuredProviderCards,
) {
  return renderToStaticMarkup(
    <PopupFeaturedProviderList
      ariaLabel="Featured providers"
      cards={cards}
      i18n={createRuntimeI18n("en")}
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
    const statusIndex = html.indexOf("popup-provider-card__status");

    expect(titleRowIndex).toBeGreaterThan(-1);
    expect(providerNameIndex).toBeGreaterThan(titleRowIndex);
    expect(statusIndex).toBeGreaterThan(providerNameIndex);
    expect(html).toContain('data-popup-featured-status="true"');
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
});
