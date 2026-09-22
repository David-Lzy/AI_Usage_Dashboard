import { describe, expect, it } from "vitest";
import type { ApiGatewayMeteringSnapshot, ApiGatewayUsageMetric } from "../providers/types";
import { buildApiGatewayMeteringLocalizedCopy } from "./api-gateway-metering-localized-copy";
import {
  buildCompactModels,
  buildLegendData,
  buildTrendData,
  formatDuration,
  formatMoney,
  formatReset,
  formatSelectedDateRange,
  getPrimaryMetric,
  sumMoney,
  sumNumbers,
} from "./api-gateway-metering-presentation";
import { formatUsageHistoryDate } from "./usage-history-date-format";

const money = (amount: number, unit = "USD") => ({ amount, unit });
const metric = (overrides: Partial<ApiGatewayUsageMetric> = {}): ApiGatewayUsageMetric => ({
  requests: 10, inputTokens: null, outputTokens: null, cacheCreationTokens: null,
  cacheReadTokens: null, totalTokens: 1000, actualCost: money(1), referenceCost: null,
  ...overrides,
});
const snapshot = (overrides: Partial<ApiGatewayMeteringSnapshot> = {}): ApiGatewayMeteringSnapshot => ({
  schemaVersion: 1, productKind: "metered_api_gateway", accountId: "account_fixture1",
  displayLabel: "Synthetic", origin: "https://example.test", transport: "https", scope: "api_key",
  billingMode: "wallet", capturedAt: "2026-09-22T10:00:00.000Z", stale: false, isValid: true,
  status: "active", planName: null, balance: money(40), remaining: null, quota: null,
  subscription: null, rateLimits: [], usage: null, modelUsage: [], modelSeriesTruncated: false,
  dailyUsage: [{ date: "2026-09-21", totals: metric() }, { date: "2026-09-22", totals: metric() }],
  ...overrides,
});

describe("pure gateway presentation", () => {
  it("preserves missing values and currency boundaries while summing", () => {
    expect(sumNumbers([])).toBeNull();
    expect(sumNumbers([1, null])).toBeNull();
    expect(sumNumbers([0, 2])).toBe(2);
    expect(sumMoney([])).toBeNull();
    expect(sumMoney([money(1), null])).toBeNull();
    expect(sumMoney([money(1), money(2, "EUR")])).toBeNull();
    expect(sumMoney([money(1), money(2)])).toEqual(money(3));
  });

  it("uses only explicit compatible finite limits for percentages", () => {
    const copy = buildApiGatewayMeteringLocalizedCopy("en");
    expect(getPrimaryMetric(snapshot(), copy, "en").percentUsed).toBeNull();
    const quota = { limit: money(100), used: money(40), remaining: null };
    expect(getPrimaryMetric(snapshot({ billingMode: "quota", quota }), copy, "en")).toMatchObject({ value: "$60", percentUsed: 40 });
    expect(getPrimaryMetric(snapshot({ billingMode: "quota", quota: { ...quota, used: money(40, "EUR") } }), copy, "en").percentUsed).toBeNull();
    expect(getPrimaryMetric(snapshot({ billingMode: "quota", quota: { ...quota, limit: money(0) } }), copy, "en").percentUsed).toBeNull();
  });

  it("rejects incomplete or mixed-unit trends instead of filling zero", () => {
    const state = snapshot();
    expect(buildTrendData(state, 7, "tokens", "Tokens")?.data.total).toBe(2000);
    state.dailyUsage[1].totals.totalTokens = null;
    expect(buildTrendData(state, 7, "tokens", "Tokens")).toBeNull();
    state.dailyUsage[1].totals.actualCost = money(1, "EUR");
    expect(buildTrendData(state, 7, "actual_spend", "Spend")).toBeNull();
    expect(buildTrendData(snapshot({ dailyUsage: [] }), 7, "requests", "Requests")).toBeNull();
  });

  it("limits the selected trend range without mutating source days", () => {
    const state = snapshot({ dailyUsage: Array.from({ length: 10 }, (_, index) => ({ date: `2026-09-${String(index + 10).padStart(2, "0")}`, totals: metric() })) });
    const result = buildTrendData(state, 7, "requests", "Requests");
    expect(result?.data.dates).toHaveLength(7);
    expect(result?.data.dates[0]).toBe("2026-09-13");
    expect(result?.data.total).toBe(70);
    expect(state.dailyUsage).toHaveLength(10);
  });

  it("bounds model composition and keeps the original ordering intact", () => {
    const models = [1, 3, 20, 76].map((value) => ({ id: `model-${value}`, label: `Model ${value}`, totals: metric({ totalTokens: value }) }));
    const before = structuredClone(models);
    const compact = buildCompactModels(models);
    expect(compact.map((model) => model.id)).toEqual(["model-76", "model-20", "other"]);
    expect(buildLegendData(compact).total).toBe(100);
    expect(models).toEqual(before);
  });

  it("preserves date-only semantics, unknown money units and unavailable resets", () => {
    expect(formatUsageHistoryDate("2026-09-22", "en")).toBe("Sep 22");
    expect(formatUsageHistoryDate("not-a-date", "en")).toBe("not-a-date");
    expect(formatSelectedDateRange(snapshot().dailyUsage, "en")).toContain("Sep 21");
    expect(formatSelectedDateRange([], "en")).toBeNull();
    expect(formatReset("not-a-date", "en")).toBeNull();
    expect(formatReset(null, "en")).toBeNull();
    expect(formatMoney(money(12, "credits"), "en")).toBe("12 credits");
    expect(formatMoney(null, "en")).toBeNull();
    expect(formatDuration(500, "en")).toBe("500 ms");
    expect(formatDuration(1500, "en")).toBe("1.5 s");
  });
});
