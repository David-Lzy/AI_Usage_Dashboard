import { describe, expect, it } from "vitest";

import { createRuntimeI18n } from "./i18n";
import {
  buildQuotaResetLabelParts,
  buildResetTimeDisplayCopy,
  formatResetTimeValue,
  normalizeResetTimeDisplayMode,
} from "./reset-time-display";

const RUNTIME_LOCALES = [
  "en",
  "zh-CN",
  "zh-TW",
  "ja",
  "ko",
  "es-419",
  "pt-BR",
  "fr",
  "de",
  "it",
  "ru",
  "ar",
  "hi",
  "id",
] as const;

function createUsageWindowItem(
  kind: "weekly" | "model_weekly" | "unknown",
  detail: string | null = null,
) {
  return {
    id: `window:${kind}:limit:${encodeURIComponent(detail ?? "")}:0`,
    kind: "usage_window" as const,
    label: "Provider usage window",
    detail,
    resetAt: "2026-07-20T05:17:00.000Z",
    resetLabel: null,
  };
}

describe("reset time display", () => {
  it("normalizes missing and unsupported preferences to date mode", () => {
    expect(normalizeResetTimeDisplayMode(undefined)).toBe("date");
    expect(normalizeResetTimeDisplayMode("weekday")).toBe("weekday");
    expect(normalizeResetTimeDisplayMode("date_and_weekday")).toBe(
      "date_and_weekday",
    );
    expect(normalizeResetTimeDisplayMode("timestamp")).toBe("date");
  });

  it("uses weekly, model, and generic names from normalized window kinds", () => {
    const i18n = createRuntimeI18n("en", undefined);

    expect(
      buildQuotaResetLabelParts(
        createUsageWindowItem("weekly"),
        "date",
        i18n,
      ).name,
    ).toBe("Weekly limit");
    expect(
      buildQuotaResetLabelParts(
        createUsageWindowItem("model_weekly", "GPT-5.3-Codex-Spark"),
        "date",
        i18n,
      ).name,
    ).toBe("GPT-5.3-Codex-Spark");
    expect(
      buildQuotaResetLabelParts(
        createUsageWindowItem("unknown"),
        "date",
        i18n,
      ).name,
    ).toBe("Usage limit");
  });

  it("formats weekday-only reset strings as the next matching local day", () => {
    const i18n = createRuntimeI18n("en", undefined);
    const now = new Date(2026, 6, 18, 12, 0, 0);
    const formatted = formatResetTimeValue("Mon 05:17", "weekday", i18n, now);

    expect(formatted).toMatch(/Mon/);
    expect(formatted).toMatch(/5:17/);
  });

  it("provides translated options and Intl-formatted values for every locale", () => {
    for (const locale of RUNTIME_LOCALES) {
      const i18n = createRuntimeI18n(locale, undefined);
      const copy = buildResetTimeDisplayCopy(i18n.resolvedLocale);
      const formatted = formatResetTimeValue(
        "2026-07-20T05:17:00.000Z",
        "date_and_weekday",
        i18n,
      );

      expect(copy.settingLabel.length).toBeGreaterThan(0);
      expect(copy.dateOption.length).toBeGreaterThan(0);
      expect(copy.weekdayOption.length).toBeGreaterThan(0);
      expect(copy.dateAndWeekdayOption.length).toBeGreaterThan(0);
      expect(formatted?.length).toBeGreaterThan(0);
    }
  });
});
