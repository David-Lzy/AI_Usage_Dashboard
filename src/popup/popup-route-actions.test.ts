import { afterEach, describe, expect, it, vi } from "vitest";

import { consumePendingFullPageEntry } from "../shared/extension-surface-entry";
import { SETTINGS_SECTION_IDS } from "../sidepanel/settings-section-ids";
import {
  openFullDashboardTab,
  openFullPageRoute,
  openSidePanelRoute,
  openSettings,
} from "./popup-route-actions";

function createStorage() {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
}

function stubPopupWindow() {
  const localStorage = createStorage();
  const open = vi.fn();
  const close = vi.fn();

  vi.stubGlobal("window", {
    close,
    localStorage,
    location: {
      href: "http://127.0.0.1:4173/src/popup/index.html",
    },
    open,
  });

  return {
    close,
    localStorage,
    open,
  };
}

describe("popup route actions", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens focused Settings routes through the full-page preview fallback", async () => {
    const popupWindow = stubPopupWindow();

    await openSettings({
      kind: "section",
      sectionId: SETTINGS_SECTION_IDS.quickSetup,
    });

    expect(popupWindow.open).toHaveBeenCalledWith(
      "http://127.0.0.1:4173/src/sidepanel/index.html?surface=full-page#settings/section/settings-quick-setup",
      "_blank",
      "noopener,noreferrer",
    );
    expect(popupWindow.close).not.toHaveBeenCalled();
  });

  it("opens focused Settings routes in Chrome full-page tabs and closes the popup", async () => {
    const popupWindow = stubPopupWindow();
    const create = vi.fn(async () => undefined);

    vi.stubGlobal("chrome", {
      runtime: {
        id: "extension-id",
        getURL: (path: string) => `chrome-extension://extension-id/${path}`,
      },
      tabs: {
        create,
      },
    });

    await openSettings({
      kind: "quick-setup-provider",
      providerId: "cursor-personal-page",
    });

    expect(create).toHaveBeenCalledWith({
      active: true,
      url: "chrome-extension://extension-id/src/sidepanel/index.html?surface=full-page#settings/quick-setup/cursor-personal-page",
    });
    expect(
      consumePendingFullPageEntry(
        "#settings/quick-setup/cursor-personal-page",
        popupWindow.localStorage,
        Date.now(),
      ),
    ).toBe("popup-expand");
    expect(popupWindow.close).toHaveBeenCalled();
  });

  it("opens Chrome sidePanel routes against the active tab", async () => {
    const popupWindow = stubPopupWindow();
    const setOptions = vi.fn(async () => undefined);
    const open = vi.fn(async () => undefined);
    const query = vi.fn(async () => [{ id: 7 }]);
    const getCurrent = vi.fn(async () => ({ id: 9 }));

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

    await openSidePanelRoute({
      name: "settings",
      focus: {
        kind: "quick-setup-provider",
        providerId: "cursor-personal-page",
      },
    });

    expect(query).toHaveBeenCalledWith({
      active: true,
      currentWindow: true,
    });
    expect(setOptions).toHaveBeenCalledWith({
      enabled: true,
      path: "src/sidepanel/index.html#settings/quick-setup/cursor-personal-page",
      tabId: 7,
    });
    expect(open).toHaveBeenCalledWith({ tabId: 7 });
    expect(getCurrent).not.toHaveBeenCalled();
    expect(popupWindow.close).toHaveBeenCalled();
  });

  it("falls back to current-window sidePanel routes when no active tab id is available", async () => {
    const popupWindow = stubPopupWindow();
    const setOptions = vi.fn(async () => undefined);
    const open = vi.fn(async () => undefined);

    vi.stubGlobal("chrome", {
      runtime: {
        id: "extension-id",
      },
      sidePanel: {
        open,
        setOptions,
      },
      tabs: {
        query: vi.fn(async () => [{}]),
      },
      windows: {
        getCurrent: vi.fn(async () => ({ id: 11 })),
      },
    });

    await openSidePanelRoute({ name: "dashboard" });

    expect(setOptions).toHaveBeenCalledWith({
      enabled: true,
      path: "src/sidepanel/index.html#dashboard",
    });
    expect(open).toHaveBeenCalledWith({ windowId: 11 });
    expect(popupWindow.close).toHaveBeenCalled();
  });

  it("opens Firefox sidebar routes when sidebarAction is available", async () => {
    const popupWindow = stubPopupWindow();
    const setPanel = vi.fn(async () => undefined);
    const open = vi.fn(async () => undefined);

    vi.stubGlobal("browser", {
      runtime: {
        id: "extension-id",
      },
      sidebarAction: {
        open,
        setPanel,
      },
    });

    await openSidePanelRoute({ name: "dashboard" });

    expect(setPanel).toHaveBeenCalledWith({
      panel: "src/sidepanel/index.html#dashboard",
    });
    expect(open).toHaveBeenCalled();
    expect(popupWindow.close).toHaveBeenCalled();
  });

  it("opens full-page routes through Firefox tabs when side surfaces are unavailable", async () => {
    const popupWindow = stubPopupWindow();
    const create = vi.fn(async () => undefined);

    vi.stubGlobal("browser", {
      runtime: {
        id: "extension-id",
        getURL: (path: string) => `moz-extension://extension-id/${path}`,
      },
      tabs: {
        create,
      },
    });

    await openSettings({
      kind: "section",
      sectionId: SETTINGS_SECTION_IDS.appearance,
    });

    expect(create).toHaveBeenCalledWith({
      active: true,
      url: "moz-extension://extension-id/src/sidepanel/index.html?surface=full-page#settings/section/settings-appearance",
    });
    expect(popupWindow.close).toHaveBeenCalled();
  });

  it("stores the pending full-page entry before preview fallback open", async () => {
    const popupWindow = stubPopupWindow();

    await openFullDashboardTab();

    expect(
      consumePendingFullPageEntry(
        "#dashboard",
        popupWindow.localStorage,
        Date.now(),
      ),
    ).toBe("popup-expand");
    expect(popupWindow.open).toHaveBeenCalledWith(
      "http://127.0.0.1:4173/src/sidepanel/index.html?surface=full-page#dashboard",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("opens full-page extension routes in Chrome tabs and closes the popup", async () => {
    const popupWindow = stubPopupWindow();
    const create = vi.fn(async () => undefined);

    vi.stubGlobal("chrome", {
      runtime: {
        id: "extension-id",
        getURL: (path: string) => `chrome-extension://extension-id/${path}`,
      },
      tabs: {
        create,
      },
    });

    await openFullPageRoute({
      name: "provider-detail",
      providerId: "codex-personal-page",
    });

    expect(create).toHaveBeenCalledWith({
      active: true,
      url: "chrome-extension://extension-id/src/sidepanel/index.html?surface=full-page#provider-detail/codex-personal-page",
    });
    expect(
      consumePendingFullPageEntry(
        "#provider-detail/codex-personal-page",
        popupWindow.localStorage,
        Date.now(),
      ),
    ).toBe("popup-expand");
    expect(popupWindow.close).toHaveBeenCalled();
  });

  it("best-effort closes the side panel when opening a full-page tab", async () => {
    const popupWindow = stubPopupWindow();
    const closeSidePanel = vi.fn(async () => undefined);
    const create = vi.fn(async () => undefined);
    const query = vi.fn(async () => [{ id: 17 }]);

    vi.stubGlobal("chrome", {
      runtime: {
        id: "extension-id",
        getURL: (path: string) => `chrome-extension://extension-id/${path}`,
      },
      sidePanel: {
        close: closeSidePanel,
      },
      tabs: {
        create,
        query,
      },
    });

    await openSettings();

    expect(create).toHaveBeenCalledWith({
      active: true,
      url: "chrome-extension://extension-id/src/sidepanel/index.html?surface=full-page#settings",
    });
    expect(query.mock.invocationCallOrder[0]).toBeLessThan(
      create.mock.invocationCallOrder[0],
    );
    expect(closeSidePanel).toHaveBeenCalledWith({ tabId: 17 });
    expect(popupWindow.close).toHaveBeenCalled();
  });
});
