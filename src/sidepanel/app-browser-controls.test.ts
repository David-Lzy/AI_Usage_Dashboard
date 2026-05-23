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

  it("detects Firefox browser namespace permission and tab controls", () => {
    vi.stubGlobal("browser", {
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

    await openFullPageRoute({ name: "provider-detail", providerId: "codex-personal-page" });

    expect(getURL).toHaveBeenCalledWith(
      "src/sidepanel/index.html?surface=full-page#provider-detail/codex-personal-page",
    );
    expect(create).toHaveBeenCalledWith({
      url: "chrome-extension://extension-id/src/sidepanel/index.html?surface=full-page#provider-detail/codex-personal-page",
      active: true,
    });
  });

  it("captures surface session state before opening full-page tabs", async () => {
    const create = vi.fn(async () => ({ id: 42 }) as chrome.tabs.Tab);
    const set = vi.fn(async () => undefined);

    vi.stubGlobal("chrome", {
      runtime: {
        id: "extension-id",
        getURL: (path: string) => `chrome-extension://extension-id/${path}`,
      },
      storage: {
        session: {
          get: vi.fn(async () => ({})),
          remove: vi.fn(async () => undefined),
          set,
        },
      },
      tabs: {
        create,
      },
    });
    vi.stubGlobal("window", {
      scrollY: 384,
    });

    await openFullPageRoute({
      name: "provider-detail",
      providerId: "codex-personal-page",
    });

    expect(set).toHaveBeenCalledWith({
      "ai-usage-dashboard:surface-session-state:standard:provider-detail/codex-personal-page":
        expect.objectContaining({
          state: expect.objectContaining({
            providerDetail: {
              providerId: "codex-personal-page",
              quotaDetailsOpen: {},
            },
            routeKey: "#provider-detail/codex-personal-page",
            routeName: "provider-detail",
            scrollY: 384,
          }),
        }),
    });
    expect(set.mock.invocationCallOrder[0]).toBeLessThan(
      create.mock.invocationCallOrder[0],
    );
  });

  it("continues surface navigation when session capture fails", async () => {
    const create = vi.fn(async () => ({ id: 42 }) as chrome.tabs.Tab);

    vi.stubGlobal("chrome", {
      runtime: {
        id: "extension-id",
        getURL: (path: string) => `chrome-extension://extension-id/${path}`,
      },
      storage: {
        session: {
          get: vi.fn(async () => ({})),
          remove: vi.fn(async () => undefined),
          set: vi.fn(async () => {
            throw new Error("storage unavailable");
          }),
        },
      },
      tabs: {
        create,
      },
    });

    await openFullPageRoute({ name: "dashboard" });

    expect(create).toHaveBeenCalledWith({
      url: "chrome-extension://extension-id/src/sidepanel/index.html?surface=full-page#dashboard",
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

  it("opens Firefox sidebar routes from full-page tabs and closes the tab after success", async () => {
    const setPanel = vi.fn(async () => undefined);
    const open = vi.fn(async () => undefined);
    const remove = vi.fn(async () => undefined);

    vi.stubGlobal("browser", {
      runtime: {
        id: "extension-id",
      },
      sidebarAction: {
        open,
        setPanel,
      },
      tabs: {
        getCurrent: vi.fn(async () => ({ id: 88 })),
        remove,
      },
    });

    await openSidePanelRoute({ name: "settings" });

    expect(setPanel).toHaveBeenCalledWith({
      panel: "src/sidepanel/index.html#settings",
    });
    expect(open).toHaveBeenCalled();
    expect(remove).toHaveBeenCalledWith(88);
  });
});
