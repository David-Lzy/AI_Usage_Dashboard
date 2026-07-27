import { describe, expect, it } from "vitest";

import {
  createAdapterErrorDiagnostic,
  createPageSessionDiagnostic,
  createSourceFallbackDiagnostic,
  createSourceSelectionDiagnostic,
  createUsageThresholdDiagnostic,
} from "../providers/diagnostics";
import type { ProviderDiagnostic } from "../providers/types";
import {
  APP_LOCALE_METADATA,
  SUPPORTED_APP_LOCALES,
  buildSettingsSummaryLabels,
  createRuntimeI18n,
  getRuntimeMessageCatalog,
  getQuickThemeToggleCopy,
  normalizeAppLocalePreference,
  resolveAppLocale,
  resolveAppTextDirection,
  syncRuntimeLocaleAttributes,
} from "./i18n";
import type { RuntimeMessageId } from "./i18n";
import {
  buildOperatorWorkspaceLocalizedCopy,
  buildPopupLocalizedCopy,
  buildProviderDetailLocalizedCopy,
  buildProviderSourceDisplayLocalizedCopy,
  buildSettingsLocalizedCopy,
  buildStoreWorkflowLocalizedCopy,
  getProviderDiagnosticPresentation,
} from "./localized-copy";
import {
  getRuntimeMessageFallbackIds,
  getRuntimeMessageOverrideIds,
} from "./runtime-message-catalogs";

describe("runtime i18n", () => {
  it("normalizes unknown locale preferences back to system", () => {
    expect(normalizeAppLocalePreference("xx")).toBe("system");
    expect(normalizeAppLocalePreference("zh-CN")).toBe("zh-CN");
  });

  it("accepts every shipped explicit locale preference", () => {
    for (const locale of SUPPORTED_APP_LOCALES) {
      expect(normalizeAppLocalePreference(locale)).toBe(locale);
    }
  });

  it("resolves system browser languages to shipped locale tags", () => {
    expect(resolveAppLocale("system", { navigator: { language: "zh-CN" } })).toBe(
      "zh-CN",
    );
    expect(resolveAppLocale("system", { navigator: { language: "zh-TW" } })).toBe(
      "zh-TW",
    );
    expect(resolveAppLocale("system", { navigator: { language: "pt-BR" } })).toBe(
      "pt-BR",
    );
    expect(resolveAppLocale("system", { navigator: { language: "es-MX" } })).toBe(
      "es-419",
    );
    expect(resolveAppLocale("system", { navigator: { language: "ar" } })).toBe(
      "ar",
    );
    expect(resolveAppLocale("system", { navigator: { language: "ja-JP" } })).toBe(
      "ja",
    );
  });

  it("resolves text direction from locale metadata and honors preview overrides", () => {
    expect(resolveAppTextDirection("ar")).toBe("rtl");
    for (const locale of SUPPORTED_APP_LOCALES.filter((locale) => locale !== "ar")) {
      expect(resolveAppTextDirection(locale)).toBe("ltr");
    }
    expect(
      createRuntimeI18n("en", { location: { search: "?app-dir=rtl" } })
        .resolvedTextDirection,
    ).toBe("rtl");
  });

  it("honors explicit locale preview overrides without changing the saved preference", () => {
    const i18n = createRuntimeI18n("en", {
      location: { search: "?surface=full-page&app-locale=ar" },
    });

    expect(i18n.localePreference).toBe("en");
    expect(i18n.resolvedLocale).toBe("ar");
    expect(i18n.resolvedTextDirection).toBe("rtl");
  });

  it("syncs runtime lang and dir attributes onto document roots", () => {
    const i18n = createRuntimeI18n("ar");
    const root = {
      lang: "",
      dir: "",
      dataset: {} as Record<string, string | undefined>,
    };
    const body = {
      lang: "",
      dir: "",
      dataset: {} as Record<string, string | undefined>,
    };

    syncRuntimeLocaleAttributes(i18n, root, body);

    expect(root).toMatchObject({
      lang: "ar",
      dir: "rtl",
      dataset: {
        appLocale: "ar",
        appDirection: "rtl",
        appLocaleFallbackCount: "0",
      },
    });
    expect(body).toMatchObject({
      lang: "ar",
      dir: "rtl",
      dataset: {
        appLocale: "ar",
        appDirection: "rtl",
        appLocaleFallbackCount: "0",
      },
    });
  });

  it("exposes runtime fallback counts for semantic visual checks", () => {
    for (const locale of SUPPORTED_APP_LOCALES) {
      expect(getRuntimeMessageFallbackIds(locale)).toEqual([]);
      expect(createRuntimeI18n(locale).fallbackMessageIds).toEqual([]);
    }
  });

  it("ships complete runtime catalogs for every supported locale", () => {
    const englishKeys = Object.keys(getRuntimeMessageCatalog("en")).sort();

    expect(SUPPORTED_APP_LOCALES).toHaveLength(14);
    for (const locale of SUPPORTED_APP_LOCALES) {
      expect(APP_LOCALE_METADATA[locale].locale).toBe(locale);
      expect(Object.keys(getRuntimeMessageCatalog(locale)).sort()).toEqual(
        englishKeys,
      );
    }
  });

  it("keeps runtime overrides explicit for every non-English locale", () => {
    const runtimeMessageIds = Object.keys(
      getRuntimeMessageCatalog("en"),
    ) as RuntimeMessageId[];

    for (const locale of SUPPORTED_APP_LOCALES.filter((locale) => locale !== "en")) {
      const overrideIds = new Set(getRuntimeMessageOverrideIds(locale));

      for (const messageId of runtimeMessageIds) {
        expect(overrideIds.has(messageId), `${locale} missing ${messageId}`).toBe(
          true,
        );
      }
    }
  });

  it("returns translated runtime strings for the first zh-CN shell slice", () => {
    const i18n = createRuntimeI18n("zh-CN");

    expect(i18n.t("dashboard.hero.title")).toBe("AI 编码额度概览");
    expect(i18n.t("popup.header.title")).toBe("快速概览");
  });

  it("returns translated runtime strings for the first zh-TW shell slice", () => {
    const i18n = createRuntimeI18n("zh-TW");

    expect(i18n.t("dashboard.hero.title")).toBe("AI 編碼額度概覽");
    expect(i18n.t("popup.header.title")).toBe("快速概覽");
    expect(i18n.t("settings.topbar.title")).toBe("設定");
    expect(i18n.t("settings.preferences.locale.system")).toBe("跟隨系統");
  });

  it("returns translated runtime strings for the first ja shell slice", () => {
    const i18n = createRuntimeI18n("ja");

    expect(i18n.t("dashboard.hero.title")).toBe(
      "AI コーディングクォータ概要",
    );
    expect(i18n.t("popup.header.title")).toBe("クイック確認");
    expect(i18n.t("settings.topbar.title")).toBe("設定");
    expect(i18n.t("settings.preferences.locale.system")).toBe("システムに従う");
  });

  it("returns translated runtime strings for the first ko shell slice", () => {
    const i18n = createRuntimeI18n("ko");

    expect(i18n.t("dashboard.hero.title")).toBe(
      "AI 코딩 할당량 개요",
    );
    expect(i18n.t("popup.header.title")).toBe("빠른 보기");
    expect(i18n.t("settings.topbar.title")).toBe("설정");
    expect(i18n.t("settings.preferences.locale.system")).toBe("시스템 따름");
  });

  it("returns translated runtime strings for the first es-419 shell slice", () => {
    const i18n = createRuntimeI18n("es-419");

    expect(i18n.t("dashboard.hero.title")).toBe(
      "Resumen de cuotas de codificación con IA",
    );
    expect(i18n.t("popup.header.title")).toBe("Vista rápida");
    expect(i18n.t("settings.topbar.title")).toBe("Configuración");
    expect(i18n.t("settings.preferences.locale.system")).toBe("Seguir sistema");
  });

  it("returns translated runtime strings for the first pt-BR shell slice", () => {
    const i18n = createRuntimeI18n("pt-BR");

    expect(i18n.t("dashboard.hero.title")).toBe(
      "Visão geral das cotas de codificação com IA",
    );
    expect(i18n.t("popup.header.title")).toBe("Vista rápida");
    expect(i18n.t("settings.topbar.title")).toBe("Configurações");
    expect(i18n.t("settings.preferences.locale.system")).toBe("Seguir sistema");
  });

  it("returns translated runtime strings for the first fr shell slice", () => {
    const i18n = createRuntimeI18n("fr");

    expect(i18n.t("dashboard.hero.title")).toBe(
      "Aperçu des quotas de codage IA",
    );
    expect(i18n.t("popup.header.title")).toBe("Coup d'oeil rapide");
    expect(i18n.t("settings.topbar.title")).toBe("Paramètres");
    expect(i18n.t("settings.preferences.locale.system")).toBe("Suivre le système");
  });

  it("returns translated runtime strings for the first de shell slice", () => {
    const i18n = createRuntimeI18n("de");

    expect(i18n.t("dashboard.hero.title")).toBe(
      "Überblick über KI-Coding-Kontingente",
    );
    expect(i18n.t("popup.header.title")).toBe("Schnellüberblick");
    expect(i18n.t("settings.topbar.title")).toBe("Einstellungen");
    expect(i18n.t("settings.preferences.locale.system")).toBe("System folgen");
  });

  it("returns translated runtime strings for the first it shell slice", () => {
    const i18n = createRuntimeI18n("it");

    expect(i18n.t("dashboard.hero.title")).toBe(
      "Panoramica delle quote di coding IA",
    );
    expect(i18n.t("popup.header.title")).toBe("Vista rapida");
    expect(i18n.t("settings.topbar.title")).toBe("Impostazioni");
    expect(i18n.t("settings.preferences.locale.system")).toBe("Segui sistema");
  });

  it("returns translated runtime strings for the first ru shell slice", () => {
    const i18n = createRuntimeI18n("ru");

    expect(i18n.t("dashboard.hero.title")).toBe(
      "Обзор квот AI coding",
    );
    expect(i18n.t("popup.header.title")).toBe("Быстрый обзор");
    expect(i18n.t("settings.topbar.title")).toBe("Настройки");
    expect(i18n.t("settings.preferences.locale.system")).toBe("Как в системе");
  });

  it("returns translated runtime strings for the first ar shell slice", () => {
    const i18n = createRuntimeI18n("ar");

    expect(i18n.t("dashboard.hero.title")).toBe(
      "نظرة عامة على حصص AI coding",
    );
    expect(i18n.t("popup.header.title")).toBe("نظرة سريعة");
    expect(i18n.t("settings.topbar.title")).toBe("الإعدادات");
    expect(i18n.t("settings.preferences.locale.system")).toBe("اتباع النظام");
    expect(i18n.resolvedTextDirection).toBe("rtl");
  });

  it("returns translated runtime strings for the first hi shell slice", () => {
    const i18n = createRuntimeI18n("hi");

    expect(i18n.t("dashboard.hero.title")).toBe(
      "AI coding quotas का अवलोकन",
    );
    expect(i18n.t("popup.header.title")).toBe("त्वरित झलक");
    expect(i18n.t("settings.topbar.title")).toBe("सेटिंग्स");
    expect(i18n.t("settings.preferences.locale.system")).toBe(
      "सिस्टम का अनुसरण करें",
    );
    expect(i18n.resolvedTextDirection).toBe("ltr");
  });

  it("returns translated runtime strings for the first id shell slice", () => {
    const i18n = createRuntimeI18n("id");

    expect(i18n.t("dashboard.hero.title")).toBe(
      "Ringkasan kuota AI coding",
    );
    expect(i18n.t("popup.header.title")).toBe("Ringkasan cepat");
    expect(i18n.t("settings.topbar.title")).toBe("Pengaturan");
    expect(i18n.t("settings.preferences.locale.system")).toBe("Ikuti sistem");
    expect(i18n.resolvedTextDirection).toBe("ltr");
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
    expect(getQuickThemeToggleCopy("system", i18n)).toEqual({
      label: "系统",
      title: "切换到跟随系统",
    });
    expect(getQuickThemeToggleCopy("time", i18n)).toEqual({
      label: "按时间",
      title: "切换到根据当地时间自动调整",
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
    expect(popupCopy.featuredCard.statusReloadPage).toBe("重新加载");
    expect(popupCopy.featuredCard.primaryPageUnreadable).toBe(
      "当前页面会话已经打开，但扩展无法读取。",
    );
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

  it("returns zh-CN provider-source display wrapper copy", () => {
    const providerSourceCopy = buildProviderSourceDisplayLocalizedCopy(
      createRuntimeI18n("zh-CN"),
    );

    expect(providerSourceCopy.sourceKindLabels.session_page).toBe("会话页面");
    expect(providerSourceCopy.sourceState.captureUnavailableLabel).toBe(
      "页面捕获不可用",
    );
    expect(providerSourceCopy.fieldAvailabilityLabels.window_only).toBe("仅窗口");
    expect(providerSourceCopy.connectionMode.credential.label).toBe("已存凭据");
    expect(
      providerSourceCopy.availabilitySummary("分析", "不可用", "仅窗口"),
    ).toBe("已用：分析 · 剩余：不可用 · 重置：仅窗口");
  });

  it("builds localized diagnostic presentation from typed codes and params", () => {
    const diagnostic = createUsageThresholdDiagnostic({
      providerId: "codex-personal-page",
      usageThresholdKind: "threshold_warning",
      rawMessage: "5-hour usage window: 7% remaining",
      usagePercent: 93,
      thresholdPercent: 80,
      unitLabel: "percent",
    });

    expect(getProviderDiagnosticPresentation(diagnostic, createRuntimeI18n("en"))).toEqual({
      label: "Usage threshold",
      summary: "Usage is at 93%, reaching the 80% warning threshold.",
    });
    expect(
      getProviderDiagnosticPresentation(diagnostic, createRuntimeI18n("zh-CN")),
    ).toEqual({
      label: "用量阈值",
      summary: "当前用量 93%，已达到 80% 告警阈值。",
    });
  });

  it("builds localized source diagnostic presentation from typed codes and params", () => {
    const selectionDiagnostic = createSourceSelectionDiagnostic({
      providerId: "cursor-personal-page",
      sourcePreference: "auto",
      selectedKind: "session_page",
      hadFallback: true,
      rawMessage: "Auto fell back to Session page.",
    });
    const fallbackDiagnostic = createSourceFallbackDiagnostic({
      providerId: "cursor-personal-page",
      sourcePreference: "auto",
      failure: {
        kind: "official_api",
        code: "credential_missing",
        detail: "No Cursor Admin API key is stored.",
      },
      rawMessage: "Official API unavailable: no Cursor Admin API key is stored.",
    });

    expect(selectionDiagnostic).not.toBeNull();
    expect(
      getProviderDiagnosticPresentation(
        selectionDiagnostic,
        createRuntimeI18n("zh-CN"),
      ),
    ).toEqual({
      label: "自动回退到会话页面",
      summary: "自动偏好在前置来源不可用后选择了会话页面。",
    });
    expect(
      getProviderDiagnosticPresentation(fallbackDiagnostic, createRuntimeI18n("en")),
    ).toEqual({
      label: "Official API credential missing",
      summary:
        "The Official API source could not run because its required credential is missing.",
    });
  });

  it("builds localized page-capture unavailable diagnostic presentation", () => {
    const diagnostic = createPageSessionDiagnostic({
      providerId: "cursor-personal-page",
      pageSessionKind: "capture_unavailable",
      rawMessage:
        "The open Cursor dashboard usage page could not be read by extension scripting.",
    });

    expect(
      getProviderDiagnosticPresentation(diagnostic, createRuntimeI18n("en")),
    ).toEqual({
      label: "Page capture unavailable",
      summary:
        "The current page could not be read by the extension; keep the raw detail for permission, page-state, or route review.",
    });
    expect(
      getProviderDiagnosticPresentation(diagnostic, createRuntimeI18n("zh-CN")),
    ).toEqual({
      label: "页面捕获不可用",
      summary:
        "当前页面无法被扩展读取；保留 raw detail 用于权限、页面状态或 route 检查。",
    });
    expect(diagnostic.rawMessage).toContain("could not be read");
  });

  it("builds localized adapter-error diagnostic presentation without translating raw bodies", () => {
    const diagnostic = createAdapterErrorDiagnostic({
      providerId: "cursor-personal-page",
      adapterErrorKind: "parse_failed",
      sourceKind: "session_page",
      failureCode: "route_drift",
      parserStage: "personal_usage_page",
      rawMessage:
        "The matched Cursor usage page no longer exposed parseable billing-period usage signals.",
    });

    expect(
      getProviderDiagnosticPresentation(diagnostic, createRuntimeI18n("en")),
    ).toEqual({
      label: "Adapter parse failed",
      summary:
        "Session page parsing failed; keep the raw diagnostic body for parser or route review.",
    });
    expect(
      getProviderDiagnosticPresentation(diagnostic, createRuntimeI18n("zh-CN")),
    ).toEqual({
      label: "适配器解析失败",
      summary:
        "会话页面解析失败；保留 raw diagnostic body 用于 parser 或 route 检查。",
    });
    expect(diagnostic.rawMessage).toBe(
      "The matched Cursor usage page no longer exposed parseable billing-period usage signals.",
    );
  });

  it("returns no localized presentation for unknown diagnostic codes", () => {
    const diagnostic: ProviderDiagnostic = {
      code: "future.experimental_code",
      category: "adapter_error",
      severity: "warning",
      rawMessage: "Future diagnostic body remains raw.",
    };

    expect(
      getProviderDiagnosticPresentation(diagnostic, createRuntimeI18n("zh-CN")),
    ).toBeNull();
  });

  it("keeps unknown source and adapter diagnostics presentation-only", () => {
    const diagnostics: ProviderDiagnostic[] = [
      {
        code: "future.source_selection",
        category: "source_selection",
        severity: "info",
        rawMessage: "Future source selection body remains raw evidence.",
      },
      {
        code: "future.source_fallback",
        category: "source_fallback",
        severity: "warning",
        rawMessage: "Future fallback body remains raw evidence.",
      },
      {
        code: "future.adapter_error",
        category: "adapter_error",
        severity: "error",
        rawMessage: "Future adapter body remains untranslated.",
      },
    ];

    for (const diagnostic of diagnostics) {
      expect(
        getProviderDiagnosticPresentation(diagnostic, createRuntimeI18n("en")),
      ).toBeNull();
      expect(
        getProviderDiagnosticPresentation(diagnostic, createRuntimeI18n("zh-CN")),
      ).toBeNull();
      expect(diagnostic.rawMessage).toContain("Future");
    }
  });

  it("returns zh-CN structured operator workspace shell copy builders", () => {
    const i18n = createRuntimeI18n("zh-CN");
    const operatorCopy = buildOperatorWorkspaceLocalizedCopy(i18n);

    expect(operatorCopy.interactionAudit.topbar.title).toBe("交互审计");
    expect(operatorCopy.themeRecovery.topbar.title).toBe("主题恢复审核");
    expect(operatorCopy.themeRecovery.links.sidePanel.settings).toBe("打开设置");
  });

  it("returns zh-CN structured store workflow helper copy builders", () => {
    const i18n = createRuntimeI18n("zh-CN");
    const storeCopy = buildStoreWorkflowLocalizedCopy(i18n);

    expect(storeCopy.screenshotSeed.sectionLabel).toBe("Store Screenshot 调试路由");
    expect(storeCopy.screenshotSeed.presetHeadline("unlock", "")).toBe(
      "截图 seed lock 已清除",
    );
    expect(storeCopy.screenshotSeed.submissionCaption("setup-guidance")).toBe(
      "当访问权限或凭据缺失时，明确下一步配置动作。",
    );
    expect(storeCopy.nativePopupProbe.requestedTitle).toBe("已请求原生 popup");
  });

  it("localizes runtime duration and freshness labels for zh-CN", () => {
    const i18n = createRuntimeI18n("zh-CN");

    expect(i18n.localizeRelativeRuntimeLabel("Synced 2m ago")).toBe(
      "2分钟前同步",
    );
    expect(
      i18n.localizeRelativeRuntimeLabel("Analytics snapshot 34m ago"),
    ).toBe("34分钟前的分析快照");
    expect(
      i18n.localizeRelativeRuntimeLabel("Cached snapshot stale by 4h"),
    ).toBe("缓存快照已滞后4小时");
    expect(i18n.localizeResetRuntimeLabel("Resets in 6 days")).toBe(
      "6天后重置",
    );
    expect(
      i18n.localizeResetRuntimeLabel("Monthly AI quota renews every 30 days"),
    ).toBe("Monthly AI 配额每30天续期一次");
  });

});
