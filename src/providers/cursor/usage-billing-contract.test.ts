import { describe, expect, it } from "vitest";
import usageBillingFixture from "../../../fixtures/cursor/usage-billing.fixture.json";
import {
  CURSOR_FILTERED_USAGE_EVENTS_PATH,
  CURSOR_HARD_LIMIT_PATH,
  CURSOR_PLAN_INFO_PATH,
  CURSOR_USAGE_BILLING_PATHS,
  CURSOR_USAGE_SUMMARY_PATH,
  extractCursorObservedUsageBillingContract,
  isCursorUsageBillingUrl,
  mergeCursorObservedUsageBillingContracts,
  parseCursorFilteredUsageEventsBodyText,
  type CursorUsageBillingContractFixture,
} from "./usage-billing-contract";

describe("Cursor usage and billing contract", () => {
  it("matches only the verified structured billing paths", () => {
    expect(CURSOR_USAGE_BILLING_PATHS).toEqual([
      CURSOR_USAGE_SUMMARY_PATH,
      CURSOR_PLAN_INFO_PATH,
      CURSOR_HARD_LIMIT_PATH,
      CURSOR_FILTERED_USAGE_EVENTS_PATH,
    ]);
    expect(
      isCursorUsageBillingUrl(
        `https://cursor.com${CURSOR_FILTERED_USAGE_EVENTS_PATH}`,
      ),
    ).toBe(true);
    expect(isCursorUsageBillingUrl("https://cursor.com/api/auth/me")).toBe(
      false,
    );
  });

  it("keeps its fixture synthetic and limited to aggregate-safe fields", () => {
    const fixture = usageBillingFixture as CursorUsageBillingContractFixture;
    const serialized = JSON.stringify(fixture);

    expect(fixture.usageSummary.individualUsage.plan).toMatchObject({
      enabled: true,
      used: 4200,
      limit: 10000,
      totalPercentUsed: 42,
    });
    expect(fixture.usageEvents.usageEventsDisplay[0]).toMatchObject({
      model: "cursor-model-a",
      kind: "Included",
      isTokenBasedCall: true,
    });
    expect(serialized).not.toMatch(
      /cookie|authorization|account_id|user_id|owningUser|email|serviceAccountId|conversationId|subscriptionProductId/i,
    );
  });

  it("allowlists fields while parsing observed JSON responses", () => {
    const fixture = usageBillingFixture as CursorUsageBillingContractFixture;
    const contract = extractCursorObservedUsageBillingContract([
      {
        url: `https://cursor.com${CURSOR_USAGE_SUMMARY_PATH}`,
        ok: true,
        bodyText: JSON.stringify({
          ...fixture.usageSummary,
          accountId: "must-not-survive",
        }),
      },
      {
        url: `https://cursor.com${CURSOR_PLAN_INFO_PATH}`,
        ok: true,
        bodyText: JSON.stringify(fixture.planInfo),
      },
      {
        url: `https://cursor.com${CURSOR_HARD_LIMIT_PATH}`,
        ok: true,
        bodyText: JSON.stringify(fixture.hardLimit),
      },
      {
        url: `https://cursor.com${CURSOR_FILTERED_USAGE_EVENTS_PATH}`,
        ok: true,
        bodyText: JSON.stringify({
          ...fixture.usageEvents,
          usageEventsDisplay: fixture.usageEvents.usageEventsDisplay.map(
            (event) => ({
              ...event,
              owningUser: "private@example.com",
              serviceAccountId: "private-service",
              conversationId: "private-conversation",
              subscriptionProductId: "private-product",
            }),
          ),
        }),
      },
    ]);
    const serialized = JSON.stringify(contract);

    expect(contract?.usageSummary?.individualUsage.plan?.breakdown).toEqual({
      included: 4000,
      bonus: 200,
      total: 4200,
    });
    expect(contract?.usageEvents?.usageEventsDisplay).toHaveLength(2);
    expect(serialized).not.toMatch(
      /accountId|owningUser|private@example|serviceAccountId|conversationId|subscriptionProductId|must-not-survive/i,
    );
  });

  it("rejects malformed and failed responses without inventing values", () => {
    expect(
      extractCursorObservedUsageBillingContract([
        {
          url: `https://cursor.com${CURSOR_USAGE_SUMMARY_PATH}`,
          ok: false,
          bodyText: "{}",
        },
        {
          url: `https://cursor.com${CURSOR_FILTERED_USAGE_EVENTS_PATH}`,
          ok: true,
          bodyText: "not-json",
        },
      ]),
    ).toBeNull();
  });

  it("merges bounded paginated usage events without duplicating rows", () => {
    const fixture = usageBillingFixture as CursorUsageBillingContractFixture;
    const firstPage = parseCursorFilteredUsageEventsBodyText(
      JSON.stringify({
        totalUsageEventsCount: 3,
        usageEventsDisplay: [fixture.usageEvents.usageEventsDisplay[0]],
      }),
    );
    const secondPage = parseCursorFilteredUsageEventsBodyText(
      JSON.stringify({
        totalUsageEventsCount: 3,
        usageEventsDisplay: [
          fixture.usageEvents.usageEventsDisplay[0],
          fixture.usageEvents.usageEventsDisplay[1],
        ],
      }),
    );
    const merged = mergeCursorObservedUsageBillingContracts([
      {
        usageSummary: fixture.usageSummary,
        planInfo: null,
        hardLimit: null,
        usageEvents: firstPage,
      },
      {
        usageSummary: null,
        planInfo: fixture.planInfo,
        hardLimit: fixture.hardLimit,
        usageEvents: secondPage,
      },
    ]);

    expect(merged).toMatchObject({
      usageSummary: fixture.usageSummary,
      planInfo: fixture.planInfo,
      hardLimit: fixture.hardLimit,
    });
    expect(merged?.usageEvents).toMatchObject({
      totalUsageEventsCount: 3,
    });
    expect(merged?.usageEvents?.usageEventsDisplay).toHaveLength(2);
    expect(parseCursorFilteredUsageEventsBodyText("not-json")).toBeNull();
  });
});
