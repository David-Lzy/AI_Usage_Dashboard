import { describe, expect, it } from "vitest";
import { getUsagePeriodRange, getUsagePeriodReferenceTimezone, buildUsagePeriodSummary } from "./usage-periods";
import type { UsageExportResult, UsageExportRow } from "./usage-export";

function row(date: string, value: number | null, overrides: Partial<UsageExportRow> = {}): UsageExportRow {
  return { schema_version: 1, provider: "sub2api-api-key", account: "account-1", account_label: "Local", family: "gateway_daily", date, series: "", metric: "requests", value, unit: "requests", currency: "",
    range_start: "2026-09-20", range_end: "2026-09-21", coverage_start: "2026-09-20", coverage_end: "2026-09-21", observed_days: 2, selected_days: 2, source_timezone: "unknown", requested_timezone: "UTC", captured_at: "2026-09-22T00:00:00Z", freshness: "stale", ...overrides };
}
function report(rows: UsageExportRow[]): UsageExportResult {
  return { status: "ready", rows, coverage: { start: "2026-09-20", end: "2026-09-21", observedDays: 2, selectedDays: 2 }, capturedAt: "2026-09-22T00:00:00Z", freshness: "stale", sourceTimezone: null, requestedTimezone: "UTC", csv: "", filename: "" };
}

describe("source-date period ranges", () => {
  it.each([
    ["2026-09-21T12:00:00Z", "2026-09-21", "2026-09-21"],
    ["2026-09-27T23:59:59Z", "2026-09-21", "2026-09-27"],
    ["2027-01-01T12:00:00Z", "2026-12-28", "2027-01-01"],
  ])("starts %s week on Monday", (now, start, end) => {
    expect(getUsagePeriodRange("this_week", new Date(now), "UTC")).toEqual({ start, end });
  });
  it("keeps leap-day and month/year boundaries in calendar space", () => {
    expect(getUsagePeriodRange("this_month", new Date("2024-02-29T23:00:00Z"))).toEqual({ start: "2024-02-01", end: "2024-02-29" });
    expect(getUsagePeriodRange("last_7_days", new Date("2024-03-01T12:00:00Z"))).toEqual({ start: "2024-02-24", end: "2024-03-01" });
    expect(getUsagePeriodRange("last_30_days", new Date("2027-01-01T12:00:00Z"))).toEqual({ start: "2026-12-03", end: "2027-01-01" });
  });
  it("resolves source civil dates before DST-safe day arithmetic", () => {
    expect(getUsagePeriodRange("last_7_days", new Date("2026-03-09T03:30:00Z"), "America/New_York")).toEqual({ start: "2026-03-02", end: "2026-03-08" });
    expect(getUsagePeriodRange("this_week", new Date("2026-11-02T04:30:00Z"), "America/New_York")).toEqual({ start: "2026-10-26", end: "2026-11-01" });
    expect(getUsagePeriodRange("this_month", new Date("2026-09-30T16:00:00Z"), "Asia/Tokyo")).toEqual({ start: "2026-10-01", end: "2026-10-01" });
  });
  it("uses an explicit UTC range reference, not a guessed source/request timezone", () => {
    expect(getUsagePeriodReferenceTimezone(null)).toBe("UTC");
    expect(getUsagePeriodReferenceTimezone("Invalid/Zone")).toBe("UTC");
    expect(getUsagePeriodReferenceTimezone("America/New_York")).toBe("America/New_York");
    expect(getUsagePeriodRange("this_week", new Date("2026-09-21T00:30:00Z"), null)).toEqual({ start: "2026-09-21", end: "2026-09-21" });
  });
});

describe("observed usage period summaries", () => {
  it("sums additive metrics with observed coverage, keeps zero, and does not mutate export rows", () => {
    const input = report([row("2026-09-21", 5), row("2026-09-20", 0)]), before = structuredClone(input);
    expect(buildUsagePeriodSummary(input)).toEqual([{ metric: "requests", series: "", unit: "requests", currency: "", value: 5, kind: "observed_total", observedDays: 2, selectedDays: 2, complete: true, firstDate: "2026-09-20", lastDate: "2026-09-21", ambiguous: false }]);
    expect(input).toEqual(before);
  });
  it("never fills absent/null measurements with zero and exposes gaps", () => {
    expect(buildUsagePeriodSummary(report([row("2026-09-20", 0), row("2026-09-21", null)]))[0]).toMatchObject({ value: 0, observedDays: 1, complete: false });
    expect(buildUsagePeriodSummary(report([row("2026-09-20", null)]))[0]).toMatchObject({ value: null, observedDays: 0, complete: false });
    expect(buildUsagePeriodSummary({ ...report([]), status: "empty" })).toEqual([]);
  });
  it("does not combine currencies, units, distinct series or actual/reference prices", () => {
    const money = { metric: "actual_cost", unit: "currency", currency: "USD" };
    const result = buildUsagePeriodSummary(report([
      row("2026-09-20", 1, money), row("2026-09-21", 2, { ...money, currency: "EUR" }),
      row("2026-09-20", 8, { ...money, metric: "reference_cost" }),
      row("2026-09-20", 10, { metric: "turns", unit: "turns", series: "Model A" }),
      row("2026-09-20", 20, { metric: "turns", unit: "turns", series: "Model B" }),
    ]));
    expect(result).toHaveLength(5);
    expect(result.map((item) => item.value)).toEqual([1, 2, 8, 10, 20]);
    expect(result.every((item) => !item.complete)).toBe(true);
  });
  it("uses the latest percentage observation with its date, never its sum or mean", () => {
    const percentage = { family: "personal_usage_by_surface" as const, metric: "usage_percent", unit: "percent", series: "Extension" };
    const result = buildUsagePeriodSummary(report([row("2026-09-20", 25, percentage), row("2026-09-21", 35, percentage)]))[0];
    expect(result).toMatchObject({ value: 35, kind: "latest_observation", lastDate: "2026-09-21" });
    expect(buildUsagePeriodSummary(report([row("2026-09-20", 25, percentage), row("2026-09-21", null, percentage)]))[0].value).toBeNull();
  });
  it("does not sum ambiguous duplicate date/label groups or overflow counts", () => {
    expect(buildUsagePeriodSummary(report([row("2026-09-20", 3), row("2026-09-20", 4)]))[0]).toMatchObject({ value: null, ambiguous: true, complete: false });
    expect(buildUsagePeriodSummary(report([row("2026-09-20", Number.MAX_SAFE_INTEGER), row("2026-09-21", 1)]))[0].value).toBeNull();
  });
});
