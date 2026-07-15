import { describe, expect, it } from "vitest";
import usageBillingFixture from "../../fixtures/cursor/usage-billing.fixture.json";
import type { CursorUsageBillingContractFixture } from "../providers/cursor/usage-billing-contract";
import {
  buildCursorUsageBillingFromContract,
  mergeCursorUsageBilling,
  normalizeCursorUsageBilling,
} from "./cursor-usage-billing";

const fixture = usageBillingFixture as CursorUsageBillingContractFixture;

describe("Cursor usage billing normalization", () => {
  it("builds separate billing pools and daily aggregate history", () => {
    const result = buildCursorUsageBillingFromContract(
      {
        usageSummary: fixture.usageSummary,
        planInfo: fixture.planInfo,
        hardLimit: fixture.hardLimit,
        usageEvents: fixture.usageEvents,
      },
      fixture.capturedAt,
    );

    expect(result?.plan).toMatchObject({
      usedCents: 4200,
      limitCents: 10000,
      includedUsageCents: 4000,
      bonusUsageCents: 200,
      totalPercentUsed: 42,
    });
    expect(result?.planIncludedAmountCents).toBe(10000);
    expect(result?.onDemand).toMatchObject({
      enabled: true,
      usedCents: 350,
      limitCents: 2000,
    });
    expect(result?.history).toMatchObject({
      rangeStart: "2026-07-14",
      rangeEnd: "2026-07-15",
      sourceEventCount: 2,
      capturedEventCount: 2,
      complete: true,
    });
    expect(result?.history?.days[0]?.totals).toEqual({
      requests: 1,
      inputTokens: 1200,
      outputTokens: 300,
      cacheReadTokens: 500,
      apiValueCents: 12,
      chargedCents: 0,
    });
    expect(result?.history?.days[1]?.totals.chargedCents).toBe(20);
  });

  it("does not retain raw event or account fields", () => {
    const result = buildCursorUsageBillingFromContract(
      {
        usageSummary: fixture.usageSummary,
        planInfo: fixture.planInfo,
        hardLimit: fixture.hardLimit,
        usageEvents: fixture.usageEvents,
      },
      fixture.capturedAt,
    );
    const serialized = JSON.stringify(result);

    expect(serialized).not.toMatch(
      /timestamp|owningUser|serviceAccountId|conversationId|subscriptionProductId/i,
    );
  });

  it("rejects malformed stored values instead of inventing zeroes", () => {
    expect(normalizeCursorUsageBilling({ capturedAt: "invalid" })).toBeUndefined();
    expect(
      normalizeCursorUsageBilling({
        capturedAt: fixture.capturedAt,
        billingCapturedAt: fixture.capturedAt,
        plan: {
          enabled: true,
          usedCents: -1,
          limitCents: 100,
        },
      }),
    ).toBeUndefined();
  });

  it("preserves unknown event metrics instead of converting them to zero", () => {
    const result = buildCursorUsageBillingFromContract(
      {
        usageSummary: null,
        planInfo: null,
        hardLimit: null,
        usageEvents: {
          totalUsageEventsCount: 1,
          usageEventsDisplay: [{
            ...fixture.usageEvents.usageEventsDisplay[0],
            tokenUsage: null,
            chargedCents: null,
            isChargeable: true,
          }],
        },
      },
      fixture.capturedAt,
    );

    expect(result?.history?.days[0]?.totals).toMatchObject({
      requests: 1,
      inputTokens: null,
      outputTokens: null,
      cacheReadTokens: null,
      apiValueCents: null,
      chargedCents: null,
    });
  });

  it("preserves the last good section when a partial refresh omits it", () => {
    const complete = buildCursorUsageBillingFromContract(
      {
        usageSummary: fixture.usageSummary,
        planInfo: fixture.planInfo,
        hardLimit: fixture.hardLimit,
        usageEvents: fixture.usageEvents,
      },
      fixture.capturedAt,
    );
    const billingOnly = buildCursorUsageBillingFromContract(
      {
        usageSummary: fixture.usageSummary,
        planInfo: fixture.planInfo,
        hardLimit: fixture.hardLimit,
        usageEvents: null,
      },
      "2026-07-16T00:00:00.000Z",
    );
    const merged = mergeCursorUsageBilling(billingOnly, complete);

    expect(merged?.billingCapturedAt).toBe("2026-07-16T00:00:00.000Z");
    expect(merged?.historyCapturedAt).toBe(fixture.capturedAt);
    expect(merged?.history?.days).toHaveLength(2);
  });
});
