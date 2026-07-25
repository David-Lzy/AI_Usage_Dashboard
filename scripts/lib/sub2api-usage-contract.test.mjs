import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { parseSub2ApiUsageDiscoveryFixture } from "./sub2api-usage-contract.mjs";

const FIXTURES = {
  wallet: "fixtures/sub2api/api-key-wallet.fixture.json",
  quota: "fixtures/sub2api/api-key-quota.fixture.json",
  subscription: "fixtures/sub2api/api-key-subscription.fixture.json",
  account: "fixtures/sub2api/account-dashboard.fixture.json",
};

async function readFixture(name) {
  return JSON.parse(
    await readFile(path.join(process.cwd(), FIXTURES[name]), "utf8"),
  );
}

describe("Sub2API usage discovery contract", () => {
  it("distinguishes wallet, quota, and subscription API-key modes", async () => {
    const [wallet, quota, subscription] = await Promise.all([
      readFixture("wallet"),
      readFixture("quota"),
      readFixture("subscription"),
    ]);

    const normalizedWallet = parseSub2ApiUsageDiscoveryFixture(wallet);
    const normalizedQuota = parseSub2ApiUsageDiscoveryFixture(quota);
    const normalizedSubscription = parseSub2ApiUsageDiscoveryFixture(subscription);

    expect(normalizedWallet.contract.scope).toBe("api_key");
    expect(normalizedWallet.contract.billingKind).toBe("wallet");
    expect(normalizedWallet.deployment).toMatchObject({
      transport: "http",
      insecureTransport: true,
    });
    expect(normalizedWallet.contract.usage.today).toMatchObject({
      referenceCostUsd: 1.25,
      actualCostUsd: 0.92,
    });
    expect(normalizedWallet.contract.dailyUsage.map((point) => point.date)).toEqual([
      "2026-07-24",
      "2026-07-25",
    ]);
    expect(normalizedWallet.contract.modelStats[1].id).toBe(
      "synthetic-model-secondary",
    );

    expect(normalizedQuota.contract.billingKind).toBe("quota");
    expect(normalizedQuota.contract.rateLimits.map((limit) => limit.window)).toEqual([
      "5h",
      "1d",
      "7d",
    ]);
    expect(normalizedQuota.contract.quota).toEqual({
      limitUsd: 50,
      usedUsd: 18.5,
      remainingUsd: 31.5,
    });

    expect(normalizedSubscription.contract.billingKind).toBe("subscription");
    expect(normalizedSubscription.contract.subscription).toMatchObject({
      dailyUsageUsd: 2.25,
      weeklyLimitUsd: 60,
      monthlyLimitUsd: 200,
    });
  });

  it("keeps account-wide dashboard data in a separate scope", async () => {
    const normalized = parseSub2ApiUsageDiscoveryFixture(
      await readFixture("account"),
    );

    expect(normalized.endpoint).toBe("/api/v1/usage/dashboard/snapshot-v2");
    expect(normalized.auth).toBe("bearer_user_session");
    expect(normalized.contract).toMatchObject({
      scope: "account",
      mode: "account_dashboard",
      rangeStart: "2026-07-24",
      rangeEnd: "2026-07-25",
      granularity: "day",
    });
    expect(normalized.contract.dailyUsage).toHaveLength(2);
    expect(normalized.contract.modelStats).toHaveLength(2);
  });

  it("preserves future bounded rate-limit windows without inventing semantics", async () => {
    const fixture = await readFixture("quota");
    fixture.response.rate_limits = [
      {
        ...fixture.response.rate_limits[0],
        window: "30d",
      },
    ];

    expect(
      parseSub2ApiUsageDiscoveryFixture(fixture).contract.rateLimits[0].window,
    ).toBe("30d");
  });

  it("rejects scope mixing, malformed values, duplicate dates, and oversized arrays", async () => {
    const fixture = await readFixture("wallet");

    expect(() =>
      parseSub2ApiUsageDiscoveryFixture({
        ...fixture,
        request: {
          ...fixture.request,
          path: "/api/v1/usage/dashboard/snapshot-v2",
        },
      }),
    ).toThrow("must be /v1/usage for api_key scope");
    expect(() =>
      parseSub2ApiUsageDiscoveryFixture({
        ...fixture,
        response: {
          ...fixture.response,
          usage: {
            ...fixture.response.usage,
            today: { ...fixture.response.usage.today, requests: -1 },
          },
        },
      }),
    ).toThrow("finite non-negative integer");
    expect(() =>
      parseSub2ApiUsageDiscoveryFixture({
        ...fixture,
        response: {
          ...fixture.response,
          daily_usage: [
            fixture.response.daily_usage[0],
            fixture.response.daily_usage[0],
          ],
        },
      }),
    ).toThrow("duplicate date");
    expect(() =>
      parseSub2ApiUsageDiscoveryFixture({
        ...fixture,
        response: {
          ...fixture.response,
          model_stats: Array.from({ length: 17 }, () =>
            fixture.response.model_stats[0],
          ),
        },
      }),
    ).toThrow("at most 16 model series");
  });

  it("rejects credentials, account identifiers, and oversized fixture bodies", async () => {
    const fixture = await readFixture("wallet");

    expect(() =>
      parseSub2ApiUsageDiscoveryFixture({
        ...fixture,
        access_token: "synthetic-secret",
      }),
    ).toThrow("forbidden in a sanitized fixture");
    expect(() =>
      parseSub2ApiUsageDiscoveryFixture({
        ...fixture,
        note: "Bearer synthetic-secret",
      }),
    ).toThrow("credential-like");
    expect(() =>
      parseSub2ApiUsageDiscoveryFixture({
        ...fixture,
        padding: "x".repeat(129 * 1024),
      }),
    ).toThrow("exceeds 131072 bytes");
  });
});
