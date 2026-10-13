import { describe, expect, it, vi } from "vitest";
import { emptyCommunityResetCache, COMMUNITY_RESET_ENDPOINTS } from "../shared/community-reset-feeds";
import { fetchCommunityResetEndpoint, COMMUNITY_RESET_MAX_BYTES } from "./community-reset-fetch";

const now = Date.parse("2026-10-13T06:00:00Z");
const payload = { meta: { api_version: "v1", generated_at: new Date(now).toISOString() }, data: [] };
function response(body: unknown = payload, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { headers: { "content-type": "application/json", "cache-control": "max-age=60", ...headers } });
}
const run = (fetcher: (url: string, init: RequestInit) => Promise<Response>, previous = emptyCommunityResetCache()) =>
  fetchCommunityResetEndpoint("resets", previous, now, new AbortController().signal, fetcher);
describe("bounded public reset requests", () => {
  it("uses fixed GET endpoints with no credentials, redirects, referrer or identifying parameters", async () => {
    const fetcher = vi.fn(async (url: string, init: RequestInit) => {
      expect(url).toBe(COMMUNITY_RESET_ENDPOINTS.resets.url);
      expect(init).toMatchObject({ method: "GET", credentials: "omit", referrerPolicy: "no-referrer", redirect: "error", cache: "no-store", headers: { Accept: "application/json" } });
      expect(new Headers(init.headers).has("User-Agent")).toBe(false);
      expect(new Headers(init.headers).has("Authorization")).toBe(false);
      return response(payload, { etag: '"public-v1"' });
    });
    expect(await run(fetcher)).toMatchObject({ failure: null, etag: '"public-v1"', capturedAt: new Date(now).toISOString() });
  });
  it("honors conditional requests without treating a 304 as a new observation", async () => {
    const previous = await run(async () => response(payload, { etag: '"public-v1"' }));
    const result = await run(async (_url, init) => {
      expect(new Headers(init.headers).get("If-None-Match")).toBe('"public-v1"');
      return new Response(null, { status: 304, headers: { "cache-control": "max-age=60" } });
    }, previous);
    expect(result.fragment).toEqual(previous.fragment);
    expect(result.capturedAt).toBe(previous.capturedAt);
    expect((await run(async () => new Response(null, { status: 304 }))).failure).toBe("invalid");
  });
  it("rejects both declared and streamed oversized bodies and invalid JSON", async () => {
    expect((await run(async () => response(payload, { "content-length": String(COMMUNITY_RESET_MAX_BYTES + 1) }))).failure).toBe("invalid");
    expect((await run(async () => new Response("x".repeat(COMMUNITY_RESET_MAX_BYTES + 1)))).failure).toBe("invalid");
    expect((await run(async () => new Response("<html>"))).failure).toBe("invalid");
  });
  it("preserves last-good data during rate limiting with Retry-After and published staleness", async () => {
    const previous = await run(async () => response());
    const limited = await run(async () => new Response(null, { status: 429, headers: { "retry-after": "3600" } }), previous);
    expect(limited.fragment).toEqual(previous.fragment);
    expect(limited.retryAt).toBe(new Date(now + 3600_000).toISOString());
    expect((await run(async () => response(payload, { "x-published-expires-at": new Date(now - 1).toISOString() }))).failure).toBe("invalid");
    expect((await run(async () => response(payload, { "x-published-checked-at": new Date(now - 3600_000).toISOString() }))).failure).toBe("invalid");
  });
  it("aborts a timed-out request", async () => {
    vi.useFakeTimers();
    try {
      const result = run(async (_url, init) => new Promise((_resolve, reject) => init.signal!.addEventListener("abort", () => reject(new DOMException("timeout", "AbortError")))));
      await vi.advanceTimersByTimeAsync(8001);
      expect((await result).failure).toBe("timeout");
    } finally { vi.useRealTimers(); }
  });
});
