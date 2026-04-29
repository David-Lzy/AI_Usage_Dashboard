import { describe, expect, it, vi } from "vitest";

import { createPageSessionClient } from "./page-session";

describe("createPageSessionClient", () => {
  it("discovers the highest-priority matching tab in DOM mode", async () => {
    const query = vi.fn(async () => [
      {
        id: 12,
        active: false,
        lastAccessed: 20,
      },
      {
        id: 34,
        active: true,
        lastAccessed: 10,
      },
    ]);
    const executeScript = vi.fn(
      async ({ target }: { target: { tabId: number } }) => [
        {
          result:
            target.tabId === 34
              ? {
                  url: "https://example.com/dashboard/usage",
                  title: "Usage",
                  heading: "Usage",
                  html: "<html><body><h1>Usage</h1></body></html>",
                  scripts: {},
                }
              : {
                  url: "https://example.com",
                  title: "Home",
                  heading: "Home",
                  html: "<html><body><h1>Home</h1></body></html>",
                  scripts: {},
                },
        },
      ],
    );
    const client = createPageSessionClient({
      tabsApi: { query },
      scriptingApi: { executeScript },
    });

    const result = await client.capture({
      providerId: "cursor",
      pageLabel: "Usage page",
      urlPatterns: ["https://example.com/*"],
      extraction: {
        mode: "dom",
      },
      match(page) {
        return page.title === "Usage" ? "matched" : "unmatched";
      },
    });

    expect(result.status).toBe("matched");
    expect(result.attempts).toHaveLength(1);

    if (result.status !== "matched") {
      throw new Error("Expected a matched page-session result.");
    }

    expect(result.target.tabId).toBe(34);
    expect(result.target.bindingMode).toBe("auto");
    expect(result.page.url).toBe("https://example.com/dashboard/usage");
    expect(query).toHaveBeenCalledWith({
      url: ["https://example.com/*"],
    });
  });

  it("uses the bound tab when a binding is provided", async () => {
    const get = vi.fn(async (tabId: number) => ({
      id: tabId,
      active: false,
      lastAccessed: 1,
      url: "https://example.com/codex/settings/usage",
    }));
    const query = vi.fn(async () => []);
    const executeScript = vi.fn(async () => [
      {
        result: {
          url: "https://example.com/codex/settings/usage",
          title: "Codex usage",
          heading: "Codex usage",
          html: "<html><body><h1>Codex usage</h1></body></html>",
          scripts: {},
        },
      },
    ]);
    const client = createPageSessionClient({
      tabsApi: { query, get },
      scriptingApi: { executeScript },
    });

    const result = await client.capture({
      providerId: "codex",
      pageLabel: "Codex usage page",
      urlPatterns: ["https://chatgpt.com/*"],
      binding: {
        mode: "bound",
        tabId: 99,
      },
      extraction: {
        mode: "dom",
      },
      match() {
        return "matched";
      },
    });

    expect(result.status).toBe("matched");

    if (result.status !== "matched") {
      throw new Error("Expected a matched page-session result.");
    }

    expect(result.target.bindingMode).toBe("bound");
    expect(result.target.tabId).toBe(99);
    expect(get).toHaveBeenCalledWith(99);
    expect(query).toHaveBeenCalledWith({
      url: ["https://chatgpt.com/*"],
    });
  });

  it("falls back to auto discovery when the bound tab is missing", async () => {
    const get = vi.fn(async () => {
      throw new Error("Tab not found");
    });
    const query = vi.fn(async () => [
      {
        id: 22,
        active: true,
        lastAccessed: 50,
        url: "https://chatgpt.com/codex/cloud/settings/analytics#usage",
        title: "Codex",
      },
    ]);
    const executeScript = vi.fn(async () => [
      {
        result: {
          url: "https://chatgpt.com/codex/cloud/settings/analytics#usage",
          title: "Codex",
          heading: "Codex analytics",
          html: "<html><body><h1>Codex</h1></body></html>",
          scripts: {},
        },
      },
    ]);
    const client = createPageSessionClient({
      tabsApi: { query, get },
      scriptingApi: { executeScript },
    });

    const result = await client.capture({
      providerId: "codex",
      pageLabel: "Codex analytics page",
      urlPatterns: ["https://chatgpt.com/codex/*"],
      binding: {
        mode: "bound",
        tabId: 99,
        matchedUrl: "https://chatgpt.com/codex/cloud/settings/analytics#usage",
        matchedTitle: "Codex",
      },
      extraction: {
        mode: "dom",
      },
      match(page) {
        return page.title === "Codex" ? "matched" : "unmatched";
      },
    });

    expect(result.status).toBe("matched");

    if (result.status !== "matched") {
      throw new Error("Expected a matched page-session result.");
    }

    expect(result.target.tabId).toBe(22);
    expect(result.target.bindingMode).toBe("auto");
    expect(result.attempts).toEqual([
      {
        tabId: 99,
        bindingMode: "bound",
        status: "binding_missing",
        url: "https://chatgpt.com/codex/cloud/settings/analytics#usage",
        title: "Codex",
      },
      {
        tabId: 22,
        bindingMode: "auto",
        status: "matched",
        url: "https://chatgpt.com/codex/cloud/settings/analytics#usage",
        title: "Codex",
      },
    ]);
  });

  it("prefers the previously matched URL when reconnecting in auto mode", async () => {
    const executeScript = vi.fn(
      async ({ target }: { target: { tabId: number } }) => [
        {
          result:
            target.tabId === 41
              ? {
                  url: "https://cursor.com/dashboard/usage",
                  title: "Cursor Usage",
                  heading: "Usage",
                  html: "<html><body><h1>Usage</h1></body></html>",
                  scripts: {},
                }
              : {
                  url: "https://cursor.com/dashboard",
                  title: "Cursor Home",
                  heading: "Home",
                  html: "<html><body><h1>Home</h1></body></html>",
                  scripts: {},
                },
        },
      ],
    );
    const client = createPageSessionClient({
      tabsApi: {
        query: vi.fn(async () => [
          {
            id: 40,
            active: true,
            lastAccessed: 200,
            url: "https://cursor.com/dashboard",
            title: "Cursor Home",
          },
          {
            id: 41,
            active: false,
            lastAccessed: 100,
            url: "https://cursor.com/dashboard/usage",
            title: "Cursor Usage",
          },
        ]),
      },
      scriptingApi: { executeScript },
    });

    const result = await client.capture({
      providerId: "cursor",
      pageLabel: "Cursor usage page",
      urlPatterns: ["https://cursor.com/*"],
      binding: {
        mode: "auto",
        tabId: 41,
        matchedUrl: "https://cursor.com/dashboard/usage",
        matchedTitle: "Cursor Usage",
      },
      extraction: {
        mode: "dom",
      },
      match(page) {
        return page.url.endsWith("/dashboard/usage") ? "matched" : "unmatched";
      },
    });

    expect(result.status).toBe("matched");

    if (result.status !== "matched") {
      throw new Error("Expected a matched page-session result.");
    }

    expect(result.target.tabId).toBe(41);
    expect(result.attempts[0]).toMatchObject({
      tabId: 41,
      bindingMode: "auto",
      status: "matched",
    });
  });

  it("captures boot-data selectors and main-world window values", async () => {
    const executeScript = vi.fn(
      async ({
        world,
        args,
      }: {
        world?: string;
        args?: unknown[];
      }) => {
        if (world === "MAIN") {
          return [
            {
              result: {
                __INITIAL_STATE__: "{\"used\":12,\"remaining\":8}",
              },
            },
          ];
        }

        if (Array.isArray(args?.[0])) {
          return [
            {
              result: {
                url: "https://cursor.com/dashboard/usage",
                title: "Cursor Usage",
                heading: "Usage",
                html: "<html><body><script id=\"__NEXT_DATA__\">{\"plan\":\"pro\"}</script></body></html>",
                scripts: {
                  "#__NEXT_DATA__": "{\"plan\":\"pro\"}",
                },
              },
            },
          ];
        }

        throw new Error("Unexpected executeScript call");
      },
    );
    const client = createPageSessionClient({
      tabsApi: {
        query: vi.fn(async () => [{ id: 7, active: true, lastAccessed: 1 }]),
      },
      scriptingApi: { executeScript },
    });

    const result = await client.capture({
      providerId: "cursor",
      pageLabel: "Cursor personal usage page",
      urlPatterns: ["https://cursor.com/*"],
      extraction: {
        mode: "boot_data",
        scriptSelectors: ["#__NEXT_DATA__"],
        windowKeys: ["__INITIAL_STATE__"],
      },
      match() {
        return "matched";
      },
    });

    expect(result.status).toBe("matched");

    if (result.status !== "matched") {
      throw new Error("Expected a matched page-session result.");
    }

    expect(result.page.bootData).toEqual({
      scripts: {
        "#__NEXT_DATA__": "{\"plan\":\"pro\"}",
      },
      windowValues: {
        __INITIAL_STATE__: "{\"used\":12,\"remaining\":8}",
      },
    });
  });

  it("installs the network observer bridge and reads observed responses", async () => {
    const executeScript = vi.fn(
      async ({
        world,
        args,
      }: {
        world?: string;
        args?: unknown[];
      }) => {
        if (world === "MAIN") {
          return [{ result: { installed: true, entryCount: 1 } }];
        }

        if (Array.isArray(args?.[0])) {
          return [
            {
              result: {
                url: "https://console.cloud.google.com/gemini-code-assist/metrics",
                title: "Gemini metrics",
                heading: "Metrics",
                html: "<html><body><h1>Metrics</h1></body></html>",
                scripts: {},
              },
            },
          ];
        }

        if (typeof args?.[0] === "string") {
          return [
            {
              result: JSON.stringify({
                matchUrlSubstrings: ["/metrics"],
                maxEntries: 5,
                entries: [
                  {
                    url: "https://console.cloud.google.com/api/metrics",
                    method: "GET",
                    status: 200,
                    ok: true,
                    contentType: "application/json",
                    bodyText: "{\"series\":[1,2,3]}",
                    capturedAt: "2026-04-21T10:00:00.000Z",
                    transport: "fetch",
                  },
                ],
              }),
            },
          ];
        }

        throw new Error("Unexpected executeScript call");
      },
    );
    const client = createPageSessionClient({
      tabsApi: {
        query: vi.fn(async () => [{ id: 11, active: true, lastAccessed: 1 }]),
      },
      scriptingApi: { executeScript },
    });

    const result = await client.capture({
      providerId: "gemini",
      pageLabel: "Gemini metrics page",
      urlPatterns: ["https://console.cloud.google.com/*"],
      extraction: {
        mode: "network_observer",
        matchUrlSubstrings: ["/metrics"],
        maxEntries: 5,
      },
      match() {
        return "matched";
      },
    });

    expect(result.status).toBe("matched");

    if (result.status !== "matched") {
      throw new Error("Expected a matched page-session result.");
    }

    expect(result.page.observedNetwork).toEqual({
      matchUrlSubstrings: ["/metrics"],
      maxEntries: 5,
      entries: [
        {
          url: "https://console.cloud.google.com/api/metrics",
          method: "GET",
          status: 200,
          ok: true,
          contentType: "application/json",
          bodyText: "{\"series\":[1,2,3]}",
          capturedAt: "2026-04-21T10:00:00.000Z",
          transport: "fetch",
        },
      ],
    });
  });

  it("reports capture_unavailable when a candidate tab cannot be read", async () => {
    const executeScript = vi.fn(async () => {
      throw new Error("Cannot access contents of the page.");
    });
    const client = createPageSessionClient({
      tabsApi: {
        query: vi.fn(async () => [
          {
            id: 17,
            active: true,
            lastAccessed: 1,
            url: "https://chatgpt.com/codex/cloud/settings/analytics#usage",
            title: "Codex",
          },
        ]),
      },
      scriptingApi: { executeScript },
    });

    const result = await client.capture({
      providerId: "codex",
      pageLabel: "Codex cloud analytics page",
      urlPatterns: ["https://chatgpt.com/codex/*"],
      extraction: {
        mode: "dom",
      },
      match() {
        return "matched";
      },
    });

    expect(result.status).toBe("capture_unavailable");
    expect(result.attempts).toEqual([
      {
        tabId: 17,
        bindingMode: "auto",
        status: "capture_failed",
        error: "Cannot access contents of the page.",
      },
    ]);
  });
});
