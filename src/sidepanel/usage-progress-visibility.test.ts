import { describe, expect, it } from "vitest";

import { shouldShowSingleUsageProgress } from "./usage-progress-visibility";

describe("shouldShowSingleUsageProgress", () => {
  it("hides empty percent progress when no usage-window measurement is available", () => {
    expect(
      shouldShowSingleUsageProgress({
        quotaUnit: "percent",
        used: null,
        remaining: null,
        total: 100,
        usageWindows: undefined,
      }),
    ).toBe(false);
  });

  it("keeps documented non-percent totals visible as indeterminate quota context", () => {
    expect(
      shouldShowSingleUsageProgress({
        quotaUnit: "requests",
        used: null,
        remaining: null,
        total: 2000,
        usageWindows: undefined,
      }),
    ).toBe(true);
  });

  it("defers to structured usage-window progress when windows are available", () => {
    expect(
      shouldShowSingleUsageProgress({
        quotaUnit: "percent",
        used: 40,
        remaining: 60,
        total: 100,
        usageWindows: [
          {
            label: "5 小时使用限额",
            normalizedLabel: "5-hour usage window",
            kind: "rolling_5h",
            modelLabel: null,
            quotaUnit: "percent",
            used: 40,
            remaining: 60,
            total: 100,
            resetAt: null,
            resetLabel: null,
          },
        ],
      }),
    ).toBe(false);
  });
});
