import { afterEach, describe, expect, it, vi } from "vitest";

import {
  hasDirectPermissionControl,
  hasTabNavigationControl,
  openFullPageRoute,
  sortTabsByPriority,
} from "./app-browser-controls";

describe("app-browser-controls", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports browser controls as unavailable outside extension mode", () => {
    vi.unstubAllGlobals();

    expect(hasDirectPermissionControl()).toBe(false);
    expect(hasTabNavigationControl()).toBe(false);
  });

  it("detects extension permission and tab controls", () => {
    vi.stubGlobal("chrome", {
      runtime: {
        id: "extension-id",
      },
      permissions: {
        contains: vi.fn(),
        request: vi.fn(),
        remove: vi.fn(),
      },
      tabs: {
        query: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    });

    expect(hasDirectPermissionControl()).toBe(true);
    expect(hasTabNavigationControl()).toBe(true);
  });

  it("prioritizes active tabs before recency without mutating input", () => {
    const tabs = [
      { id: 1, active: false, lastAccessed: 100 },
      { id: 2, active: true, lastAccessed: 1 },
      { id: 3, active: false, lastAccessed: 900 },
    ] as chrome.tabs.Tab[];

    const sorted = sortTabsByPriority(tabs);

    expect(sorted.map((tab) => tab.id)).toEqual([2, 3, 1]);
    expect(tabs.map((tab) => tab.id)).toEqual([1, 2, 3]);
  });

  it("opens full-page routes through chrome tabs in extension mode", async () => {
    const create = vi.fn(async () => ({ id: 42 }) as chrome.tabs.Tab);
    const getURL = vi.fn(
      (path: string) => `chrome-extension://extension-id/${path}`,
    );

    vi.stubGlobal("chrome", {
      runtime: {
        id: "extension-id",
        getURL,
      },
      tabs: {
        create,
      },
    });

    await openFullPageRoute({ name: "provider-detail", providerId: "codex" });

    expect(getURL).toHaveBeenCalledWith(
      "src/sidepanel/index.html?surface=full-page#provider-detail/codex",
    );
    expect(create).toHaveBeenCalledWith({
      url: "chrome-extension://extension-id/src/sidepanel/index.html?surface=full-page#provider-detail/codex",
      active: true,
    });
  });
});
