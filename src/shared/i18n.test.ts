import { describe, expect, it } from "vitest";

import {
  buildSettingsSummaryLabels,
  createRuntimeI18n,
  getQuickThemeToggleCopy,
  normalizeAppLocalePreference,
  resolveAppLocale,
} from "./i18n";
import {
  buildPopupLocalizedCopy,
  buildProviderDetailLocalizedCopy,
  buildSettingsLocalizedCopy,
} from "./localized-copy";

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

  it("returns translated settings-shell labels for the first settings runtime slice", () => {
    const i18n = createRuntimeI18n("zh-CN");

    expect(i18n.t("settings.topbar.title")).toBe("设置");
    expect(i18n.t("common.actions.save")).toBe("保存");
    expect(buildSettingsSummaryLabels(i18n)).toEqual({
      visible: "可见",
      storedSecrets: "已存密钥",
      boundPages: "已绑定页面",
      needsAccess: "需授权",
    });
  });


  it("returns zh-CN structured popup and provider-detail copy builders", () => {
    const i18n = createRuntimeI18n("zh-CN");
    const popupCopy = buildPopupLocalizedCopy(i18n);
    const providerDetailCopy = buildProviderDetailLocalizedCopy(i18n);

    expect(popupCopy.actionSection.otherRouteLabel).toBe("其他入口");
    expect(popupCopy.featuredCard.statusNeedsAccess).toBe("需授权");
    expect(providerDetailCopy.sections.providerDetail).toBe("Provider 详情");
    expect(providerDetailCopy.notes.accessStatus).toBe("访问状态");
  });

  it("returns zh-CN structured settings helper copy builders", () => {
    const i18n = createRuntimeI18n("zh-CN");
    const settingsCopy = buildSettingsLocalizedCopy(i18n);

    expect(settingsCopy.themeCustomization.enterValidSeed).toContain(
      "输入有效的 #RRGGBB 值",
    );
    expect(settingsCopy.credentials.saveKey).toBe("保存密钥");
    expect(settingsCopy.sources.preferenceLabel).toBe("偏好");
    expect(settingsCopy.permissions.requestAccess).toBe("请求授权");
  });

});
