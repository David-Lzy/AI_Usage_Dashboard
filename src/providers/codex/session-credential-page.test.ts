import { describe, expect, it, vi } from "vitest";

import { acquireCodexCredentialFromOpenTabs } from "./session-credential-page";

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
});
