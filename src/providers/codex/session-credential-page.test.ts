import { describe, expect, it, vi } from "vitest";

import {
  acquireCodexCredentialAutomatically,
  acquireCodexCredentialFromBackgroundSession,
  acquireCodexCredentialFromOpenTabs,
  CODEX_WEB_SESSION_ENDPOINT,
} from "./session-credential-page";

function jsonResponse(value: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

describe("Codex page credential acquisition", () => {
  it("queries existing ChatGPT tabs without creating or activating one", async () => {
    const query = vi.fn(async () => [
      { id: 10, active: false, lastAccessed: 100 },
      { id: 20, active: true, lastAccessed: 50 },
    ] as chrome.tabs.Tab[]);
    const executeScript = vi.fn(async (injection) => [
      injection.target.tabId === 20
        ? {
            result: {
              accessToken: "opaque-token",
              accountId: "account-local",
              source: "web_session",
            },
          }
        : { result: null },
    ]);

    const result = await acquireCodexCredentialFromOpenTabs({
      tabsApi: { query },
      scriptingApi: { executeScript },
    });

    expect(query).toHaveBeenCalledWith({ url: "https://chatgpt.com/*" });
    expect(executeScript).toHaveBeenCalledTimes(1);
    expect(executeScript.mock.calls[0]?.[0].target.tabId).toBe(20);
    expect(result).toMatchObject({
      accessToken: "opaque-token",
      accountId: "account-local",
      source: "web_session",
    });
  });

  it("returns null when no existing tab can expose a session", async () => {
    const result = await acquireCodexCredentialFromOpenTabs({
      tabsApi: { query: vi.fn(async () => []) },
      scriptingApi: { executeScript: vi.fn() },
    });

    expect(result).toBeNull();
  });

  it("discovers the signed-in session from the background without touching a tab", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({
        accessToken: "background-session-token",
        account: { id: "account-background" },
      }),
    );
    const query = vi.fn();
    const executeScript = vi.fn();

    const result = await acquireCodexCredentialAutomatically({
      fetchImpl,
      tabsApi: { query },
      scriptingApi: { executeScript },
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      CODEX_WEB_SESSION_ENDPOINT,
      expect.objectContaining({
        cache: "no-store",
        credentials: "include",
        method: "GET",
      }),
    );
    expect(query).not.toHaveBeenCalled();
    expect(executeScript).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      accessToken: "background-session-token",
      accountId: "account-background",
      source: "web_session",
    });
  });

  it("does not send a generic ChatGPT user id as an account id", async () => {
    const result = await acquireCodexCredentialFromBackgroundSession({
      fetchImpl: vi.fn(async () =>
        jsonResponse({
          accessToken: "background-session-token",
          user: { id: "user-not-an-account" },
        }),
      ),
    });

    expect(result).toMatchObject({
      accessToken: "background-session-token",
      accountId: null,
    });
  });

  it("falls back to an existing tab when the background session has no token", async () => {
    const query = vi.fn(async () => [{ id: 42, active: true }] as chrome.tabs.Tab[]);
    const executeScript = vi.fn(async () => [
      {
        result: {
          accessToken: "page-session-token",
          accountId: "account-page",
          source: "observed_request",
        },
      },
    ]);

    const result = await acquireCodexCredentialAutomatically({
      fetchImpl: vi.fn(async () => jsonResponse({ user: { id: "user-only" } })),
      tabsApi: { query },
      scriptingApi: { executeScript },
    });

    expect(query).toHaveBeenCalledTimes(1);
    expect(executeScript).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      accessToken: "page-session-token",
      accountId: "account-page",
      source: "observed_request",
    });
  });

  it("rejects malformed and oversized background session responses", async () => {
    await expect(
      acquireCodexCredentialFromBackgroundSession({
        fetchImpl: vi.fn(async () =>
          new Response("not-json", { status: 200 }),
        ),
      }),
    ).resolves.toBeNull();

    await expect(
      acquireCodexCredentialFromBackgroundSession({
        fetchImpl: vi.fn(async () =>
          new Response(JSON.stringify({ accessToken: "x".repeat(200) }), {
            status: 200,
          }),
        ),
        responseSizeLimit: 64,
      }),
    ).resolves.toBeNull();
  });

  it("stops a stalled background session request and returns null", async () => {
    const fetchImpl = vi.fn(
      async (_url: string, init?: RequestInit): Promise<Response> =>
        new Promise((_, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
    );

    await expect(
      acquireCodexCredentialFromBackgroundSession({
        fetchImpl,
        requestTimeoutMs: 1,
      }),
    ).resolves.toBeNull();
  });
});
