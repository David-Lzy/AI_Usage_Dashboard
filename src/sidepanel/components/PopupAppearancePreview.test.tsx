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
          popupShadowStyle: "elevated",
          popupSizePreset: "wide",
        }}
      />,
    );

    expect(html).toContain('class="popup-appearance-preview-card"');
    expect(html).toContain('data-popup-size-preset="wide"');
    expect(html).toContain('data-popup-corner-style="rounded"');
    expect(html).toContain('data-popup-shadow-style="elevated"');
    expect(html).toContain("Toolbar bubble shape");
    expect(html).toContain("Weekly usage window");
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
    expect(html).toContain("每周使用窗口");
  });
});
