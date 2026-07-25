import { createServer, type RequestListener, type Server } from "node:http";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import quotaFixture from "../../../fixtures/sub2api/api-key-quota.fixture.json";
import subscriptionFixture from "../../../fixtures/sub2api/api-key-subscription.fixture.json";
import walletFixture from "../../../fixtures/sub2api/api-key-wallet.fixture.json";
import type { ApiGatewayConnectionMetadata } from "../types";
import {
  fetchSub2ApiUsage,
  parseSub2ApiUsageResponse,
  resetSub2ApiClientCachesForTests,
  Sub2ApiClientError,
} from "./client";

const HTTPS_CONNECTION: ApiGatewayConnectionMetadata = {
  schemaVersion: 1,
  displayLabel: "Synthetic gateway",
  baseUrl: "https://gateway.example.test",
  insecureTransportAcknowledged: false,
};

const servers: Server[] = [];

function fixtureResponse(fixture: unknown): unknown {
  return (fixture as { response: unknown }).response;
}

async function listen(
  handler: RequestListener,
): Promise<{ server: Server; origin: string }> {
  const server = createServer(handler);
  servers.push(server);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Sub2API test server did not expose a TCP address");
  }
  return { server, origin: `http://127.0.0.1:${address.port}` };
}

describe("Sub2API usage client", () => {
  beforeEach(() => {
    resetSub2ApiClientCachesForTests();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await Promise.all(
      servers.splice(0).map(
        (server) =>
          new Promise<void>((resolve) => server.close(() => resolve())),
      ),
    );
  });

  it("normalizes wallet, quota, and subscription API-key contracts", () => {
    const wallet = parseSub2ApiUsageResponse(fixtureResponse(walletFixture), {
      accountId: "default",
      connection: {
        ...HTTPS_CONNECTION,
        baseUrl: "http://gateway.example.test",
        insecureTransportAcknowledged: true,
      },
      capturedAt: "2026-07-25T03:00:00.000Z",
    });
    const quota = parseSub2ApiUsageResponse(fixtureResponse(quotaFixture), {
      accountId: "account_quota-test",
      connection: HTTPS_CONNECTION,
      capturedAt: "2026-07-25T03:00:00.000Z",
    });
    const subscription = parseSub2ApiUsageResponse(
      fixtureResponse(subscriptionFixture),
      {
        accountId: "account_subscription-test",
        connection: HTTPS_CONNECTION,
        capturedAt: "2026-07-25T03:00:00.000Z",
      },
    );

    expect(wallet).toMatchObject({
      scope: "api_key",
      billingMode: "wallet",
      transport: "http",
      balance: { amount: 18.75, unit: "USD" },
      usage: { today: { requests: 12, totalTokens: 7300 } },
    });
    expect(wallet.dailyUsage).toHaveLength(2);
    expect(wallet.modelUsage.map((entry) => entry.label)).toEqual([
      "synthetic-model-primary",
      "synthetic-model-secondary",
    ]);
    expect(quota).toMatchObject({
      billingMode: "quota",
      quota: { remaining: { amount: 31.5, unit: "USD" } },
    });
    expect(quota.rateLimits).toHaveLength(3);
    expect(subscription).toMatchObject({
      billingMode: "subscription",
      subscription: {
        monthlyUsage: { amount: 37.8, unit: "USD" },
        monthlyLimit: { amount: 200, unit: "USD" },
      },
    });
  });

  it("does not invent a currency when a generic monetary field has no unit", () => {
    const parsed = parseSub2ApiUsageResponse(
      { mode: "unrestricted", isValid: true, balance: 12.5 },
      {
        accountId: "default",
        connection: HTTPS_CONNECTION,
        capturedAt: "2026-07-25T03:00:00.000Z",
      },
    );

    expect(parsed.billingMode).toBe("wallet");
    expect(parsed.balance).toBeNull();
  });

  it("sends one bounded bearer request for concurrent surfaces", async () => {
    let requestCount = 0;
    const { origin } = await listen((request, response) => {
      requestCount += 1;
      expect(request.headers.authorization).toBe("Bearer local-test-key");
      const requestUrl = new URL(request.url ?? "/", origin);
      expect(requestUrl.pathname).toBe("/v1/usage");
      expect(requestUrl.searchParams.get("days")).toBe("31");
      expect(requestUrl.searchParams.get("timezone")).toBe(
        "Australia/Adelaide",
      );
      setTimeout(() => {
        response.writeHead(200, { "content-type": "application/json" });
        response.end(JSON.stringify(fixtureResponse(walletFixture)));
      }, 20);
    });
    const options = {
      accountId: "default",
      connection: {
        schemaVersion: 1 as const,
        displayLabel: "Local test",
        baseUrl: origin,
        insecureTransportAcknowledged: true,
      },
      apiKey: "local-test-key",
      trigger: "alarm" as const,
      timezone: "Australia/Adelaide",
    };

    const [left, right] = await Promise.all([
      fetchSub2ApiUsage(options),
      fetchSub2ApiUsage(options),
    ]);

    expect(requestCount).toBe(1);
    expect(left).toEqual(right);
    expect(left.origin).toBe(origin);
  });

  it("deduplicates automatic refresh results but lets manual refresh request newer data", async () => {
    let requestCount = 0;
    const fetchImpl = vi.fn(async () => {
      requestCount += 1;
      return new Response(JSON.stringify(fixtureResponse(quotaFixture)), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    const options = {
      accountId: "default",
      connection: HTTPS_CONNECTION,
      apiKey: "cache-key",
      trigger: "alarm" as const,
      fetchImpl,
      now: () => 1_000,
    };

    await fetchSub2ApiUsage(options);
    await fetchSub2ApiUsage(options);
    await fetchSub2ApiUsage({ ...options, trigger: "manual" });

    expect(requestCount).toBe(2);
  });

  it.each([
    [401, "credential_rejected", {}],
    [403, "access_forbidden", {}],
    [429, "rate_limited", { "retry-after": "120" }],
    [503, "server_error", {}],
  ] as const)(
    "classifies HTTP %i without leaking response content",
    async (status, code, headers) => {
      const fetchImpl = vi.fn(async () =>
        new Response("private deployment response", { status, headers }),
      );
      const request = fetchSub2ApiUsage({
        accountId: "default",
        connection: HTTPS_CONNECTION,
        apiKey: "private-key",
        trigger: "manual",
        fetchImpl,
        now: () => 1_000,
      });

      await expect(request).rejects.toMatchObject({
        name: "Sub2ApiClientError",
        code,
        ...(status === 429 ? { retryAfterMs: 120_000 } : {}),
      });
      await expect(request).rejects.not.toThrow(/private deployment response/);
    },
  );

  it("rejects redirects, non-JSON, and oversized bodies", async () => {
    const cases = [
      {
        expected: "redirect_rejected",
        response: new Response(null, {
          status: 302,
          headers: { location: "https://other.example.test/v1/usage" },
        }),
      },
      {
        expected: "non_json_response",
        response: new Response("<html>login</html>", {
          status: 200,
          headers: { "content-type": "text/html" },
        }),
      },
      {
        expected: "response_too_large",
        response: new Response("{}", {
          status: 200,
          headers: {
            "content-type": "application/json",
            "content-length": String(129 * 1024),
          },
        }),
      },
    ];

    for (const [index, testCase] of cases.entries()) {
      const request = fetchSub2ApiUsage({
        accountId: `account_reject-${index}`,
        connection: HTTPS_CONNECTION,
        apiKey: `reject-key-${index}`,
        trigger: "manual",
        fetchImpl: vi.fn(async () => testCase.response),
      });
      await expect(request).rejects.toMatchObject({
        code: testCase.expected,
      });
    }
  });

  it("retains recent history when a partial response omits history fields", async () => {
    let payload: unknown = fixtureResponse(walletFixture);
    let now = 10_000;
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const options = {
      accountId: "default",
      connection: HTTPS_CONNECTION,
      apiKey: "history-key",
      trigger: "manual" as const,
      fetchImpl,
      now: () => now,
    };

    const first = await fetchSub2ApiUsage(options);
    payload = { mode: "unrestricted", isValid: true, unit: "USD" };
    now += 30_000;
    const second = await fetchSub2ApiUsage(options);

    expect(first.dailyUsage).toHaveLength(2);
    expect(second.dailyUsage).toEqual(first.dailyUsage);
    expect(second.modelUsage).toEqual(first.modelUsage);
  });

  it("rejects malformed contract values with a typed error", () => {
    expect(() =>
      parseSub2ApiUsageResponse({ mode: "future_mode" }, {
        accountId: "default",
        connection: HTTPS_CONNECTION,
        capturedAt: "2026-07-25T03:00:00.000Z",
      }),
    ).toThrow(Sub2ApiClientError);
  });
});
