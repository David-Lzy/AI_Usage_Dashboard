import { describe, expect, it } from "vitest";

import {
  buildAggregateUsageLocalizedCopy,
  type GatewayComparisonReason,
} from "./aggregate-usage-localized-copy";
import { SUPPORTED_APP_LOCALES } from "./i18n";

const REASONS: readonly GatewayComparisonReason[] = [
  "one_account",
  "missing",
  "partial",
  "time_basis",
  "stale",
  "currency",
  "scope",
  "open_day",
  "range",
];

describe("aggregate usage localized copy", () => {
  it("provides complete comparison copy for every supported locale", () => {
    for (const locale of SUPPORTED_APP_LOCALES) {
      const copy = buildAggregateUsageLocalizedCopy(locale);

      expect(copy.title.length).toBeGreaterThan(0);
      expect(copy.invalidRange).toContain("366");
      expect(copy.refreshDisconnected.length).toBeGreaterThan(0);
      expect(copy.coverageValue(1, 2).length).toBeGreaterThan(0);
      for (const reason of REASONS) {
        expect(copy.reasons[reason].length).toBeGreaterThan(0);
      }
    }
  });
});
