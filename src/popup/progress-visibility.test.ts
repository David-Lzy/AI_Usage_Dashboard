import { describe, expect, it } from "vitest";

import { shouldShowPopupProviderProgress } from "./progress-visibility";

describe("popup progress visibility", () => {
  it("hides empty percent progress when no popup measurement is available", () => {
    expect(
      shouldShowPopupProviderProgress({
        quotaUnit: "percent",
        used: null,
        remaining: null,
        total: 100,
        usageWindows: undefined,
      }),
    ).toBe(false);
  });

  it("keeps structured usage-window progress visible", () => {
    expect(
      shouldShowPopupProviderProgress({
        quotaUnit: "percent",
        used: null,
        remaining: null,
        total: 100,
        usageWindows: [
          {
            label: "Weekly usage window",
            normalizedLabel: "Weekly usage window",
            kind: "weekly",
            modelLabel: null,
            quotaUnit: "percent",
            used: 8,
            remaining: 92,
            total: 100,
            resetAt: null,
            resetLabel: null,
          },
        ],
      }),
    ).toBe(true);
  });

  it("keeps documented non-percent totals visible as indeterminate context", () => {
    expect(
      shouldShowPopupProviderProgress({
        quotaUnit: "requests",
        used: null,
        remaining: null,
        total: 2000,
        usageWindows: undefined,
      }),
    ).toBe(true);
  });
});
