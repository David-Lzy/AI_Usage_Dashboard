import { afterEach, describe, expect, it, vi } from "vitest";

import {
  closeSidePanelBestEffort,
  detectBrowserTarget,
  getBrowserCapabilities,
  openExtensionTabPath,
  openSideSurfacePath,
} from "./extension-side-panel-controls";

describe("extension side panel controls", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("detects Chrome sidePanel capabilities", () => {
    const openPopup = vi.fn(async () => undefined);

    vi.stubGlobal("chrome", {
      action: {
        openPopup,
      },
      runtime: {
        id: "extension-id",
        getURL: (path: string) => `chrome-extension://extension-id/${path}`,
      },
      sidePanel: {
        open: vi.fn(async () => undefined),
        setOptions: vi.fn(async () => undefined),
      },
      storage: {
        sync: {},
      },
    });

    expect(detectBrowserTarget()).toBe("chrome");
    expect(getBrowserCapabilities()).toEqual({
      supportsActionOpenPopup: true,
      supportsChromeSidePanel: true,
      supportsFirefoxSidebar: false,
      supportsProviderFaviconIcon: true,
      supportsStorageSync: true,
    });
  });

  it("detects Firefox sidebar capabilities", () => {
    vi.stubGlobal("browser", {
      runtime: {
        id: "extension-id",
      },
      sidebarAction: {
        open: vi.fn(async () => undefined),
        setPanel: vi.fn(async () => undefined),
      },
      storage: {
        sync: {},
      },
    });

    expect(detectBrowserTarget()).toBe("firefox");
    expect(getBrowserCapabilities()).toEqual({
      supportsActionOpenPopup: false,
      supportsChromeSidePanel: false,
      supportsFirefoxSidebar: true,
      supportsProviderFaviconIcon: false,
      supportsStorageSync: true,
    });
  });

  it("opens Chrome side surfaces against the active tab first", async () => {
    const open = vi.fn(async () => undefined);
    const setOptions = vi.fn(async () => undefined);
    const query = vi.fn(async () => [{ id: 7 }]);
    const getCurrent = vi.fn(async () => ({ id: 12 }));

    vi.stubGlobal("chrome", {
      runtime: {
        id: "extension-id",
      },
      sidePanel: {
        open,
        setOptions,
      },
      tabs: {
        query,
      },
      windows: {
        getCurrent,
      },
    });

    await expect(openSideSurfacePath("src/sidepanel/index.html#settings")).resolves.toBe(
      true,
    );

    expect(query).toHaveBeenCalledWith({
      active: true,
      currentWindow: true,
    });
    expect(setOptions).toHaveBeenCalledWith({
      enabled: true,
      path: "src/sidepanel/index.html#settings",
      tabId: 7,
    });
    expect(open).toHaveBeenCalledWith({ tabId: 7 });
    expect(getCurrent).not.toHaveBeenCalled();
  });

  it("opens Firefox sidebar paths inside the same user action turn", async () => {
    const calls: string[] = [];
    let resolveSetPanel!: () => void;
    const setPanel = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          calls.push("setPanel");
          resolveSetPanel = resolve;
        }),
    );
    const open = vi.fn(() => {
      calls.push("open");
    });

    vi.stubGlobal("browser", {
      runtime: {
        id: "extension-id",
      },
      sidebarAction: {
        open,
        setPanel,
      },
    });

    const openPromise = openSideSurfacePath("src/sidepanel/index.html#dashboard");

    expect(calls).toEqual(["setPanel", "open"]);
    resolveSetPanel();
    await expect(openPromise).resolves.toBe(true);
    expect(setPanel).toHaveBeenCalledWith({
      panel: "src/sidepanel/index.html#dashboard",
    });
  });

  it("reuses the highest priority full-page tab and removes duplicates", async () => {
    const create = vi.fn(async () => undefined);
    const update = vi.fn(async () => undefined);
    const remove = vi.fn(async () => undefined);
    const fullPageBaseUrl =
      "chrome-extension://extension-id/src/sidepanel/index.html?surface=full-page";
    const targetUrl = `${fullPageBaseUrl}#settings`;

    vi.stubGlobal("browser", {
      runtime: {
        id: "extension-id",
        getURL: (path: string) => `chrome-extension://extension-id/${path}`,
      },
      tabs: {
        create,
        query: vi.fn(async () => [
          {
            active: false,
            id: 3,
            lastAccessed: 900,
            url: `${fullPageBaseUrl}#dashboard`,
          },
          {
            active: true,
            id: 8,
            lastAccessed: 1,
            url: `${fullPageBaseUrl}#provider/codex`,
          },
          {
            active: true,
            id: 11,
            lastAccessed: 2,
            url: "https://example.com/",
          },
        ]),
        remove,
        update,
      },
    });

    await expect(
      openExtensionTabPath("src/sidepanel/index.html?surface=full-page#settings"),
    ).resolves.toBe(true);

    expect(update).toHaveBeenCalledWith(8, {
      active: true,
      url: targetUrl,
    });
    expect(remove).toHaveBeenCalledWith(3);
    expect(create).not.toHaveBeenCalled();
  });

  it("keeps sidePanel close failures best-effort", async () => {
    const close = vi
      .fn()
      .mockRejectedValueOnce(new Error("tab-scoped close unavailable"))
      .mockResolvedValueOnce(undefined);

    vi.stubGlobal("chrome", {
      runtime: {
        id: "extension-id",
      },
      sidePanel: {
        close,
        open: vi.fn(async () => undefined),
        setOptions: vi.fn(async () => undefined),
      },
    });

    await expect(
      closeSidePanelBestEffort([{ tabId: 7 }, { windowId: 12 }]),
    ).resolves.toBeUndefined();

    expect(close).toHaveBeenNthCalledWith(1, { tabId: 7 });
    expect(close).toHaveBeenNthCalledWith(2, { windowId: 12 });
  });
});
