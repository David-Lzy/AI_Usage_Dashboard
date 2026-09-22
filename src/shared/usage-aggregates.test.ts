import { describe, expect, it } from "vitest";
import type { ApiGatewayMeteringSnapshot, ApiGatewayUsageMetric, AppState } from "../providers/types";
import { DEFAULT_APP_STATE } from "./constants";
import { addInactiveProviderAccount, getProviderAccountRuntime } from "./provider-accounts";
import { buildGatewayComparison, getDefaultGatewayRange, usageRangeDayCount, aggregateFreshness } from "./usage-aggregates";

const ID = "sub2api-api-key";
const B = "account_comparison-b";
const now = new Date("2026-09-22T12:00:00Z");
const range = { start: "2026-09-20", end: "2026-09-21" };
const capture = "2026-09-22T11:50:00Z";
function metric(requests: number | null = 5, unit = "USD"): ApiGatewayUsageMetric {
  return { requests, totalTokens: 50, inputTokens: 20, outputTokens: 30, cacheReadTokens: null, cacheCreationTokens: null, actualCost: { amount: 1, unit }, referenceCost: { amount: 2, unit } };
}
function metering(accountId: string): ApiGatewayMeteringSnapshot {
  return { schemaVersion: 1, accountId, productKind: "metered_api_gateway", displayLabel: "Synthetic", origin: "https://gateway.example.test", transport: "https", scope: "api_key", billingMode: "wallet", capturedAt: capture,
    stale: false, isValid: true, status: "active", planName: null, remaining: null, balance: null, quota: null, subscription: null, rateLimits: [], usage: null,
    dailyUsage: [{ date: range.start, totals: metric(0) }, { date: range.end, totals: metric() }], modelUsage: [], modelSeriesTruncated: false,
    dailyUsageContext: { capturedAt: capture, requestedTimezone: "UTC", bucketTimezone: "UTC" } };
}
function state(): AppState {
  const result = structuredClone(DEFAULT_APP_STATE);
  const snapshot = result.providers.find((entry) => entry.providerId === ID)!;
  const setting = result.providerSettings.find((entry) => entry.id === ID)!;
  Object.assign(snapshot, { syncStatus: "ok", lastSuccessAt: capture, apiGatewayMetering: metering("default") });
  Object.assign(setting, { status: "granted", credentialStatus: "configured" });
  return addInactiveProviderAccount(result, { providerId: ID, accountId: B, label: "Second", snapshot: { ...snapshot, apiGatewayMetering: metering(B) }, setting });
}

describe("gateway aggregate comparison", () => {
  it("adds matched observed metrics without treating unknown token classes as zero", () => {
    const source = state();
    const before = structuredClone(source);
    const result = buildGatewayComparison(source, range, now);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].metrics.requests).toEqual({ value: 5, unit: "requests", currency: null, complete: true });
    expect(result.rows[0].metrics.actualCost).toMatchObject({ value: 2, currency: "USD", complete: true });
    expect(result.rows[0].metrics.cacheReadTokens.value).toBeNull();
    expect(result.metricReasons.requests).toEqual([]);
    expect(result.metricReasons.cacheReadTokens).toEqual(expect.arrayContaining(["missing", "partial"]));
    expect(source).toEqual(before);
    expect(getDefaultGatewayRange(source)).toEqual(range);
  });
  it("distinguishes partial observed subtotals, no-data and genuine zero", () => {
    const source = state();
    const target = getProviderAccountRuntime(source, ID, B)!;
    target.snapshot.apiGatewayMetering!.dailyUsage.pop();
    const result = buildGatewayComparison(source, range, now);
    expect(result.rows[1].metrics.requests).toMatchObject({ value: 0, complete: false });
    expect(result.rows[1].coverage).toMatchObject({ observedDays: 1, selectedDays: 2 });
    expect(result.metricReasons.requests).toContain("partial");
    target.snapshot.apiGatewayMetering!.dailyUsage = [];
    expect(buildGatewayComparison(source, range, now).rows[1].metrics.requests.value).toBeNull();
  });
  it("does not convert mixed currencies or compare different source timezones", () => {
    const source = state();
    const second = getProviderAccountRuntime(source, ID, B)!.snapshot.apiGatewayMetering!;
    second.dailyUsage = second.dailyUsage.map((entry) => ({ ...entry, totals: metric(5, "EUR") }));
    expect(buildGatewayComparison(source, range, now).metricReasons.actualCost).toContain("currency");
    expect(buildGatewayComparison(source, range, now).metricReasons.requests).not.toContain("currency");
    second.dailyUsage[0].totals.actualCost!.unit = "USD";
    expect(buildGatewayComparison(source, range, now).rows[1].metrics.actualCost.value).toBeNull();
    second.dailyUsageContext!.bucketTimezone = "Asia/Tokyo";
    expect(buildGatewayComparison(source, range, now).metricReasons.requests).toContain("time_basis");
  });
  it("never substitutes request timezone or newest top-level capture for unknown historical provenance", () => {
    const source = state();
    const first = getProviderAccountRuntime(source, ID, "default")!.snapshot.apiGatewayMetering!;
    delete first.dailyUsageContext;
    let result = buildGatewayComparison(source, range, now);
    expect(result.rows[0]).toMatchObject({ freshness: "unknown", timezone: null, capturedAt: null });
    first.dailyUsageContext = { requestedTimezone: "UTC", bucketTimezone: null, capturedAt: "2026-09-22T09:50:00Z" };
    result = buildGatewayComparison(source, range, now);
    expect(result.rows[0]).toMatchObject({ freshness: "stale", timezone: null, requestedTimezone: "UTC" });
    expect(result.metricReasons.requests).toEqual(expect.arrayContaining(["time_basis", "stale"]));
  });
  it("keeps failed rows visible and ignores deleted caches and mismatched accounts", () => {
    const source = state();
    getProviderAccountRuntime(source, ID, B)!.snapshot.syncStatus = "error";
    expect(buildGatewayComparison(source, range, now).rows[1]).toMatchObject({ freshness: "stale", syncStatus: "error" });
    getProviderAccountRuntime(source, ID, B)!.snapshot.apiGatewayMetering!.accountId = "default";
    expect(buildGatewayComparison(source, range, now).rows[1].metrics.requests.value).toBeNull();
    source.providerAccounts![ID]!.accounts = source.providerAccounts![ID]!.accounts.filter((account) => account.id !== B);
    const result = buildGatewayComparison(source, range, now);
    expect(result.rows).toHaveLength(1);
    expect(result.metricReasons.requests).toContain("one_account");
  });
  it("validates closed-day intervals, invalid dates, unknown and future captures", () => {
    expect(usageRangeDayCount({ start: "2024-02-28", end: "2024-03-01" })).toBe(3);
    expect(usageRangeDayCount({ start: "2026-02-29", end: "2026-03-01" })).toBe(0);
    expect(usageRangeDayCount({ start: "2026-03-02", end: "2026-03-01" })).toBe(0);
    expect(usageRangeDayCount({ start: "2020-01-01", end: "2026-03-01" })).toBe(0);
    expect(buildGatewayComparison(state(), { start: "invalid", end: range.end }, now).rangeValid).toBe(false);
    expect(buildGatewayComparison(state(), { start: range.start, end: "2026-09-22" }, now).metricReasons.requests).toContain("open_day");
    expect(aggregateFreshness("2026-09-22T13:00:00Z", false, now)).toBe("unknown");
    expect(aggregateFreshness(null, true, now)).toBe("unknown");
  });
});
