import { describe, expect, it, vi } from "vitest";

import fixtureHtml from "../../../fixtures/jetbrains/users-and-licensing.fixture.html?raw";

import { createJetBrainsConsoleClient } from "./official";

describe("createJetBrainsConsoleClient", () => {
  it("returns the fixture page in fixture mode", async () => {
    const client = createJetBrainsConsoleClient({
      source: "fixture",
    });

    await expect(client.getUsersAndLicensingPage()).resolves.toEqual({
      status: "ok",
      page: {
        html: fixtureHtml,
      },
      pageBinding: {
        mode: "auto",
        status: "unbound",
        tabId: null,
        matchedUrl: null,
        matchedTitle: null,
        updatedAt: null,
      },
    });
  });

  it("captures the live Users and licensing page from the highest-priority open JetBrains tab", async () => {
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
    const executeScript = vi.fn(async ({ target }: { target: { tabId: number } }) => {
      if (target.tabId === 34) {
        return [
          {
            result: {
              url: "https://account.jetbrains.com/organization/ai/users-and-licensing",
              title: "Users and licensing | JetBrains Console",
              heading: "Users and licensing",
              html: fixtureHtml,
            },
          },
        ];
      }

      return [
        {
          result: {
            url: "https://www.jetbrains.com",
            title: "JetBrains",
            heading: "Welcome",
            html: "<html><body><h1>Welcome</h1></body></html>",
          },
        },
      ];
    });
    const client = createJetBrainsConsoleClient({
      source: "live",
      tabsApi: { query },
      scriptingApi: { executeScript },
    });

    await expect(client.getUsersAndLicensingPage()).resolves.toEqual({
      status: "ok",
      page: {
        html: fixtureHtml,
        url: "https://account.jetbrains.com/organization/ai/users-and-licensing",
        title: "Users and licensing | JetBrains Console",
        heading: "Users and licensing",
      },
      pageBinding: {
        mode: "auto",
        status: "bound",
        tabId: 34,
        matchedUrl:
          "https://account.jetbrains.com/organization/ai/users-and-licensing",
        matchedTitle: "Users and licensing | JetBrains Console",
        updatedAt: expect.any(String),
      },
    });
    expect(query).toHaveBeenCalledWith({
      url: ["https://account.jetbrains.com/*", "https://*.jetbrains.com/*"],
    });
    expect(executeScript).toHaveBeenCalledTimes(1);
  });

  it("returns a clear error when no JetBrains tab is available", async () => {
    const client = createJetBrainsConsoleClient({
      source: "live",
      tabsApi: {
        query: vi.fn(async () => []),
      },
      scriptingApi: {
        executeScript: vi.fn(),
      },
    });

    await expect(client.getUsersAndLicensingPage()).resolves.toEqual({
      status: "open_page_required",
      reason:
        "Open the JetBrains Console Users and licensing page in a browser tab, then refresh again.",
      pageBinding: {
        mode: "auto",
        status: "unbound",
        tabId: null,
        matchedUrl: null,
        matchedTitle: null,
        updatedAt: null,
      },
    });
  });

  it("returns a clear error when JetBrains tabs exist but only logged-out pages are available", async () => {
    const client = createJetBrainsConsoleClient({
      source: "live",
      tabsApi: {
        query: vi.fn(async () => [{ id: 7, active: true, lastAccessed: 1 }]),
      },
      scriptingApi: {
        executeScript: vi.fn(async () => [
          {
            result: {
              url: "https://account.jetbrains.com/login",
              title: "Sign in - JetBrains Account",
              heading: "Sign in",
              html: "<html><body><h1>Sign in to JetBrains</h1><input name=\"password\" /></body></html>",
            },
          },
        ]),
      },
    });

    await expect(client.getUsersAndLicensingPage()).resolves.toEqual({
      status: "logged_out",
      reason:
        "JetBrains Console session not detected. Log in and reopen Users and licensing before refreshing.",
      pageBinding: {
        mode: "auto",
        status: "unbound",
        tabId: null,
        matchedUrl: null,
        matchedTitle: null,
        updatedAt: null,
      },
    });
  });

  it("returns a clear access error when the JetBrains org page resolves to a 400 account screen", async () => {
    const client = createJetBrainsConsoleClient({
      source: "live",
      tabsApi: {
        query: vi.fn(async () => [{ id: 9, active: true, lastAccessed: 1 }]),
      },
      scriptingApi: {
        executeScript: vi.fn(async () => [
          {
            result: {
              url: "https://account.jetbrains.com/organization/ai/users-and-licensing",
              title: "JetBrains Account :: Error 400: Bad Request",
              heading: "Bad Request",
              html: "<html><body><h1>Bad Request</h1></body></html>",
            },
          },
        ]),
      },
    });

    await expect(client.getUsersAndLicensingPage()).resolves.toEqual({
      status: "access_unavailable",
      reason:
        "The current JetBrains account does not expose a usable organization Users and licensing page. Switch to an organization account with AI visibility, then refresh again.",
      pageBinding: {
        mode: "auto",
        status: "unbound",
        tabId: null,
        matchedUrl: null,
        matchedTitle: null,
        updatedAt: null,
      },
    });
  });
});
