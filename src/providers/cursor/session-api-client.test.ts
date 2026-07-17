import { describe, expect, it, vi } from "vitest";

import usageBillingFixture from "../../../fixtures/cursor/usage-billing.fixture.json";
import type { CursorUsageBillingContractFixture } from "./usage-billing-contract";
import {
  createCursorSessionApiClient,
  CURSOR_SESSION_API_ORIGIN,
} from "./session-api-client";

const fixture = usageBillingFixture as CursorUsageBillingContractFixture;

function responseForUrl(url: string): Response {
  const body = url.endsWith("/api/usage-summary")
    ? fixture.usageSummary
    : url.endsWith("/api/dashboard/get-plan-info")
      ? fixture.planInfo
      : fixture.hardLimit;

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("createCursorSessionApiClient", () => {
  it("reads sanitized Cursor summary data with the browser session", async () => {
    const fetchImpl = vi.fn(
      async (input: string, _init?: RequestInit) => responseForUrl(input),
    );
    const client = createCursorSessionApiClient({
      fetchImpl,
      now: () => Date.parse("2026-07-17T05:30:00.000Z"),
    });

    const response = await client.getUsageSnapshot("manual");

    expect(response.ok).toBe(true);
    if (!response.ok) {
      return;
    }
    expect(response.result.snapshot).toMatchObject({
      recommendedSurface: "session_api",
      usageBillingContract: {
        usageSummary: fixture.usageSummary,
        planInfo: fixture.planInfo,
        hardLimit: fixture.hardLimit,
        usageEvents: null,
      },
    });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    for (const [url, init] of fetchImpl.mock.calls) {
      expect(url).toMatch(new RegExp(`^${CURSOR_SESSION_API_ORIGIN}`));
      expect(init).toMatchObject({
        cache: "no-store",
        credentials: "include",
        method: "GET",
      });
    }
  });

  it("reuses a recent automatic result", async () => {
    const fetchImpl = vi.fn(
      async (input: string, _init?: RequestInit) => responseForUrl(input),
    );
    const client = createCursorSessionApiClient({
      fetchImpl,
      now: () => Date.parse("2026-07-17T05:30:00.000Z"),
    });

    const first = await client.getUsageSnapshot("alarm");
    const second = await client.getUsageSnapshot("alarm");

    expect(first).toEqual(second);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("shares one in-flight request across surfaces", async () => {
    let releaseRequests!: () => void;
    const requestGate = new Promise<void>((resolve) => {
      releaseRequests = resolve;
    });
    const fetchImpl = vi.fn(async (input: string) => {
      await requestGate;
      return responseForUrl(input);
    });
    const client = createCursorSessionApiClient({ fetchImpl });

    const first = client.getUsageSnapshot("manual");
    const second = client.getUsageSnapshot("manual");
    releaseRequests();
    const [firstResult, secondResult] = await Promise.all([first, second]);

    expect(firstResult).toEqual(secondResult);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("returns a typed authentication failure without exposing the body", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response("private response content", { status: 401 }),
    );
    const client = createCursorSessionApiClient({ fetchImpl });

    const response = await client.getUsageSnapshot("manual");

    expect(response).toEqual({
      ok: false,
      code: "unauthorized",
      reason:
        "The current Cursor browser session was not accepted by the personal usage endpoint.",
      retryAt: null,
    });
    expect(JSON.stringify(response)).not.toContain("private response content");
  });

  it("honors Retry-After for automatic refreshes while manual refresh can retry", async () => {
    let now = Date.parse("2026-07-17T05:30:00.000Z");
    const fetchImpl = vi.fn(async () =>
      new Response(null, {
        status: 429,
        headers: { "Retry-After": "120" },
      }),
    );
    const client = createCursorSessionApiClient({
      fetchImpl,
      now: () => now,
    });

    const first = await client.getUsageSnapshot("alarm");
    now += 30_000;
    const cooledDown = await client.getUsageSnapshot("alarm");
    const manualRetry = await client.getUsageSnapshot("manual");

    expect(first).toMatchObject({ ok: false, code: "rate_limited" });
    expect(cooledDown).toMatchObject({
      ok: false,
      code: "retry_cooldown",
      retryAt: Date.parse("2026-07-17T05:32:00.000Z"),
    });
    expect(manualRetry).toMatchObject({ ok: false, code: "rate_limited" });
    expect(fetchImpl).toHaveBeenCalledTimes(6);
  });

  it("rejects an unsupported summary response", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response("{}", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = createCursorSessionApiClient({ fetchImpl });

    await expect(client.getUsageSnapshot("manual")).resolves.toMatchObject({
      ok: false,
      code: "protocol_drift",
    });
  });
});
