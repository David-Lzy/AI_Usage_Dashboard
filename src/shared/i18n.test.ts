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
});
