import { describe, expect, it } from "vitest";

import type { ProviderUsageWindow } from "../providers/types";
import {
  buildAvailableQuotaPaceForecasts,
  buildQuotaPaceForecast,
  normalizeQuotaPaceForecastEnabled,
} from "./quota-pace";

const NOW = new Date("2026-07-25T12:00:00.000Z");
const SYNCED_AT = "2026-07-25T11:55:00.000Z";

function createWeeklyWindow(
  overrides: Partial<ProviderUsageWindow> = {},
): ProviderUsageWindow {
  return {
    label: "Weekly usage window",
    normalizedLabel: "weekly usage window",
    kind: "weekly",
    modelLabel: null,
    quotaUnit: "percent",
    used: 50,
    remaining: 50,
    total: 100,
    resetAt: "2026-07-29T00:00:00.000Z",
    resetLabel: "Resets Jul 29",
    ...overrides,
  };
}

describe("quota pace forecast", () => {
  it("classifies fixed percentage windows from deterministic clocks", () => {
    expect(
      buildQuotaPaceForecast(
        createWeeklyWindow({ used: 30, remaining: 70 }),
        SYNCED_AT,
        NOW,
      ),
    ).toMatchObject({ status: "ahead", reason: null });
    expect(
      buildQuotaPaceForecast(createWeeklyWindow(), SYNCED_AT, NOW),
    ).toMatchObject({ status: "on_track", reason: null });

    const atRisk = buildQuotaPaceForecast(
      createWeeklyWindow({ used: 75, remaining: 25 }),
      SYNCED_AT,
      NOW,
    );

    expect(atRisk).toMatchObject({
      status: "at_risk",
      reason: null,
      willLastToReset: false,
    });
    expect(
      atRisk.status === "unavailable" ? null : atRisk.projectedExhaustionAt,
    ).not.toBeNull();
  });

  it("derives usage from remaining percentage when used is absent", () => {
    expect(
      buildQuotaPaceForecast(
        createWeeklyWindow({ used: null, remaining: 50 }),
        SYNCED_AT,
        NOW,
      ),
    ).toMatchObject({ status: "on_track", usedPercent: 50 });
  });

  it.each([
    ["unknown_window", { kind: "unknown" }],
    ["missing_usage", { used: null, remaining: null }],
    ["invalid_usage", { used: 101 }],
    ["missing_reset", { resetAt: null }],
    ["invalid_reset", { resetAt: "not-a-date" }],
    ["expired_window", { resetAt: "2026-07-25T11:59:00.000Z" }],
    ["future_window", { resetAt: "2026-08-10T00:00:00.000Z" }],
  ] as const)("rejects %s windows", (reason, overrides) => {
    expect(
      buildQuotaPaceForecast(
        createWeeklyWindow(overrides as Partial<ProviderUsageWindow>),
        SYNCED_AT,
        NOW,
      ),
    ).toEqual({ status: "unavailable", reason });
  });

  it("rejects windows before the minimum elapsed gate", () => {
    expect(
      buildQuotaPaceForecast(
        createWeeklyWindow({ resetAt: "2026-08-01T11:55:00.000Z" }),
        SYNCED_AT,
        NOW,
      ),
    ).toEqual({ status: "unavailable", reason: "insufficient_elapsed" });
  });

  it("rejects missing, future, and stale snapshot clocks", () => {
    expect(
      buildQuotaPaceForecast(createWeeklyWindow(), "not-a-date", NOW),
    ).toEqual({ status: "unavailable", reason: "invalid_snapshot_time" });
    expect(
      buildQuotaPaceForecast(
        createWeeklyWindow(),
        "2026-07-25T12:01:00.000Z",
        NOW,
      ),
    ).toEqual({ status: "unavailable", reason: "stale_snapshot" });
    expect(
      buildQuotaPaceForecast(
        createWeeklyWindow(),
        "2026-07-25T11:00:00.000Z",
        NOW,
      ),
    ).toEqual({ status: "unavailable", reason: "stale_snapshot" });
  });

  it("returns only eligible forecasts and keeps the feature opt-in", () => {
    expect(
      buildAvailableQuotaPaceForecasts(
        [createWeeklyWindow(), createWeeklyWindow({ kind: "unknown" })],
        SYNCED_AT,
        NOW,
      ),
    ).toHaveLength(1);
    expect(normalizeQuotaPaceForecastEnabled(true)).toBe(true);
    expect(normalizeQuotaPaceForecastEnabled(false)).toBe(false);
    expect(normalizeQuotaPaceForecastEnabled("true")).toBe(false);
    expect(normalizeQuotaPaceForecastEnabled(undefined)).toBe(false);
  });
});
