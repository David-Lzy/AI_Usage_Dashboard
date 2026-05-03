import { describe, expect, it } from "vitest";

import {
  createAdapterErrorDiagnostic,
  createSourceSelectionDiagnostic,
  createUsageThresholdDiagnostic,
} from "../providers/diagnostics";
import { createRuntimeI18n } from "./i18n";
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
