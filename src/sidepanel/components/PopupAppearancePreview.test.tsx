import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/constants";
import { createRuntimeI18n } from "../../shared/i18n";
import { PopupAppearancePreview } from "./PopupAppearancePreview";

describe("PopupAppearancePreview", () => {
  it("renders the current popup appearance attributes and localized sample", () => {
    const i18n = createRuntimeI18n("en", undefined);
    const html = renderToStaticMarkup(
      <PopupAppearancePreview
        i18n={i18n}
        settings={{
          ...SAMPLE_APP_STATE.settings,
          popupCornerStyle: "rounded",
          popupProgressStyle: "circle-soft",
          popupShadowStyle: "elevated",
          popupSizePreset: "wide",
        }}
      />,
    );

    expect(html).toContain('class="popup-appearance-preview-card"');
    expect(html).toContain('data-popup-size-preset="wide"');
    expect(html).toContain('data-popup-corner-style="rounded"');
    expect(html).toContain('data-popup-shadow-style="elevated"');
    expect(html).toContain('data-popup-progress-style="circle-soft"');
    expect(html).toContain("usage-progress-ring--circle-soft");
    expect(html).toContain("Toolbar bubble shape");
    expect(html).toContain("week, reset: Tue 09:15");
    expect(html).not.toContain("popup-appearance-preview-actions");
    expect(html).not.toContain("14:59");
  });

  it("renders the zh-CN pilot preview copy through runtime i18n", () => {
    const i18n = createRuntimeI18n("zh-CN", undefined);
    const html = renderToStaticMarkup(
      <PopupAppearancePreview
        i18n={i18n}
        settings={SAMPLE_APP_STATE.settings}
      />,
    );

    expect(html).toContain("工具栏弹窗形态");
    expect(html).toContain("周额度，重置：周二 09:15");
    expect(html).toContain(
      'aria-valuetext="周额度，重置：周二 09:15: 51% 剩余"',
    );
  });

  it("renders the selected gauge progress style in the preview", () => {
    const i18n = createRuntimeI18n("en", undefined);
    const html = renderToStaticMarkup(
      <PopupAppearancePreview
        i18n={i18n}
        settings={{
          ...SAMPLE_APP_STATE.settings,
          popupProgressStyle: "circle-gauge",
        }}
      />,
    );

    expect(html).toContain('data-popup-progress-style="circle-gauge"');
    expect(html).toContain("usage-progress-ring--circle-gauge");
  });
});
