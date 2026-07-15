import { describe, expect, it } from "vitest";

import { SUPPORTED_APP_LOCALES } from "./i18n";
import { buildCursorUsageLocalizedCopy } from "./cursor-usage-localized-copy";

describe("Cursor usage localized copy", () => {
  it("provides every Cursor usage label for every supported locale", () => {
    const englishKeys = Object.keys(buildCursorUsageLocalizedCopy("en"));

    for (const locale of SUPPORTED_APP_LOCALES) {
      const copy = buildCursorUsageLocalizedCopy(locale);
      expect(Object.keys(copy)).toEqual(englishKeys);
      for (const value of Object.values(copy)) {
        expect(value.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("keeps Simplified and Traditional Chinese distinct", () => {
    expect(buildCursorUsageLocalizedCopy("zh-CN").billingSummary).toBe(
      "用量与计费",
    );
    expect(buildCursorUsageLocalizedCopy("zh-TW").billingSummary).toBe(
      "用量與計費",
    );
  });

  it("falls back to English for an unknown locale", () => {
    expect(buildCursorUsageLocalizedCopy("unknown")).toEqual(
      buildCursorUsageLocalizedCopy("en"),
    );
  });
});
