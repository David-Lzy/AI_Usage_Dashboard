import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { CursorUsageBilling } from "../../providers/types";
import { buildCursorUsageLocalizedCopy } from "../cursor-usage-localized-copy";
import { CursorUsageSummary } from "./CursorUsageSummary";

const USAGE: CursorUsageBilling = {
  capturedAt: "2026-07-15T00:00:00.000Z",
  billingCapturedAt: "2026-07-15T00:00:00.000Z",
  historyCapturedAt: "2026-07-15T00:00:00.000Z",
  billingCycleStart: "2026-07-01T00:00:00.000Z",
  billingCycleEnd: "2026-08-01T00:00:00.000Z",
  membershipType: "pro",
  limitType: "plan",
  isUnlimited: false,
  currency: "USD",
  planName: "Pro",
  planIncludedAmountCents: 10000,
  planPriceLabel: "$20",
  planOwner: "individual",
  plan: {
    enabled: true,
    usedCents: 4200,
    limitCents: 10000,
    remainingCents: 5800,
    includedUsageCents: 4000,
    bonusUsageCents: 200,
    totalUsageCents: 4200,
    autoPercentUsed: 18,
    apiPercentUsed: 24,
    totalPercentUsed: 42,
  },
  onDemand: {
    enabled: true,
    usedCents: 350,
    limitCents: 2000,
    remainingCents: 1650,
  },
  noUsageBasedAllowed: false,
  history: {
    rangeStart: "2026-07-14",
    rangeEnd: "2026-07-15",
    granularity: "day",
    sourceEventCount: 2,
    capturedEventCount: 2,
    complete: true,
    days: [
      {
        date: "2026-07-14",
        totals: {
          requests: 1,
          inputTokens: 1200,
          outputTokens: 300,
          cacheReadTokens: 500,
          apiValueCents: 12,
          chargedCents: 0,
        },
        byModel: [
          {
            id: "cursor-model-a",
            label: "Cursor model A",
            requests: 1,
            inputTokens: 1200,
            outputTokens: 300,
            cacheReadTokens: 500,
            apiValueCents: 12,
            chargedCents: 0,
          },
        ],
        byKind: [
          {
            id: "included",
            label: "Included",
            requests: 1,
            inputTokens: 1200,
            outputTokens: 300,
            cacheReadTokens: 500,
            apiValueCents: 12,
            chargedCents: 0,
          },
        ],
      },
    ],
  },
};

describe("CursorUsageSummary", () => {
  it("distinguishes plan value from actual On-Demand charges", () => {
    const html = renderToStaticMarkup(
      <CursorUsageSummary
        copy={buildCursorUsageLocalizedCopy("en")}
        locale="en"
        providerId="cursor-personal-page"
        surface="popup"
        usage={USAGE}
      />,
    );

    expect(html).toContain("Plan usage value");
    expect(html).toContain("Actual charge: $3.50");
    expect(html).toContain("Included model pool");
    expect(html).toContain("Third-party API pool");
    expect(html).toContain("Cursor model A");
    expect(html).toContain('role="progressbar"');
  });

  it("uses a non-zero empty state instead of inventing missing usage", () => {
    const html = renderToStaticMarkup(
      <CursorUsageSummary
        copy={buildCursorUsageLocalizedCopy("en")}
        locale="en"
        providerId="cursor-personal-page"
        surface="sidebar"
        usage={{ ...USAGE, plan: null, onDemand: null, history: null }}
      />,
    );

    expect(html).toContain("Not available");
    expect(html).toContain("No aggregate usage history yet");
    expect(html).not.toContain("$0");
  });

  it("uses detail density and a locale-aware selected range", () => {
    const html = renderToStaticMarkup(
      <CursorUsageSummary
        copy={buildCursorUsageLocalizedCopy("en")}
        density="detail"
        locale="en"
        providerId="cursor-personal-page"
        surface="fullPage"
        usage={USAGE}
      />,
    );

    expect(html).toContain("cursor-usage-summary--detail");
    expect(html).toContain(">30 days<");
    expect(html).toContain("Jul 14 – Jul 14");
    expect(html).toContain('data-cursor-usage-module="billing_summary"');
    expect(html).toContain('data-cursor-usage-module="usage_history"');
  });
});
