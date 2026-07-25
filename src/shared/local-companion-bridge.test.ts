import { describe, expect, it, vi } from "vitest";

import {
  LOCAL_COMPANION_BRIDGE_SCHEMA_V1,
  fetchLocalCompanionBridgeHealth,
  fetchLocalCompanionBridgeSource,
  fetchLocalCompanionBridgeSourceIndex,
  normalizeLocalCompanionBridgeBaseUrl,
  pairLocalCompanionBridge,
  revokeLocalCompanionBridgePairing,
} from "./local-companion-bridge";

const baseUrl = "http://127.0.0.1:47831";
const token = "a".repeat(43);

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("local companion bridge client", () => {
  it("accepts only an explicit loopback HTTP port", () => {
    expect(normalizeLocalCompanionBridgeBaseUrl(baseUrl)).toEqual({
      ok: true,
      value: baseUrl,
    });
    expect(
      normalizeLocalCompanionBridgeBaseUrl("http://[::1]:47831"),
    ).toMatchObject({ ok: true });
    for (const invalidUrl of [
      "http://localhost:47831",
      "http://0.0.0.0:47831",
      "https://127.0.0.1:47831",
      "http://127.0.0.1",
      "http://127.0.0.1:47831/private",
      "http://user:pass@127.0.0.1:47831",
    ]) {
      expect(normalizeLocalCompanionBridgeBaseUrl(invalidUrl)).toMatchObject({
        ok: false,
        code: "invalid_base_url",
      });
    }
  });

  it("pairs with a one-time code without placing it in the URL", async () => {
    let capturedInput = "";
    let capturedInit: RequestInit | undefined;
    const fetchImpl = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        capturedInput = String(input);
        capturedInit = init;
        return jsonResponse({
          schema: LOCAL_COMPANION_BRIDGE_SCHEMA_V1,
          token,
        });
      },
    );

    await expect(
      pairLocalCompanionBridge(baseUrl, "ABCD-1234", { fetchImpl }),
    ).resolves.toEqual({ ok: true, value: token });

    expect(capturedInput).toBe(`${baseUrl}/v1/pair`);
    expect(capturedInit).toEqual(
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ code: "ABCD-1234" }),
      }),
    );
    expect(capturedInput).not.toContain("ABCD-1234");
  });

  it("authenticates health, index, source, and revocation requests", async () => {
    const authorizationHeaders: Array<string | null> = [];
    const fetchImpl = vi.fn(async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ) => {
      authorizationHeaders.push(
        new Headers(init?.headers).get("Authorization"),
      );
      const url = String(input);
      if (url.endsWith("/v1/health")) {
        return jsonResponse({
          schema: LOCAL_COMPANION_BRIDGE_SCHEMA_V1,
          status: "ok",
          bridgeVersion: "0.1.0",
          sourceCount: 1,
        });
      }
      if (url.endsWith("/v1/sources")) {
        return jsonResponse({
          schema: LOCAL_COMPANION_BRIDGE_SCHEMA_V1,
          sources: [{ sourceId: "custom:build", label: "Build quota" }],
        });
      }
      if (url.endsWith("/v1/sources/custom%3Abuild")) {
        return jsonResponse({
          schema: "ai-usage-dashboard.custom-source.v1",
          label: "Build quota",
          status: "ok",
          quota: { unit: "minutes", remaining: 90, total: 100 },
        });
      }
      return jsonResponse(
        { schema: LOCAL_COMPANION_BRIDGE_SCHEMA_V1, status: "revoked" },
      );
    });

    await expect(
      fetchLocalCompanionBridgeHealth(baseUrl, token, { fetchImpl }),
    ).resolves.toMatchObject({ ok: true, value: { sourceCount: 1 } });
    await expect(
      fetchLocalCompanionBridgeSourceIndex(baseUrl, token, { fetchImpl }),
    ).resolves.toMatchObject({
      ok: true,
      value: { sources: [{ sourceId: "custom:build" }] },
    });
    await expect(
      fetchLocalCompanionBridgeSource(baseUrl, token, "custom:build", {
        fetchImpl,
        now: new Date("2026-07-25T00:00:00.000Z"),
      }),
    ).resolves.toMatchObject({
      ok: true,
      value: { sourceId: "custom:build", remaining: 90 },
    });
    await expect(
      revokeLocalCompanionBridgePairing(baseUrl, token, { fetchImpl }),
    ).resolves.toEqual({ ok: true, value: true });

    for (const header of authorizationHeaders) {
      expect(header).toBe(`Bearer ${token}`);
    }
  });

  it("rejects malformed and oversized companion responses", async () => {
    await expect(
      fetchLocalCompanionBridgeSourceIndex(baseUrl, token, {
        fetchImpl: async () =>
          jsonResponse({
            schema: LOCAL_COMPANION_BRIDGE_SCHEMA_V1,
            sources: [{ sourceId: "codex", label: "Built-in override" }],
          }),
      }),
    ).resolves.toMatchObject({ ok: false, code: "invalid_response" });

    await expect(
      fetchLocalCompanionBridgeHealth(baseUrl, token, {
        fetchImpl: async () =>
          new Response("{}", {
            headers: { "Content-Length": String(1_000_000) },
          }),
      }),
    ).resolves.toMatchObject({ ok: false, code: "response_too_large" });
  });

  it("maps authorization, rate limits, and timeouts to fixed diagnostics", async () => {
    await expect(
      fetchLocalCompanionBridgeHealth(baseUrl, token, {
        fetchImpl: async () => jsonResponse({}, 401),
      }),
    ).resolves.toMatchObject({ ok: false, code: "unauthorized" });
    await expect(
      fetchLocalCompanionBridgeHealth(baseUrl, token, {
        fetchImpl: async () => jsonResponse({}, 429),
      }),
    ).resolves.toMatchObject({ ok: false, code: "rate_limited" });

    await expect(
      fetchLocalCompanionBridgeHealth(baseUrl, token, {
        timeoutMs: 5,
        fetchImpl: (_input, init) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => {
              reject(new DOMException("aborted", "AbortError"));
            });
          }),
      }),
    ).resolves.toMatchObject({ ok: false, code: "timeout" });
  });
});
