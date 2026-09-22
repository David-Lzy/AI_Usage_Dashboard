import { describe, expect, it } from "vitest";

import { SUPPORTED_APP_LOCALES } from "./i18n";
import { buildUsageProgressLocalizedCopy } from "./usage-progress-localized-copy";

describe("buildUsageProgressLocalizedCopy", () => {
  it("provides complete progress copy for every shipped locale", () => {
    for (const locale of SUPPORTED_APP_LOCALES) {
      const copy = buildUsageProgressLocalizedCopy(locale);

      expect(copy.unknown).not.toHaveLength(0);
      expect(copy.percentageUnavailable).not.toHaveLength(0);
      expect(copy.unavailable).not.toHaveLength(0);
      expect(copy.remainingValue("42")).not.toHaveLength(0);
      expect(copy.usedValue("42")).not.toHaveLength(0);
      expect(copy.trackedValue("42")).not.toHaveLength(0);
      expect(copy.totalValue("42")).not.toHaveLength(0);
    }
  });

  it("uses the locale-specific Chinese and Arabic copy", () => {
    expect(buildUsageProgressLocalizedCopy("zh-CN").unknown).toBe("未知");
    expect(buildUsageProgressLocalizedCopy("ar").unavailable).toBe("غير متاح");
  });
});
