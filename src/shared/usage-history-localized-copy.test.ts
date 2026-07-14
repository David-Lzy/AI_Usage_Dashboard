import { describe, expect, it } from "vitest";

import { SUPPORTED_APP_LOCALES } from "./i18n";
import { buildUsageHistoryLocalizedCopy } from "./usage-history-localized-copy";

describe("usage history localized copy", () => {
  it("provides complete module and known-surface labels for every supported locale", () => {
    for (const locale of SUPPORTED_APP_LOCALES) {
      const copy = buildUsageHistoryLocalizedCopy(locale);
      expect(copy.personalUsage).not.toBe("");
      expect(copy.turns).not.toBe("");
      expect(copy.noData).not.toBe("");
      expect(copy.collapse).not.toBe("");
      expect(copy.expand).not.toBe("");
      expect(copy.locale).toBe(locale);
      expect(copy.surfaceLabels.desktop_app).not.toBe("");
      expect(copy.surfaceLabels.work_desktop).not.toBe("");
      expect(copy.surfaceLabels.vscode).not.toBe("");
      expect(copy.surfaceLabels.unknown).not.toBe("");
    }
  });

  it("keeps model labels outside the localization map", () => {
    const copy = buildUsageHistoryLocalizedCopy("zh-CN");
    expect(copy.surfaceLabels).not.toHaveProperty("gpt-5.4");
  });

  it("labels the observed work desktop surface without exposing its raw id", () => {
    expect(buildUsageHistoryLocalizedCopy("zh-CN").surfaceLabels.work_desktop)
      .toBe("桌面工作区");
    expect(buildUsageHistoryLocalizedCopy("en").surfaceLabels.work_desktop)
      .toBe("Desktop workspace");
  });
});
