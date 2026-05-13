import { describe, expect, it } from "vitest";

import { createRuntimeI18n, SUPPORTED_APP_LOCALES } from "../shared/i18n";
import { buildOperatorWorkspaceLocalizedCopy } from "../shared/localized-copy";
import {
  presentAuditFrameReadiness,
  presentAuditPresetResult,
} from "./interaction-audit-frame-result-presentation";

describe("interaction audit frame result presentation", () => {
  it("localizes ready and waiting frame readiness display copy", () => {
    const copy = buildOperatorWorkspaceLocalizedCopy(
      createRuntimeI18n("zh-CN"),
    ).interactionAudit.frameResults;

    expect(
      presentAuditFrameReadiness(
        {
          ready: true,
          code: "ready",
          message: "Frame loaded and ready for audit presets.",
        },
        copy,
      ),
    ).toEqual({
      tone: "neutral",
      message: "Frame 已加载，可运行审计 preset。",
    });

    expect(
      presentAuditFrameReadiness(
        {
          ready: false,
          code: "waiting_dashboard_provider_actions",
          message: "Frame loaded. Waiting for dashboard provider actions.",
          rawMessage:
            "Missing selector .provider-card .text-button for dashboard-360 readiness.",
        },
        copy,
      ),
    ).toEqual({
      tone: "neutral",
      message: "Frame 已加载，正在等待 dashboard provider action。",
      rawDetailLabel: "原始详情",
      rawMessage:
        "Missing selector .provider-card .text-button for dashboard-360 readiness.",
    });
  });

  it("localizes preset success and typed failure without translating raw details", () => {
    const copy = buildOperatorWorkspaceLocalizedCopy(
      createRuntimeI18n("ar"),
    ).interactionAudit.frameResults;

    expect(
      presentAuditPresetResult(
        {
          ok: true,
          code: "focused_popup_dashboard_action",
          message: "Focused the popup dashboard action.",
        },
        copy,
      ),
    ).toEqual({
      tone: "neutral",
      message: "تم تركيز popup dashboard action.",
    });

    expect(
      presentAuditPresetResult(
        {
          ok: false,
          code: "missing_first_provider_action",
          message: "Could not find the first provider action.",
          rawMessage:
            "Missing selector .provider-card .text-button for dashboard-360:focus-first-provider-open.",
        },
        copy,
      ),
    ).toEqual({
      tone: "warning",
      message: "تعذر العثور على أول provider action.",
      rawDetailLabel: "تفاصيل raw",
      rawMessage:
        "Missing selector .provider-card .text-button for dashboard-360:focus-first-provider-open.",
    });
  });

  it("has explicit frame-result display coverage for every shipped locale", () => {
    for (const locale of SUPPORTED_APP_LOCALES) {
      const copy = buildOperatorWorkspaceLocalizedCopy(createRuntimeI18n(locale))
        .interactionAudit.frameResults;

      expect(copy.rawDetailLabel.length).toBeGreaterThan(0);
      expect(Object.keys(copy.readiness).sort()).toEqual(
        [
          "frame_not_ready",
          "ready",
          "waiting_dashboard_provider_actions",
          "waiting_provider_detail_notes",
          "waiting_popup_actions",
          "waiting_settings_source_controls",
        ].sort(),
      );
      expect(Object.keys(copy.presets).sort()).toEqual(
        [
          "focused_featured_provider_detail_action",
          "focused_first_provider_action",
          "focused_popup_dashboard_action",
          "focused_source_preference",
          "frame_not_ready",
          "missing_detail_note",
          "missing_featured_provider_detail_action",
          "missing_first_provider_action",
          "missing_popup_dashboard_action",
          "missing_source_diagnostics_disclosure",
          "missing_source_preference_select",
          "opened_first_source_diagnostics",
          "scrolled_first_detail_note",
          "unsupported_audit_preset",
        ].sort(),
      );
      expect(copy.readiness.ready.length).toBeGreaterThan(0);
      expect(copy.presets.unsupported_audit_preset.length).toBeGreaterThan(0);
    }
  });
});
