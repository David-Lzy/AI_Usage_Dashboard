import { describe, expect, it } from "vitest";

import {
  createAdapterErrorDiagnostic,
  createCredentialDiagnostic,
  createHostAccessDiagnostic,
  createPageSessionDiagnostic,
  createPolicyOnlyDiagnostic,
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
      providerId: "cursor",
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

  it("builds localized usage-threshold presentation", () => {
    const diagnostic = createUsageThresholdDiagnostic({
      providerId: "codex",
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
      providerId: "codex",
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
        providerId: "cursor",
        credentialKind: "admin_api_key",
        rawMessage: "No Cursor Admin API key is stored.",
      }),
      createCredentialDiagnostic({
        providerId: "codex",
        credentialKind: "workspace_config",
        rawMessage: "No Codex workspace config is stored.",
      }),
      createHostAccessDiagnostic({
        providerId: "cursor",
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
        providerId: "cursor",
        pageSessionKind: "open_page_required",
        rawMessage: "Open the Cursor usage page.",
      }),
      createPageSessionDiagnostic({
        providerId: "cursor",
        pageSessionKind: "logged_out",
        rawMessage: "The Cursor usage page is logged out.",
      }),
      createPageSessionDiagnostic({
        providerId: "cursor",
        pageSessionKind: "capture_unavailable",
        rawMessage: "The Cursor usage page could not be read.",
      }),
      createUsageThresholdDiagnostic({
        providerId: "codex",
        usageThresholdKind: "threshold_warning",
        rawMessage: "5-hour usage window: 7% remaining",
        usagePercent: 93,
        thresholdPercent: 80,
        unitLabel: "percent",
      }),
      createUsageThresholdDiagnostic({
        providerId: "cursor",
        usageThresholdKind: "overage_detected",
        rawMessage: "Cursor overage requests are present.",
        overageCount: 3,
        unitLabel: "requests",
      }),
      createUsageThresholdDiagnostic({
        providerId: "cursor",
        usageThresholdKind: "on_demand_off",
        rawMessage: "Cursor on-demand usage is off.",
      }),
      createPolicyOnlyDiagnostic({
        providerId: "gemini",
        policyOnlyKind: "live_source_unavailable",
        rawMessage: "Gemini is policy-only.",
      }),
      createPolicyOnlyDiagnostic({
        providerId: "gemini",
        policyOnlyKind: "documented_limit_only",
        rawMessage: "Gemini quota is documented policy only.",
      }),
      createSyncStaleDiagnostic({
        providerId: "codex",
        syncStaleKind: "automatic_sync_overdue",
        rawMessage: "Automatic sync is overdue.",
        ageMinutes: 45,
        staleAfterMinutes: 30,
      }),
      createSyncStaleDiagnostic({
        providerId: "codex",
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
      providerId: "codex",
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

  it("preserves the legacy localized-copy export path", () => {
    const diagnostic = createUsageThresholdDiagnostic({
      providerId: "codex",
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
