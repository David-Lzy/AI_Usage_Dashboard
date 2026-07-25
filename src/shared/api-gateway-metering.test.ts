import { describe, expect, it } from "vitest";

import type {
  ApiGatewayMeteringSnapshot,
  ApiGatewayUsageMetric,
} from "../providers/types";
import {
  MAX_API_GATEWAY_DAILY_BUCKETS,
  MAX_API_GATEWAY_MODEL_SERIES,
  buildApiGatewayModelBreakdownView,
  createDefaultApiGatewayMeteringDisplayPreferences,
  deriveApiGatewayReferenceSavings,
  moveApiGatewayMeteringModulePreference,
  normalizeApiGatewayMeteringDisplayPreferences,
  normalizeApiGatewayMeteringSnapshot,
  reorderApiGatewayMeteringModulePreference,
  setApiGatewayMeteringModuleVisibility,
} from "./api-gateway-metering";

function money(amount: number, unit = "USD") {
  return { amount, unit };
}

function metric(
  overrides: Partial<ApiGatewayUsageMetric> = {},
): ApiGatewayUsageMetric {
  return {
    requests: 12,
    inputTokens: 4_200,
    outputTokens: 900,
    cacheCreationTokens: 400,
    cacheReadTokens: 1_800,
    totalTokens: 7_300,
    referenceCost: money(1.25),
    actualCost: money(0.92),
    ...overrides,
  };
}

function snapshot(
  overrides: Partial<ApiGatewayMeteringSnapshot> = {},
): ApiGatewayMeteringSnapshot {
  return {
    schemaVersion: 1,
    accountId: "account_12345678",
    productKind: "metered_api_gateway",
    displayLabel: "Gateway 1",
    origin: "https://gateway.example.test",
    transport: "https",
    scope: "api_key",
    billingMode: "wallet",
    capturedAt: "2026-07-25T10:00:00.000Z",
    stale: false,
    isValid: true,
    status: "active",
    planName: "Wallet",
    remaining: money(18.75),
    balance: money(18.75),
    quota: null,
    subscription: null,
    rateLimits: [],
    usage: {
      today: metric(),
      total: metric({ requests: 80, totalTokens: 44_700 }),
      averageDurationMs: 1_840,
      requestsPerMinute: 2,
      tokensPerMinute: 1_450,
    },
    dailyUsage: [],
    modelUsage: [],
    modelSeriesTruncated: false,
    ...overrides,
  };
}

describe("API gateway metering normalization", () => {
  it("preserves scope, unknown units, windows, and model labels", () => {
    const normalized = normalizeApiGatewayMeteringSnapshot(
      snapshot({
        origin: "http://gateway.example.test/dashboard",
        transport: "https",
        remaining: money(42, "TOK"),
        rateLimits: [
          {
            id: "future-9d",
            limit: money(50),
            used: money(8),
            remaining: money(42),
            windowStart: "2026-07-20T00:00:00.000Z",
            resetAt: "2026-07-29T00:00:00.000Z",
          },
        ],
        dailyUsage: [
          { date: "2026-07-25", totals: metric() },
          { date: "2026-07-24", totals: metric({ requests: 8 }) },
        ],
        modelUsage: [
          {
            id: "unknown-model-v9",
            label: "Unknown Model V9",
            totals: metric(),
          },
        ],
      }),
    );

    expect(normalized).toMatchObject({
      accountId: "account_12345678",
      scope: "api_key",
      origin: "http://gateway.example.test",
      transport: "http",
      remaining: { amount: 42, unit: "TOK" },
      rateLimits: [{ id: "future-9d" }],
      modelUsage: [{ label: "Unknown Model V9" }],
    });
    expect(normalized?.dailyUsage.map((day) => day.date)).toEqual([
      "2026-07-24",
      "2026-07-25",
    ]);
  });

  it.each([
    ["wallet", { balance: money(12) }],
    ["quota", { quota: { limit: money(50), used: money(18), remaining: money(32) } }],
    [
      "subscription",
      {
        subscription: {
          dailyUsage: money(2),
          weeklyUsage: money(11),
          monthlyUsage: money(37),
          dailyLimit: money(10),
          weeklyLimit: money(60),
          monthlyLimit: money(200),
          expiresAt: "2026-08-25T00:00:00.000Z",
        },
      },
    ],
    ["unrestricted", {}],
  ] as const)("normalizes %s billing mode independently", (billingMode, values) => {
    expect(
      normalizeApiGatewayMeteringSnapshot(
        snapshot({
          billingMode,
          balance: null,
          quota: null,
          subscription: null,
          ...values,
        }),
      )?.billingMode,
    ).toBe(billingMode);
  });

  it("accepts partial, empty, stale account-scope snapshots without false zeros", () => {
    expect(
      normalizeApiGatewayMeteringSnapshot(
        snapshot({
          scope: "account",
          billingMode: null,
          stale: true,
          isValid: null,
          status: null,
          planName: null,
          remaining: null,
          balance: null,
          usage: null,
        }),
      ),
    ).toMatchObject({
      scope: "account",
      billingMode: null,
      stale: true,
      isValid: null,
      balance: null,
      usage: null,
      dailyUsage: [],
      modelUsage: [],
    });
  });

  it("rejects duplicate dates and invalid numeric fields", () => {
    const duplicateDay = { date: "2026-07-25", totals: metric() };
    expect(
      normalizeApiGatewayMeteringSnapshot(
        snapshot({ dailyUsage: [duplicateDay, duplicateDay] }),
      ),
    ).toBeUndefined();
    expect(
      normalizeApiGatewayMeteringSnapshot(
        snapshot({ usage: { ...snapshot().usage!, averageDurationMs: -1 } }),
      ),
    ).toBeUndefined();
    expect(
      normalizeApiGatewayMeteringSnapshot(
        snapshot({
          usage: {
            ...snapshot().usage!,
            today: metric({ totalTokens: Number.POSITIVE_INFINITY }),
          },
        }),
      ),
    ).toBeUndefined();
    expect(
      normalizeApiGatewayMeteringSnapshot(
        snapshot({ balance: money(1_000_000_000_001) }),
      ),
    ).toBeUndefined();
  });

  it("keeps the latest 31 days and the 16 highest-volume model series", () => {
    const dailyUsage = Array.from({ length: 40 }, (_, index) => ({
      date: `2026-${index < 30 ? "06" : "07"}-${String((index % 30) + 1).padStart(2, "0")}`,
      totals: metric({ requests: index }),
    }));
    const modelUsage = Array.from({ length: 20 }, (_, index) => ({
      id: `model-${index}`,
      label: `Model ${index}`,
      totals: metric({ totalTokens: index }),
    }));
    const normalized = normalizeApiGatewayMeteringSnapshot(
      snapshot({ dailyUsage, modelUsage }),
    );

    expect(normalized?.dailyUsage).toHaveLength(MAX_API_GATEWAY_DAILY_BUCKETS);
    expect(normalized?.modelUsage).toHaveLength(MAX_API_GATEWAY_MODEL_SERIES);
    expect(normalized?.modelUsage[0]?.id).toBe("model-19");
    expect(normalized?.modelSeriesTruncated).toBe(true);
  });
});

describe("API gateway metering view helpers", () => {
  it("derives reference savings only for matching units and never below zero", () => {
    expect(deriveApiGatewayReferenceSavings(metric())).toEqual(money(0.33));
    expect(
      deriveApiGatewayReferenceSavings(
        metric({ referenceCost: money(1, "USD"), actualCost: money(2, "USD") }),
      ),
    ).toEqual(money(0));
    expect(
      deriveApiGatewayReferenceSavings(
        metric({ referenceCost: money(2, "USD"), actualCost: money(1, "TOK") }),
      ),
    ).toBeNull();
  });

  it("merges only presentation overflow into Other", () => {
    const models = Array.from({ length: 5 }, (_, index) => ({
      id: `model-${index}`,
      label: `Model ${index}`,
      totals: metric({ requests: index + 1, totalTokens: (index + 1) * 100 }),
    }));
    const view = buildApiGatewayModelBreakdownView(models, 3);

    expect(view.map((item) => item.id)).toEqual(["model-0", "model-1", "other"]);
    expect(view[2]?.totals.requests).toBe(12);
    expect(models).toHaveLength(5);
  });
});

describe("API gateway metering display preferences", () => {
  it("keeps account-local order and appends missing modules safely", () => {
    const normalized = normalizeApiGatewayMeteringDisplayPreferences({
      popup: [
        { id: "trend", visible: false },
        { id: "summary", visible: true },
      ],
    });

    expect(normalized.popup).toEqual([
      { id: "trend", visible: false },
      { id: "summary", visible: true },
      { id: "model_breakdown", visible: true },
      { id: "limit_windows", visible: true },
    ]);
    expect(normalized.sidebar).toEqual(
      createDefaultApiGatewayMeteringDisplayPreferences().sidebar,
    );
  });

  it("updates visibility and ordering without mutating other surfaces", () => {
    const defaults = createDefaultApiGatewayMeteringDisplayPreferences();
    const hidden = setApiGatewayMeteringModuleVisibility(
      defaults,
      "popup",
      "trend",
      false,
    );
    const reordered = reorderApiGatewayMeteringModulePreference(
      hidden,
      "popup",
      "limit_windows",
      "summary",
    );
    const moved = moveApiGatewayMeteringModulePreference(
      reordered,
      "popup",
      "trend",
      "up",
    );

    expect(moved.popup).toEqual([
      { id: "limit_windows", visible: true },
      { id: "trend", visible: false },
      { id: "summary", visible: true },
      { id: "model_breakdown", visible: true },
    ]);
    expect(moved.sidebar).toEqual(defaults.sidebar);
    expect(defaults.popup[1]).toEqual({ id: "trend", visible: true });
  });
});
