import { describe, expect, it } from "vitest";

import {
  createAdapterErrorDiagnostic,
  createCredentialDiagnostic,
  createHostAccessDiagnostic,
  createNoLiveSourceFallbackDiagnostic,
  createPageSessionDiagnostic,
  createPolicyOnlyDiagnostic,
  createSourceFallbackDiagnostic,
  createSourceSelectionDiagnostic,
  createSyncStaleDiagnostic,
  createUsageThresholdDiagnostic,
} from "../providers/diagnostics";
import { createRuntimeI18n, SUPPORTED_APP_LOCALES } from "./i18n";
import { getProviderDiagnosticPresentation as getReexportedPresentation } from "./localized-copy";
import { getProviderDiagnosticPresentation } from "./provider-diagnostic-presentation";

describe("getProviderDiagnosticPresentation", () => {
  it("builds localized source-selection presentation", () => {
    const diagnostic = createSourceSelectionDiagnostic({
      providerId: "cursor-personal-page",
      sourcePreference: "auto",
      selectedKind: "session_page",
      hadFallback: true,
      rawMessage: "Auto fell back to Session page.",
    });

    expect(getProviderDiagnosticPresentation(diagnostic, createRuntimeI18n("en"))).toEqual({
      label: "Auto fell back to Session page",
      summary: "Auto preference selected Session page after an earlier source failed.",
    });
    expect(
      getProviderDiagnosticPresentation(diagnostic, createRuntimeI18n("zh-CN")),
    ).toEqual({
      label: "自动回退到会话页面",
      summary: "自动偏好在前置来源不可用后选择了会话页面。",
    });
  });

  it("builds explicit non-English source presentation for every shipped locale", () => {
    const diagnostic = createSourceSelectionDiagnostic({
      providerId: "cursor-personal-page",
      sourcePreference: "auto",
      selectedKind: "session_page",
      hadFallback: true,
      rawMessage: "Auto fell back to Session page.",
    });
    const english = getProviderDiagnosticPresentation(diagnostic, createRuntimeI18n("en"));
    const expectedLabels = {
      en: "Auto fell back to Session page",
      "zh-CN": "自动回退到会话页面",
      "zh-TW": "自動回退到會話頁面",
      ja: "自動でセッションページへフォールバック",
      ko: "자동으로 세션 페이지로 fallback",
      "es-419": "Auto volvió a página de sesión",
      "pt-BR": "Auto voltou para página de sessão",
      fr: "Auto est revenu à la page de session",
      de: "Auto fiel auf Sitzungsseite zurück",
      it: "Auto è tornato alla pagina di sessione",
      ru: "Авто переключилось на страницу сессии",
      ar: "رجوع تلقائي إلى صفحة الجلسة",
      hi: "Auto सेशन पेज पर fallback हुआ",
      id: "Auto fallback ke halaman sesi",
    } satisfies Record<(typeof SUPPORTED_APP_LOCALES)[number], string>;

    for (const locale of SUPPORTED_APP_LOCALES) {
      const presentation = getProviderDiagnosticPresentation(
        diagnostic,
        createRuntimeI18n(locale),
      );

      expect(presentation?.label).toBe(expectedLabels[locale]);

      if (locale !== "en") {
        expect(presentation?.summary).not.toBe(english?.summary);
        expect(presentation?.summary).not.toContain("Auto preference selected");
      }
    }
  });

  it("covers every source diagnostic code without translating raw source bodies", () => {
    const diagnostics = [
      createSourceSelectionDiagnostic({
        providerId: "cursor-personal-page",
        sourcePreference: "auto",
        selectedKind: "official_api",
        hadFallback: false,
        rawMessage: "Auto selected Official API.",
      })!,
      createSourceSelectionDiagnostic({
        providerId: "cursor-personal-page",
        sourcePreference: "auto",
        selectedKind: "session_page",
        hadFallback: false,
        rawMessage: "Auto selected Session page.",
      })!,
      createSourceSelectionDiagnostic({
        providerId: "cursor-personal-page",
        sourcePreference: "official_api",
        selectedKind: "official_api",
        hadFallback: false,
        rawMessage: "Preferred Official API selected.",
      })!,
      createSourceSelectionDiagnostic({
        providerId: "cursor-personal-page",
        sourcePreference: "session_page",
        selectedKind: "session_page",
        hadFallback: false,
        rawMessage: "Preferred Session page selected.",
      })!,
      createSourceFallbackDiagnostic({
        providerId: "cursor-personal-page",
        sourcePreference: "auto",
        failure: {
          kind: "official_api",
          code: "credential_missing",
          detail: "No Cursor Admin API key is stored.",
        },
        rawMessage: "Official API unavailable: no Cursor Admin API key is stored.",
      }),
      createSourceFallbackDiagnostic({
        providerId: "cursor-personal-page",
        sourcePreference: "auto",
        failure: {
          kind: "official_api",
          code: "request_failed",
          detail: "Cursor Admin API request failed.",
        },
        rawMessage: "Official API request failed.",
      }),
      createSourceFallbackDiagnostic({
        providerId: "cursor-personal-page",
        sourcePreference: "auto",
        failure: {
          kind: "session_page",
          code: "capture_unavailable",
          detail: "Cursor usage page could not be read.",
        },
        rawMessage: "Session page unavailable.",
      }),
      createNoLiveSourceFallbackDiagnostic({
        providerId: "cursor-personal-page",
        sourcePreference: "auto",
        failureCount: 2,
        rawMessage: "No live source path is available.",
      }),
    ] as const;

    for (const diagnostic of diagnostics) {
      const presentation = getProviderDiagnosticPresentation(
        diagnostic,
        createRuntimeI18n("ar"),
      );

      expect(presentation?.label).toBeTruthy();
      expect(presentation?.summary).toBeTruthy();
      expect(presentation?.summary).not.toBe(diagnostic.rawMessage);
      expect(diagnostic.rawMessage).toMatch(/[A-Za-z]/);
    }
  });

  it("builds localized usage-threshold presentation", () => {
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
  });

  it("builds explicit non-English warning presentation for every shipped locale", () => {
    const diagnostic = createUsageThresholdDiagnostic({
      providerId: "codex-personal-page",
      usageThresholdKind: "threshold_warning",
      rawMessage: "5-hour usage window: 7% remaining",
      usagePercent: 93,
      thresholdPercent: 80,
      unitLabel: "percent",
    });
    const english = getProviderDiagnosticPresentation(diagnostic, createRuntimeI18n("en"));
    const expectedLabels = {
      en: "Usage threshold",
      "zh-CN": "用量阈值",
      "zh-TW": "用量閾值",
      ja: "使用量しきい値",
      ko: "사용량 임계값",
      "es-419": "Umbral de uso",
      "pt-BR": "Limite de uso",
      fr: "Seuil d'usage",
      de: "Nutzungsschwelle",
      it: "Soglia di utilizzo",
      ru: "Порог использования",
      ar: "حد الاستخدام",
      hi: "उपयोग सीमा",
      id: "Ambang penggunaan",
    } satisfies Record<(typeof SUPPORTED_APP_LOCALES)[number], string>;

    for (const locale of SUPPORTED_APP_LOCALES) {
      const i18n = createRuntimeI18n(locale);
      const presentation = getProviderDiagnosticPresentation(diagnostic, i18n);

      expect(presentation?.label).toBe(expectedLabels[locale]);
      expect(presentation?.summary).toContain(i18n.formatPercentValue(93));
      expect(presentation?.summary).toContain(i18n.formatPercentValue(80));

      if (locale !== "en") {
        expect(presentation?.summary).not.toBe(english?.summary);
        expect(presentation?.summary).not.toContain("Usage is at");
      }
    }
  });

  it("covers every warning diagnostic code without translating raw warning bodies", () => {
    const diagnostics = [
      createCredentialDiagnostic({
        providerId: "cursor-personal-page",
        credentialKind: "admin_api_key",
        rawMessage: "No Cursor Admin API key is stored.",
      }),
      createCredentialDiagnostic({
        providerId: "codex-personal-page",
        credentialKind: "workspace_config",
        rawMessage: "No Codex workspace config is stored.",
      }),
      createHostAccessDiagnostic({
        providerId: "cursor-personal-page",
        sourceKind: "session_page",
        hostLabel: "Cursor",
        rawMessage: "Cursor host access has not been granted.",
      }),
      {
        code: "host_access.required_for_live_sync",
        category: "host_access",
        severity: "warning",
        rawMessage: "Cursor host access is required for live sync.",
      },
      createPageSessionDiagnostic({
        providerId: "cursor-personal-page",
        pageSessionKind: "open_page_required",
        rawMessage: "Open the Cursor usage page.",
      }),
      createPageSessionDiagnostic({
        providerId: "cursor-personal-page",
        pageSessionKind: "logged_out",
        rawMessage: "The Cursor usage page is logged out.",
      }),
      createPageSessionDiagnostic({
        providerId: "cursor-personal-page",
        pageSessionKind: "capture_unavailable",
        rawMessage: "The Cursor usage page could not be read.",
      }),
      createUsageThresholdDiagnostic({
        providerId: "codex-personal-page",
        usageThresholdKind: "threshold_warning",
        rawMessage: "5-hour usage window: 7% remaining",
        usagePercent: 93,
        thresholdPercent: 80,
        unitLabel: "percent",
      }),
      createUsageThresholdDiagnostic({
        providerId: "cursor-personal-page",
        usageThresholdKind: "overage_detected",
        rawMessage: "Cursor overage requests are present.",
        overageCount: 3,
        unitLabel: "requests",
      }),
      createUsageThresholdDiagnostic({
        providerId: "cursor-personal-page",
        usageThresholdKind: "on_demand_off",
        rawMessage: "Cursor on-demand usage is off.",
      }),
      createPolicyOnlyDiagnostic({
        providerId: "gemini-policy",
        policyOnlyKind: "live_source_unavailable",
        rawMessage: "Gemini is policy-only.",
      }),
      createPolicyOnlyDiagnostic({
        providerId: "gemini-policy",
        policyOnlyKind: "documented_limit_only",
        rawMessage: "Gemini quota is documented policy only.",
      }),
      createSyncStaleDiagnostic({
        providerId: "codex-personal-page",
        syncStaleKind: "automatic_sync_overdue",
        rawMessage: "Automatic sync is overdue.",
        ageMinutes: 45,
        staleAfterMinutes: 30,
      }),
      createSyncStaleDiagnostic({
        providerId: "codex-personal-page",
        syncStaleKind: "cached_state_stale",
        rawMessage: "Cached state is stale.",
        ageMinutes: 45,
        staleAfterMinutes: 30,
      }),
    ] as const;

    for (const diagnostic of diagnostics) {
      const presentation = getProviderDiagnosticPresentation(
        diagnostic,
        createRuntimeI18n("ar"),
      );

      expect(presentation?.label).toBeTruthy();
      expect(presentation?.summary).toBeTruthy();
      expect(presentation?.summary).not.toBe(diagnostic.rawMessage);
      expect(diagnostic.rawMessage).toMatch(/[A-Za-z]/);
    }
  });

  it("builds localized adapter-error presentation", () => {
    const diagnostic = createAdapterErrorDiagnostic({
      providerId: "codex-personal-page",
      adapterErrorKind: "parse_failed",
      sourceKind: "session_page",
      rawMessage: "Codex usage page parse failed",
    });

    expect(
      getProviderDiagnosticPresentation(diagnostic, createRuntimeI18n("zh-CN")),
    ).toEqual({
      label: "适配器解析失败",
      summary:
        "会话页面解析失败；保留 raw diagnostic body 用于 parser 或 route 检查。",
    });
  });

  it("builds explicit non-English adapter-error presentation for every shipped locale", () => {
    const diagnostic = createAdapterErrorDiagnostic({
      providerId: "codex-personal-page",
      adapterErrorKind: "parse_failed",
      sourceKind: "session_page",
      rawMessage: "Codex usage page parse failed",
    });
    const english = getProviderDiagnosticPresentation(diagnostic, createRuntimeI18n("en"));
    const expectedLabels = {
      en: "Adapter parse failed",
      "zh-CN": "适配器解析失败",
      "zh-TW": "適配器解析失敗",
      ja: "アダプター解析失敗",
      ko: "어댑터 파싱 실패",
      "es-419": "Error de parseo del adaptador",
      "pt-BR": "Falha de parsing do adaptador",
      fr: "Échec de parsing de l'adaptateur",
      de: "Adapter-Parsing fehlgeschlagen",
      it: "Parsing dell'adapter non riuscito",
      ru: "Ошибка парсинга адаптера",
      ar: "فشل تحليل المحول",
      hi: "Adapter parsing विफल",
      id: "Parsing adapter gagal",
    } satisfies Record<(typeof SUPPORTED_APP_LOCALES)[number], string>;

    for (const locale of SUPPORTED_APP_LOCALES) {
      const presentation = getProviderDiagnosticPresentation(
        diagnostic,
        createRuntimeI18n(locale),
      );

      expect(presentation?.label).toBe(expectedLabels[locale]);

      if (locale !== "en") {
        expect(presentation?.summary).not.toBe(english?.summary);
        expect(presentation?.summary).not.toContain("parsing failed; keep");
      }
    }
  });

  it("covers every adapter-error diagnostic code without translating raw adapter bodies", () => {
    const diagnostics = [
      createAdapterErrorDiagnostic({
        providerId: "codex-personal-page",
        adapterErrorKind: "parse_failed",
        sourceKind: "session_page",
        rawMessage: "Codex usage page parse failed",
      }),
      createAdapterErrorDiagnostic({
        providerId: "cursor-personal-page",
        adapterErrorKind: "unsupported_response",
        sourceKind: "official_api",
        rawMessage: "Cursor Admin API returned an unsupported response.",
      }),
      createAdapterErrorDiagnostic({
        providerId: "claude-code-team-page",
        adapterErrorKind: "unexpected_error",
        sourceKind: "session_page",
        rawMessage: "Claude usage page adapter hit an unexpected error.",
      }),
    ] as const;

    for (const diagnostic of diagnostics) {
      const presentation = getProviderDiagnosticPresentation(
        diagnostic,
        createRuntimeI18n("ar"),
      );

      expect(presentation?.label).toBeTruthy();
      expect(presentation?.summary).toBeTruthy();
      expect(presentation?.summary).not.toBe(diagnostic.rawMessage);
      expect(diagnostic.rawMessage).toMatch(/[A-Za-z]/);
    }
  });

  it("preserves the legacy localized-copy export path", () => {
    const diagnostic = createUsageThresholdDiagnostic({
      providerId: "codex-personal-page",
      usageThresholdKind: "threshold_warning",
      rawMessage: "Weekly usage window: 85% used",
      usagePercent: 85,
      thresholdPercent: 80,
      unitLabel: "percent",
    });

    expect(getReexportedPresentation(diagnostic, createRuntimeI18n("en"))?.label).toBe(
      "Usage threshold",
    );
  });
});
