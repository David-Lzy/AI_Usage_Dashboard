import { describe, expect, it } from "vitest";

import { SUPPORTED_APP_LOCALES } from "./i18n";
import { buildUsageExportLocalizedCopy } from "./usage-export-localized-copy";

describe("usage export localized copy", () => {
  it.each(SUPPORTED_APP_LOCALES)("provides complete copy for %s", (locale) => {
    const copy = buildUsageExportLocalizedCopy(locale);

    expect(copy.title.length).toBeGreaterThan(0);
    expect(copy.downloadFailed.length).toBeGreaterThan(0);
    expect(copy.totalRows(50).length).toBeGreaterThan(0);
    expect(copy.familyLabels.gateway_daily.length).toBeGreaterThan(0);
    expect(copy.freshnessLabels.unknown.length).toBeGreaterThan(0);
    expect(copy.metricLabels.total_tokens.length).toBeGreaterThan(0);
    expect(copy.metricLabels.cache_read_tokens.length).toBeGreaterThan(0);
    expect(copy.timezoneKnown("UTC")).toBe("UTC");
    expect(copy.timezoneUnknown).toBe(copy.freshnessLabels.unknown);
    expect(copy.timezoneUnknown.length).toBeGreaterThan(0);
    const english = buildUsageExportLocalizedCopy("en");
    expect(Object.keys(copy.metricLabels).sort()).toEqual(Object.keys(english.metricLabels).sort());
    expect(Object.keys(copy.unitLabels).sort()).toEqual(Object.keys(english.unitLabels).sort());
    if (locale !== "en") {
      for (const metric of ["actual_cost", "reference_cost", "cache_creation_tokens", "cache_read_tokens"]) {
        expect(copy.metricLabels[metric]).not.toBe(english.metricLabels[metric]);
      }
    }
  });

  it("uses localized cache and cost metric labels outside English", () => {
    expect(buildUsageExportLocalizedCopy("de").metricLabels.cache_read_tokens).toBe("Cache-Lese-Token");
    expect(buildUsageExportLocalizedCopy("zh-CN").metricLabels.actual_cost).toBe("实际成本");
  });

  it("does not repeat the source timezone label in metadata values", () => {
    const copy = buildUsageExportLocalizedCopy("en");
    expect(`${copy.sourceTimezone} ${copy.timezoneUnknown}`).toBe("Source timezone Unknown");
    expect(`${copy.sourceTimezone} ${copy.timezoneKnown("UTC")}`).toBe("Source timezone UTC");
  });
});
