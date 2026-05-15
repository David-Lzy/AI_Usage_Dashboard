import { afterEach, describe, expect, it, vi } from "vitest";

import {
  hasDirectPermissionControl,
  hasTabNavigationControl,
  openFullPageRoute,
  openSidePanelRoute,
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

  it("closes the current side panel after opening a full-page tab when supported", async () => {
    const create = vi.fn(async () => ({ id: 42 }) as chrome.tabs.Tab);
    const close = vi.fn(async () => undefined);
    const query = vi.fn(async () => [{ id: 7 }]);
    const getURL = vi.fn(
      (path: string) => `chrome-extension://extension-id/${path}`,
    );

    vi.stubGlobal("chrome", {
      runtime: {
        id: "extension-id",
        getURL,
      },
      sidePanel: {
        close,
      },
      tabs: {
        create,
        query,
      },
    });

    await openFullPageRoute({ name: "dashboard" });

    expect(create).toHaveBeenCalledWith({
      url: "chrome-extension://extension-id/src/sidepanel/index.html?surface=full-page#dashboard",
      active: true,
    });
    expect(query.mock.invocationCallOrder[0]).toBeLessThan(
      create.mock.invocationCallOrder[0],
    );
    expect(close).toHaveBeenCalledWith({ tabId: 7 });
  });

  it("prefers closing window-level side panels when expanding sidebar routes into full-page tabs", async () => {
    const create = vi.fn(async () => ({ id: 42 }) as chrome.tabs.Tab);
    const close = vi.fn(async () => undefined);
    const getCurrent = vi.fn(async () => ({ id: 9 }));
    const query = vi.fn(async () => [{ id: 7 }]);
    const getURL = vi.fn(
      (path: string) => `chrome-extension://extension-id/${path}`,
    );

    vi.stubGlobal("chrome", {
      runtime: {
        id: "extension-id",
        getURL,
      },
      sidePanel: {
        close,
      },
      tabs: {
        create,
        query,
      },
      windows: {
        getCurrent,
      },
    });

    await openFullPageRoute({ name: "settings" });

    expect(getCurrent.mock.invocationCallOrder[0]).toBeLessThan(
      create.mock.invocationCallOrder[0],
    );
    expect(query.mock.invocationCallOrder[0]).toBeLessThan(
      create.mock.invocationCallOrder[0],
    );
    expect(close).toHaveBeenNthCalledWith(1, { windowId: 9 });
    expect(close).toHaveBeenNthCalledWith(2, { tabId: 7 });
  });

  it("opens side-panel routes from a full-page tab and closes the tab after success", async () => {
    const setOptions = vi.fn(async () => undefined);
    const open = vi.fn(async () => undefined);
    const remove = vi.fn(async () => undefined);

    vi.stubGlobal("chrome", {
      runtime: {
        id: "extension-id",
      },
      sidePanel: {
        open,
        setOptions,
      },
      tabs: {
        getCurrent: vi.fn(async () => ({ id: 88 }) as chrome.tabs.Tab),
        query: vi.fn(async () => [{ id: 7 }]),
        remove,
      },
      windows: {
        getCurrent: vi.fn(async () => ({ id: 9 })),
      },
    });

    await openSidePanelRoute({ name: "settings" });

    expect(setOptions).toHaveBeenCalledWith({
      enabled: true,
      path: "src/sidepanel/index.html#settings",
    });
    expect(open).toHaveBeenCalledWith({ windowId: 9 });
    expect(remove).toHaveBeenCalledWith(88);
  });
});
