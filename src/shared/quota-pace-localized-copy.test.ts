import { describe, expect, it } from "vitest";

import { SUPPORTED_APP_LOCALES } from "./i18n";
import {
  buildQuotaPaceLocalizedCopy,
  formatQuotaPaceDateTime,
} from "./quota-pace-localized-copy";

describe("quota pace localized copy", () => {
  it("provides complete copy and localized dates for every locale", () => {
    for (const locale of SUPPORTED_APP_LOCALES) {
      const copy = buildQuotaPaceLocalizedCopy(locale);
      const date = formatQuotaPaceDateTime(
        "2026-07-29T00:00:00.000Z",
        locale,
      );

      expect(copy.settingLabel.length).toBeGreaterThan(0);
      expect(copy.settingDetail.length).toBeGreaterThan(0);
      expect(copy.sectionLabel.length).toBeGreaterThan(0);
      expect(copy.estimateLabel.length).toBeGreaterThan(0);
      expect(copy.status.ahead.length).toBeGreaterThan(0);
      expect(copy.status.on_track.length).toBeGreaterThan(0);
      expect(copy.status.at_risk.length).toBeGreaterThan(0);
      expect(copy.comparison("50%", "48%").length).toBeGreaterThan(0);
      expect(copy.lastsThroughReset(date).length).toBeGreaterThan(0);
      expect(copy.projectedExhaustion(date).length).toBeGreaterThan(0);
      expect(date.length).toBeGreaterThan(0);
    }
  });
});
