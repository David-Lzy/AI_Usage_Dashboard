import { describe, expect, it } from "vitest";

import {
  createRuntimeI18n,
  getQuickThemeToggleCopy,
  normalizeAppLocalePreference,
  resolveAppLocale,
} from "./i18n";

describe("runtime i18n", () => {
  it("normalizes unknown locale preferences back to system", () => {
    expect(normalizeAppLocalePreference("fr")).toBe("system");
    expect(normalizeAppLocalePreference("zh-CN")).toBe("zh-CN");
  });

  it("resolves system locale to zh-CN when the browser locale is Chinese", () => {
    expect(
      resolveAppLocale("system", {
        navigator: { language: "zh-TW" },
      }),
    ).toBe("zh-CN");
  });

  it("returns translated runtime strings for the first zh-CN shell slice", () => {
    const i18n = createRuntimeI18n("zh-CN");

    expect(i18n.t("dashboard.hero.title")).toBe("一个面板掌握 AI 编码配额");
    expect(i18n.t("popup.header.title")).toBe("快速概览");
  });

  it("localizes quick theme toggle copy from the next explicit mode", () => {
    const i18n = createRuntimeI18n("zh-CN");

    expect(getQuickThemeToggleCopy("dark", i18n)).toEqual({
      label: "夜间",
      title: "切换到夜间模式",
    });
    expect(getQuickThemeToggleCopy("light", i18n)).toEqual({
      label: "白天",
      title: "切换到白天模式",
    });
  });


  it("formats percentages and parseable temporal primitives per locale", () => {
    const i18n = createRuntimeI18n("zh-CN");

    expect(i18n.formatPercentValue(62)).toBe("62%");
    expect(i18n.formatTemporalValue("2026-04-26 09:00")).not.toBe(
      "2026-04-26 09:00",
    );
    expect(i18n.formatTemporalValue("2026-04-26 09:00")).toContain("2026");
  });

  it("preserves explicit UTC markers and rejects non-parseable temporal strings", () => {
    const i18n = createRuntimeI18n("en");
    const formattedUtc = i18n.formatTemporalValue("2026-04-20 UTC");

    expect(formattedUtc).toContain("2026");
    expect(formattedUtc?.endsWith("UTC")).toBe(true);
    expect(i18n.formatTemporalValue("Current billing period")).toBeNull();
  });
});
