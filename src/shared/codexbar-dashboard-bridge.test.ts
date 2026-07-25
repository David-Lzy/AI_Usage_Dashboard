import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

import { describe, expect, it, vi } from "vitest";

import {
  CODEXBAR_DASHBOARD_MAX_RESPONSE_CHARS,
  fetchCodexBarDashboardSnapshot,
  normalizeCodexBarDashboardEndpoint,
  parseCodexBarDashboardSnapshot,
  toCodexBarCustomSourceId,
} from "./codexbar-dashboard-bridge";

const ENDPOINT = "http://127.0.0.1:8080/dashboard/v1/snapshot";
const TOKEN = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const NOW = new Date("2026-07-25T12:02:00.000Z");

function createPayload() {
  return {
    schemaVersion: 1,
    generatedAt: "2026-07-25T12:00:00.000Z",
    staleAfterSeconds: 180,
    host: {
      codexBarVersion: "0.37.2",
      refreshIntervalSeconds: 60,
    },
    providers: [
      {
        id: "codex",
        name: "Codex",
        enabled: true,
        source: "oauth",
        status: {
          level: "ok",
          label: "Operational",
          updatedAt: "2026-07-25T11:59:00.000Z",
        },
        identity: {
          accountEmail: "redacted@example.com",
          plan: "Private plan label",
        },
        windows: [
          {
            kind: "session",
            label: "Session",
            usedPercent: 28,
            remainingPercent: 72,
            resetAt: "2026-07-25T17:15:00.000Z",
          },
        ],
        credits: { remaining: 112.4, unit: "credits" },
        cost: { todayUSD: 1.04, last30DaysUSD: 18.22 },
        display: {
          accentColor: "#49A3B0",
          sortKey: 0,
          priority: "normal",
        },
        error: null,
        updatedAt: "2026-07-25T11:59:45.000Z",
      },
    ],
  };
}

describe("CodexBar dashboard bridge", () => {
  it("accepts only the exact configured IPv4 loopback dashboard route", () => {
    expect(normalizeCodexBarDashboardEndpoint(ENDPOINT)).toEqual({
      ok: true,
      value: ENDPOINT,
    });

    for (const value of [
      "http://localhost:8080/dashboard/v1/snapshot",
      "http://192.168.1.10:8080/dashboard/v1/snapshot",
      "https://127.0.0.1:8080/dashboard/v1/snapshot",
      "http://127.0.0.1:8080/usage",
      "http://127.0.0.1:8080/cost",
      "http://127.0.0.1:8080/dashboard/v1/snapshot?token=secret",
    ]) {
      expect(normalizeCodexBarDashboardEndpoint(value)).toMatchObject({
        ok: false,
        code: "invalid_endpoint",
      });
    }
  });

  it("normalizes provider rows into a separate custom-source namespace", () => {
    const result = parseCodexBarDashboardSnapshot(
      JSON.stringify(createPayload()),
      { now: NOW },
    );

    expect(result).toMatchObject({
      ok: true,
      value: {
        stale: false,
        hostVersion: "0.37.2",
        sources: [
          {
            upstreamProviderId: "codex",
            enabled: true,
            snapshot: {
              label: "CodexBar · Codex",
              remaining: 72,
              total: 100,
              syncStatus: "ok",
            },
          },
        ],
      },
    });
    expect(result.ok && result.value.sources[0]?.sourceId).toBe(
      toCodexBarCustomSourceId("codex"),
    );
    expect(JSON.stringify(result)).not.toContain("redacted@example.com");
    expect(JSON.stringify(result)).not.toContain("Private plan label");
  });

  it("marks accepted old snapshots stale instead of fabricating fresh data", () => {
    const result = parseCodexBarDashboardSnapshot(
      JSON.stringify(createPayload()),
      { now: new Date("2026-07-25T12:10:00.000Z") },
    );

    expect(result).toMatchObject({
      ok: true,
      value: {
        stale: true,
        sources: [
          {
            snapshot: {
              syncStatus: "warning",
              warningReason: "The CodexBar dashboard snapshot is stale.",
            },
          },
        ],
      },
    });
  });

  it("fails closed on schema, range, duplicate, and body-size violations", () => {
    const invalidSchema = createPayload();
    invalidSchema.schemaVersion = 2;
    expect(
      parseCodexBarDashboardSnapshot(JSON.stringify(invalidSchema), { now: NOW }),
    ).toMatchObject({ ok: false, code: "invalid_response" });

    const invalidPercent = createPayload();
    invalidPercent.providers[0]!.windows[0]!.usedPercent = 101;
    expect(
      parseCodexBarDashboardSnapshot(JSON.stringify(invalidPercent), { now: NOW }),
    ).toMatchObject({ ok: false, code: "invalid_response" });

    const duplicate = createPayload();
    duplicate.providers.push(structuredClone(duplicate.providers[0]!));
    expect(
      parseCodexBarDashboardSnapshot(JSON.stringify(duplicate), { now: NOW }),
    ).toMatchObject({ ok: false, code: "invalid_response" });

    expect(
      parseCodexBarDashboardSnapshot(
        "x".repeat(CODEXBAR_DASHBOARD_MAX_RESPONSE_CHARS + 1),
      ),
    ).toMatchObject({ ok: false, code: "response_too_large" });
  });

  it("uses only a bearer header and never falls back to unauthenticated routes", async () => {
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.headers).toMatchObject({ Authorization: `Bearer ${TOKEN}` });
      expect(init?.credentials).toBe("omit");
      expect(init?.redirect).toBe("error");
      return new Response(JSON.stringify(createPayload()), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    });

    await expect(
      fetchCodexBarDashboardSnapshot(ENDPOINT, TOKEN, { fetchImpl, now: NOW }),
    ).resolves.toMatchObject({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    const unauthorizedFetch = vi.fn(async () =>
      new Response('{"error":"unauthorized"}', {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );
    await expect(
      fetchCodexBarDashboardSnapshot(ENDPOINT, TOKEN, {
        fetchImpl: unauthorizedFetch,
      }),
    ).resolves.toMatchObject({ ok: false, code: "unauthorized" });
    expect(unauthorizedFetch).toHaveBeenCalledTimes(1);
  });

  it("connects to a deterministic authenticated loopback dashboard server", async () => {
    const observedRequests: Array<{ authorization: string | undefined; url: string }> = [];
    const server = createServer((request, response) => {
      observedRequests.push({
        authorization: request.headers.authorization,
        url: request.url ?? "",
      });
      response.writeHead(request.headers.authorization === `Bearer ${TOKEN}` ? 200 : 401, {
        "Content-Type": "application/json; charset=utf-8",
      });
      response.end(JSON.stringify(createPayload()));
    });
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", () => resolve());
    });

    try {
      const address = server.address() as AddressInfo;
      const endpoint = `http://127.0.0.1:${address.port}/dashboard/v1/snapshot`;
      await expect(
        fetchCodexBarDashboardSnapshot(endpoint, TOKEN, { now: NOW }),
      ).resolves.toMatchObject({ ok: true });
      expect(observedRequests).toEqual([
        {
          authorization: `Bearer ${TOKEN}`,
          url: "/dashboard/v1/snapshot",
        },
      ]);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });

  it("rejects successful non-JSON responses", async () => {
    const result = await fetchCodexBarDashboardSnapshot(ENDPOINT, TOKEN, {
      fetchImpl: async () =>
        new Response("<html>not json</html>", {
          status: 200,
          headers: { "Content-Type": "text/html" },
        }),
    });

    expect(result).toMatchObject({
      ok: false,
      code: "invalid_content_type",
    });
  });
});
