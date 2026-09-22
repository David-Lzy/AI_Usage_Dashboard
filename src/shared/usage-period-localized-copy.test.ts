import { describe, expect, it } from "vitest";

import { SUPPORTED_APP_LOCALES } from "./i18n";
import { buildUsagePeriodLocalizedCopy } from "./usage-period-localized-copy";

describe("usage period localized copy", () => {
  it.each(SUPPORTED_APP_LOCALES)("provides complete period copy for %s", (locale) => {
    const copy = buildUsagePeriodLocalizedCopy(locale);
    expect(copy.presets.last_30_days.length).toBeGreaterThan(0);
    expect(copy.referenceTimezone("UTC").length).toBeGreaterThan(0);
    expect(copy.latestObservation("2026-09-23").length).toBeGreaterThan(0);
    expect(copy.ambiguous.length).toBeGreaterThan(0);
  });
});
