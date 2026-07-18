import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/constants";
import { createRuntimeI18n } from "../../shared/i18n";
import {
  POPUP_APPEARANCE_PREVIEW_DEFAULT_REMAINING_PERCENT,
  ToolbarPopupPreview,
  clampToolbarPopupPreviewPosition,
} from "./ToolbarPopupPreview";

describe("ToolbarPopupPreview", () => {
  it("renders the current popup appearance attributes and localized sample", () => {
    const i18n = createRuntimeI18n("en", undefined);
    const html = renderToStaticMarkup(
      <ToolbarPopupPreview
        i18n={i18n}
        placement="inline"
        previewRemainingPercent={
          POPUP_APPEARANCE_PREVIEW_DEFAULT_REMAINING_PERCENT
        }
        settings={{
          ...SAMPLE_APP_STATE.settings,
          popupCornerStyle: "rounded",
          popupProgressStyle: "circle-soft",
          popupShadowStyle: "elevated",
          popupSizePreset: "wide",
        }}
        onPreviewRemainingPercentChange={() => {}}
      />,
    );

    expect(html).toContain("popup-appearance-preview-card");
    expect(html).toContain('data-toolbar-popup-preview="inline"');
    expect(html).toContain('data-popup-size-preset="wide"');
    expect(html).toContain('data-popup-corner-style="rounded"');
    expect(html).toContain('data-popup-shadow-style="elevated"');
    expect(html).toContain('data-popup-progress-style="circle-soft"');
    expect(html).toContain("usage-progress-ring--circle-soft");
    expect(html).toContain("Toolbar popup preview");
    expect(html).toContain("Preview remaining");
    expect(html).toContain('value="51"');
    expect(html).toContain(
      '<span class="usage-progress__label-name">Weekly limit</span>',
    );
    expect(html).toContain('class="usage-progress__label-reset"');
    expect(html).not.toContain("popup-appearance-preview-actions");
    expect(html).not.toContain("Quick glance");
    expect(html).not.toContain("14:59");
  });

  it("renders the zh-CN pilot preview copy through runtime i18n", () => {
    const i18n = createRuntimeI18n("zh-CN", undefined);
    const html = renderToStaticMarkup(
      <ToolbarPopupPreview
        i18n={i18n}
        placement="inline"
        previewRemainingPercent={74}
        settings={SAMPLE_APP_STATE.settings}
        onPreviewRemainingPercentChange={() => {}}
      />,
    );

    expect(html).toContain("工具栏弹窗预览");
    expect(html).toContain("预览剩余额度");
    expect(html).toContain(
      '<span class="usage-progress__label-name">每周限额</span>',
    );
    expect(html).toContain("重置");
    expect(html).toContain(
      'aria-valuetext="每周限额: 74% 剩余"',
    );
    expect(html).not.toContain("快速概览");
  });

  it("renders the selected gauge progress style in the preview", () => {
    const i18n = createRuntimeI18n("en", undefined);
    const html = renderToStaticMarkup(
      <ToolbarPopupPreview
        i18n={i18n}
        placement="inline"
        previewRemainingPercent={
          POPUP_APPEARANCE_PREVIEW_DEFAULT_REMAINING_PERCENT
        }
        settings={{
          ...SAMPLE_APP_STATE.settings,
          popupProgressStyle: "circle-gauge",
        }}
        onPreviewRemainingPercentChange={() => {}}
      />,
    );

    expect(html).toContain('data-popup-progress-style="circle-gauge"');
    expect(html).toContain("usage-progress-ring--circle-gauge");
  });

  it("renders the draggable floating shell with the same remaining control", () => {
    const i18n = createRuntimeI18n("en", undefined);
    const html = renderToStaticMarkup(
      <ToolbarPopupPreview
        i18n={i18n}
        placement="floating"
        previewRemainingPercent={63}
        settings={SAMPLE_APP_STATE.settings}
        onPreviewRemainingPercentChange={() => {}}
        onClose={() => {}}
      />,
    );

    expect(html).toContain('data-toolbar-popup-preview="floating"');
    expect(html).toContain("toolbar-popup-preview__bar");
    expect(html).toContain("Drag toolbar popup preview");
    expect(html).toContain("Close toolbar popup preview");
    expect(html).toContain("Preview remaining");
    expect(html).toContain('value="63"');
    expect(html).toContain("left:");
    expect(html).toContain("top:");
    expect(html).not.toContain("translate3d");
  });

  it("clamps floating preview coordinates inside the viewport", () => {
    expect(
      clampToolbarPopupPreviewPosition(
        { left: -100, top: 999 },
        { width: 800, height: 600 },
        { width: 360, height: 220 },
      ),
    ).toEqual({
      left: 16,
      top: 364,
    });

    expect(
      clampToolbarPopupPreviewPosition(
        { left: 480, top: 180 },
        { width: 800, height: 600 },
        { width: 360, height: 220 },
      ),
    ).toEqual({
      left: 424,
      top: 180,
    });
  });
});
