import { describe, expect, it } from "vitest";

import {
  CCUSAGE_DAILY_MAX_DAYS,
  convertCcusageDailyExport,
} from "./ccusage-daily-converter.mjs";

const MTIME = new Date("2026-09-23T01:02:03.000Z");

function dailyRow(overrides = {}) {
  return {
    date: "2026-09-20",
    inputTokens: 10,
    outputTokens: 20,
    cacheCreationTokens: 30,
    cacheReadTokens: 40,
    totalTokens: 100,
    totalCost: 1.25,
    ...overrides,
  };
}

function convert(daily, totals = {}) {
  return convertCcusageDailyExport(
    { daily, totals },
    { sourceId: "custom:ccusage", label: "ccusage daily", mtime: MTIME },
  );
}

describe("ccusage daily converter", () => {
  it("converts documented standard and unified period rows without retaining raw details", () => {
    const unifiedRow = dailyRow({
      inputTokens: 1,
      outputTokens: 2,
      cacheCreationTokens: 3,
      cacheReadTokens: 4,
      totalTokens: 10,
      totalCost: 0.75,
      accountId: "secret-account-sentinel",
      modelBreakdowns: [{ modelName: "secret-model-sentinel" }],
    });
    delete unifiedRow.date;
    unifiedRow.period = "2026-09-21";
    const payload = convert(
      [
        dailyRow({ date: "2026-09-20", modelBreakdowns: [{ missingPricing: false }] }),
        unifiedRow,
      ],
      { unpricedModels: [] },
    );

    expect(payload).toMatchObject({
      schema: "ai-usage-dashboard.custom-source.v1",
      id: "custom:ccusage",
      label: "ccusage daily",
      description: "Converted from an explicit ccusage daily JSON export.",
      status: "ok",
      syncedAt: MTIME.toISOString(),
      windows: [
        { label: "Input tokens", used: 11 },
        { label: "Output tokens", used: 22 },
        { label: "Cache creation tokens", used: 33 },
        { label: "Cache read tokens", used: 44 },
        { label: "Total tokens", used: 110 },
      ],
      balances: [{ label: "Estimated USD cost", unit: "USD", used: 2 }],
      facts: [
        { label: "Date range", value: "2026-09-20 to 2026-09-21" },
        { label: "Coverage", value: "2 days" },
        { label: "Export modified", value: MTIME.toISOString() },
      ],
    });
    expect(JSON.stringify(payload)).not.toContain("secret-");
    expect(payload).not.toHaveProperty("daily");
    expect(payload).not.toHaveProperty("totals");
  });

  it("keeps genuine zero cost only when every row is priced", () => {
    expect(convert([dailyRow({ totalCost: 0 })])).toMatchObject({
      status: "ok",
      balances: [{ label: "Estimated USD cost", used: 0 }],
    });
  });

  it("marks no-cost and missing-pricing exports as unknown instead of zero", () => {
    const noCostRow = dailyRow();
    delete noCostRow.totalCost;
    for (const payload of [
      convert([noCostRow]),
      convert([dailyRow()], { unpricedModels: ["secret-model-sentinel"] }),
      convert([dailyRow({ modelBreakdowns: [{ missingPricing: true }] })]),
    ]) {
      expect(payload).toMatchObject({ status: "warning", balances: [] });
      expect(payload.warningReason).toMatch(/Estimated USD cost/u);
      expect(JSON.stringify(payload)).not.toContain("secret-model-sentinel");
    }
  });

  it("allows an empty documented export without fabricating token or cost zeroes", () => {
    const payload = convert([], {});
    expect(payload).toMatchObject({ status: "warning", windows: [], balances: [] });
    expect(payload.facts).toEqual(
      expect.arrayContaining([
        { label: "Date range", value: "No observed days" },
        { label: "Coverage", value: "0 days" },
      ]),
    );
  });

  it("bounds its custom-source display fields", () => {
    const payload = convertCcusageDailyExport(
      { daily: [dailyRow()], totals: {} },
      { sourceId: "custom:ccusage", label: "x".repeat(81), mtime: MTIME },
    );
    expect(payload.label).toHaveLength(80);
    expect(payload.description.length).toBeLessThanOrEqual(180);
    expect(payload.facts.length).toBeLessThanOrEqual(16);
  });

  it("rejects unsupported shapes, duplicate or invalid dates, and invalid token values", () => {
    expect(() => convertCcusageDailyExport({ data: [] }, {})).toThrow(/daily rows/u);
    expect(() => convert([dailyRow({ date: "2026-02-30" })])).toThrow(/date or period/u);
    expect(() => convert([dailyRow(), dailyRow()])).toThrow(/unique/u);
    expect(() => convert([dailyRow({ inputTokens: 1.5 })])).toThrow(/safe integer/u);
    expect(() => convert([dailyRow({ totalTokens: 99 })])).toThrow(/equal/u);
    expect(() => convert([dailyRow({ date: "2026-09-20", period: "2026-09-20" })])).toThrow(
      /exactly one/u,
    );
  });

  it("bounds the documented daily row count", () => {
    const daily = Array.from({ length: CCUSAGE_DAILY_MAX_DAYS + 1 }, (_, index) => ({
      ...dailyRow({ date: `2026-01-${String((index % 31) + 1).padStart(2, "0")}` }),
    }));
    expect(() => convert(daily)).toThrow(/at most/u);
  });
});
