import { describe, expect, it } from "vitest";
import { SUPPORTED_APP_LOCALES } from "./i18n";
import { getProviderInsightsUiCopy } from "./provider-insights-ui-copy";

describe("reset-card eligibility feedback", () => {
  it("provides unavailable feedback in all 14 locales without English fallback", () => {
    const english = getProviderInsightsUiCopy("en").accountGrantUnavailable;
    for (const locale of SUPPORTED_APP_LOCALES) {
      const copy = getProviderInsightsUiCopy(locale).accountGrantUnavailable;
      expect(copy.trim().length).toBeGreaterThan(20);
      if (locale !== "en") expect(copy).not.toBe(english);
    }
  });
  it("requires local identity and known count, not permissions or pairing alone", () => {
    expect(getProviderInsightsUiCopy("en").accountGrantUnavailable).toMatch(/fresh local Codex snapshot.*verified identity.*known available reset-card count/);
    expect(getProviderInsightsUiCopy("zh-CN").accountGrantUnavailable).toContain("数量已知");
  });
});
