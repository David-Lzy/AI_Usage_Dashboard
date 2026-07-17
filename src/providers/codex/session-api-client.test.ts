import { describe, expect, it, vi } from "vitest";

import type { CodexCredentialBroker } from "./session-credential-broker";
import type { CodexSessionCredential } from "./session-credential";
import {
  CODEX_DAILY_TOKEN_USAGE_PATH,
  CODEX_DAILY_WORKSPACE_USAGE_PATH,
} from "./usage-history-contract";
import {
  CODEX_SESSION_API_ORIGIN,
  createCodexSessionApiClient,
} from "./session-api-client";
import { CODEX_SESSION_USAGE_PATH } from "./session-usage-contract";

const credentialOne: CodexSessionCredential = {
  accessToken: "session-token-one",
  accountId: "account-one",
  expiresAt: null,
  source: "web_session",
};

const credentialTwo: CodexSessionCredential = {
  ...credentialOne,
  accessToken: "session-token-two",
};

const quotaPayload = {
  plan_type: "pro",
  rate_limit: {
    primary_window: {
      used_percent: 25,
      limit_window_seconds: 18_000,
      reset_at: 1_784_300_100,
    },
    secondary_window: {
      used_percent: 59,
      limit_window_seconds: 604_800,
      reset_at: 1_784_472_900,
    },
  },
  additional_rate_limits: [
    {
      limit_name: "GPT-5.3-Codex-Spark",
      metered_feature: "codex-spark",
      rate_limit: {
        primary_window: {
          used_percent: 0,
          limit_window_seconds: 604_800,
        },
      },
    },
  ],
};

const tokenHistoryPayload = {
  units: "percent",
  data: [
    {
      date: "2026-07-16",
      product_surface_usage_values: { desktop_app: 42, vscode: 8 },
    },
  ],
};

const workspaceHistoryPayload = {
  data: [
    {
      date: "2026-07-16",
      totals: { turns: 12 },
      clients: [{ client_id: "CODEX_DESKTOP_APP", turns: 8 }],
      models: [{ model: "gpt-5.5", turns: 12 }],
    },
  ],
};

function jsonResponse(value: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

function createBroker(
  getCredential = vi.fn(async () => ({
    ok: true as const,
    credential: credentialOne,
  })),
): CodexCredentialBroker {
  return {
    clearCredential: vi.fn(async () => undefined),
    getCredential,
    setManualCredential: vi.fn(),
  };
}

function responseForUrl(url: string): Response {
  if (url.endsWith(CODEX_SESSION_USAGE_PATH)) {
    return jsonResponse(quotaPayload);
  }
  if (url.endsWith(CODEX_DAILY_TOKEN_USAGE_PATH)) {
    return jsonResponse(tokenHistoryPayload);
  }
  if (url.endsWith(CODEX_DAILY_WORKSPACE_USAGE_PATH)) {
    return jsonResponse(workspaceHistoryPayload);
  }
  return jsonResponse({}, { status: 404 });
}

describe("createCodexSessionApiClient", () => {
  it("coalesces concurrent surface refreshes into one quota and history request set", async () => {
    const fetchImpl = vi.fn(async (url: string) => responseForUrl(url));
    const client = createCodexSessionApiClient({
      credentialBroker: createBroker(),
      fetchImpl,
      now: () => Date.parse("2026-07-17T00:00:00Z"),
    });

    const [popup, dashboard, alarm] = await Promise.all([
      client.getUsageSnapshot("manual"),
      client.getUsageSnapshot("manual"),
      client.getUsageSnapshot("alarm"),
    ]);

    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(popup).toEqual(dashboard);
    expect(dashboard).toEqual(alarm);
    expect(popup).toMatchObject({
      ok: true,
      historyState: "fresh",
      result: {
        snapshot: {
          primaryWindow: { remainingPercent: 75 },
          windows: [
            { kind: "rolling_5h" },
            { kind: "weekly" },
            { kind: "model_weekly", modelLabel: "GPT-5.3-Codex-Spark" },
          ],
          usageHistory: {
            personalUsageBySurface: { points: [{ date: "2026-07-16" }] },
            turns: { total: 12 },
          },
        },
      },
    });
  });

  it("reuses automatic results while manual refresh only bypasses the quota cache", async () => {
    let currentTime = Date.parse("2026-07-17T00:00:00Z");
    const fetchImpl = vi.fn(async (url: string) => responseForUrl(url));
    const client = createCodexSessionApiClient({
      credentialBroker: createBroker(),
      fetchImpl,
      now: () => currentTime,
    });

    await client.getUsageSnapshot("manual");
    currentTime += 30_000;
    await client.getUsageSnapshot("manual");
    await client.getUsageSnapshot("alarm");

    expect(fetchImpl).toHaveBeenCalledTimes(4);
    expect(
      fetchImpl.mock.calls.filter(([url]) =>
        String(url).endsWith(CODEX_SESSION_USAGE_PATH),
      ),
    ).toHaveLength(2);
    expect(
      fetchImpl.mock.calls.filter(([url]) =>
        String(url).includes("daily-"),
      ),
    ).toHaveLength(2);
  });

  it("renews an expired token once after 401 and never exposes it in the result", async () => {
    const getCredential = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, credential: credentialOne })
      .mockResolvedValueOnce({ ok: true, credential: credentialTwo });
    const broker = createBroker(getCredential);
    const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
      const authorization = new Headers(init?.headers).get("Authorization");
      if (
        url.endsWith(CODEX_SESSION_USAGE_PATH) &&
        authorization === "Bearer session-token-one"
      ) {
        return jsonResponse({}, { status: 401 });
      }
      return responseForUrl(url);
    });
    const client = createCodexSessionApiClient({
      credentialBroker: broker,
      fetchImpl,
    });

    const result = await client.getUsageSnapshot("manual");

    expect(result.ok).toBe(true);
    expect(broker.clearCredential).toHaveBeenCalledTimes(1);
    expect(getCredential).toHaveBeenCalledTimes(2);
    expect(fetchImpl).toHaveBeenCalledTimes(4);
    expect(JSON.stringify(result)).not.toContain("session-token");
  });

  it("retains successful history when a later history refresh fails", async () => {
    let currentTime = Date.parse("2026-07-17T00:00:00Z");
    let failHistory = false;
    const fetchImpl = vi.fn(async (url: string) => {
      if (failHistory && url.includes("daily-")) {
        return jsonResponse({}, { status: 503 });
      }
      return responseForUrl(url);
    });
    const client = createCodexSessionApiClient({
      credentialBroker: createBroker(),
      fetchImpl,
      now: () => currentTime,
    });

    await client.getUsageSnapshot("manual");
    currentTime += 16 * 60_000;
    failHistory = true;
    const result = await client.getUsageSnapshot("manual");

    expect(result).toMatchObject({
      ok: true,
      historyState: "cached",
      result: {
        snapshot: {
          usageHistory: { turns: { total: 12 } },
        },
      },
    });
  });

  it("does not reuse history across ChatGPT account changes without an account id", async () => {
    let credential = { ...credentialOne, accountId: null };
    let failHistory = false;
    const broker = createBroker(
      vi.fn(async () => ({ ok: true as const, credential })),
    );
    const fetchImpl = vi.fn(async (url: string) => {
      if (failHistory && url.includes("daily-")) {
        return jsonResponse({}, { status: 503 });
      }
      return responseForUrl(url);
    });
    const client = createCodexSessionApiClient({
      credentialBroker: broker,
      fetchImpl,
    });

    await client.getUsageSnapshot("manual");
    credential = { ...credentialTwo, accountId: null };
    failHistory = true;
    const result = await client.getUsageSnapshot("manual");

    expect(result).toMatchObject({
      ok: true,
      historyState: "unavailable",
      replacePreviousSnapshot: true,
    });
    if (result.ok) {
      expect(result.result.snapshot.usageHistory).toBeUndefined();
    }
  });

  it("honors Retry-After without issuing another automatic request", async () => {
    let currentTime = Date.parse("2026-07-17T00:00:00Z");
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.endsWith(CODEX_SESSION_USAGE_PATH)) {
        return jsonResponse({}, {
          status: 429,
          headers: { "Retry-After": "120" },
        });
      }
      return responseForUrl(url);
    });
    const client = createCodexSessionApiClient({
      credentialBroker: createBroker(),
      fetchImpl,
      now: () => currentTime,
    });

    const first = await client.getUsageSnapshot("alarm");
    currentTime += 30_000;
    const second = await client.getUsageSnapshot("alarm");

    expect(first).toMatchObject({
      ok: false,
      code: "rate_limited",
      retryAt: Date.parse("2026-07-17T00:02:00Z"),
    });
    expect(second).toMatchObject({ ok: false, code: "rate_limited" });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("stops automatic retries after 403 for the same session token", async () => {
    const fetchImpl = vi.fn(async (url: string) =>
      url.endsWith(CODEX_SESSION_USAGE_PATH)
        ? jsonResponse({}, { status: 403 })
        : responseForUrl(url),
    );
    const client = createCodexSessionApiClient({
      credentialBroker: createBroker(),
      fetchImpl,
    });

    const first = await client.getUsageSnapshot("alarm");
    const second = await client.getUsageSnapshot("alarm");

    expect(first).toMatchObject({ ok: false, code: "forbidden" });
    expect(second).toMatchObject({ ok: false, code: "forbidden" });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(
      fetchImpl.mock.calls.every(([url]) =>
        String(url).startsWith(CODEX_SESSION_API_ORIGIN),
      ),
    ).toBe(true);
  });
});
