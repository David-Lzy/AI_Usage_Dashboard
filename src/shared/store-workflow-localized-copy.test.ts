import { describe, expect, it } from "vitest";

import { SUPPORTED_APP_LOCALES, createRuntimeI18n } from "./i18n";
import { buildStoreWorkflowLocalizedCopy as buildReexportedCopy } from "./localized-copy";
import { buildStoreWorkflowLocalizedCopy } from "./store-workflow-localized-copy";

describe("buildStoreWorkflowLocalizedCopy", () => {
  it("builds English store screenshot seed copy", () => {
    const copy = buildStoreWorkflowLocalizedCopy(createRuntimeI18n("en"));

    expect(copy.screenshotSeed.sectionLabel).toBe(
      "Store Screenshot Debug Route",
    );
    expect(copy.screenshotSeed.presetHeadline("unlock", "Fallback")).toBe(
      "Screenshot seed lock cleared",
    );
    expect(copy.nativePopupProbe.openingTitle).toBe(
      "Opening native toolbar popup",
    );
  });

  it("builds Simplified Chinese store workflow copy", () => {
    const copy = buildStoreWorkflowLocalizedCopy(createRuntimeI18n("zh-CN"));

    expect(copy.screenshotSeed.sectionLabel).toBe("Store Screenshot 调试路由");
    expect(copy.screenshotSeed.presetDetail("missing", "回退")).toBe("回退");
    expect(copy.nativePopupProbe.requestedTitle).toBe("已请求原生 popup");
  });

  it("builds explicit store workflow copy for every shipped locale", () => {
    const expectedSectionLabels = {
      en: "Store Screenshot Debug Route",
      "zh-CN": "Store Screenshot 调试路由",
      "zh-TW": "Store Screenshot 除錯路由",
      ja: "Store Screenshot デバッグ route",
      ko: "Store Screenshot 디버그 route",
      "es-419": "Ruta de depuración de Store Screenshot",
      "pt-BR": "Rota de depuração de Store Screenshot",
      fr: "Route de débogage Store Screenshot",
      de: "Store-Screenshot-Debug-Route",
      it: "Route debug Store Screenshot",
      ru: "Отладочный route Store Screenshot",
      ar: "Route تصحيح Store Screenshot",
      hi: "Store Screenshot debug रूट",
      id: "Route debug Store Screenshot",
    } as const;

    for (const locale of SUPPORTED_APP_LOCALES) {
      const copy = buildStoreWorkflowLocalizedCopy(createRuntimeI18n(locale));

      expect(copy.screenshotSeed.sectionLabel).toBe(
        expectedSectionLabels[locale],
      );
      expect(
        copy.screenshotSeed.presetHeadline(
          "toolbar-first-quick-glance",
          "Fallback",
        ),
      ).not.toBe("Fallback");
      expect(
        copy.screenshotSeed.submissionCaption(
          "toolbar-first-quick-glance",
        ).length,
      ).toBeGreaterThan(0);
      expect(copy.nativePopupProbe.sectionLabel).toBe(
        expectedSectionLabels[locale],
      );
    }
  });

  it("uses explicit Arabic copy and preserves preset identity interpolation", () => {
    const copy = buildStoreWorkflowLocalizedCopy(createRuntimeI18n("ar"));

    expect(copy.screenshotSeed.applyingTitle).toBe(
      "جار تطبيق preset لقطة الشاشة",
    );
    expect(copy.screenshotSeed.applyingDetail("setup-guidance")).toContain(
      "`setup-guidance`",
    );
    expect(copy.nativePopupProbe.openingTitle).toBe(
      "جار فتح native toolbar popup",
    );
  });

  it("preserves unknown preset fallbacks and empty unsupported captions", () => {
    const copy = buildStoreWorkflowLocalizedCopy(createRuntimeI18n("ja"));

    expect(copy.screenshotSeed.presetHeadline("missing", "Fallback")).toBe(
      "Fallback",
    );
    expect(copy.screenshotSeed.presetDetail("missing", "Fallback detail")).toBe(
      "Fallback detail",
    );
    expect(copy.screenshotSeed.submissionCaption("missing")).toBe("");
    expect(copy.screenshotSeed.submissionCaption("unlock")).toBe("");
  });

  it("preserves the legacy localized-copy export path", () => {
    const copy = buildReexportedCopy(createRuntimeI18n("en"));

    expect(copy.nativePopupProbe.didNotOpenTitle).toBe(
      "Native popup did not open",
    );
  });
});
