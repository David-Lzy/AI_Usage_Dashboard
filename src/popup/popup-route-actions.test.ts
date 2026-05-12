import { afterEach, describe, expect, it, vi } from "vitest";

import { consumePendingFullPageEntry } from "../shared/extension-surface-entry";
import { SETTINGS_SECTION_IDS } from "../sidepanel/settings-section-ids";
import {
  openFullDashboardTab,
  openFullPageRoute,
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

  it("opens focused Settings routes through the sidepanel preview fallback", async () => {
    const popupWindow = stubPopupWindow();

    await openSettings({
      kind: "section",
      sectionId: SETTINGS_SECTION_IDS.quickSetup,
    });

    expect(popupWindow.open).toHaveBeenCalledWith(
      "http://127.0.0.1:4173/src/sidepanel/index.html#settings/section/settings-quick-setup",
      "_blank",
      "noopener,noreferrer",
    );
    expect(popupWindow.close).not.toHaveBeenCalled();
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
      providerId: "codex",
    });

    expect(create).toHaveBeenCalledWith({
      active: true,
      url: "chrome-extension://extension-id/src/sidepanel/index.html?surface=full-page#provider-detail/codex",
    });
    expect(
      consumePendingFullPageEntry(
        "#provider-detail/codex",
        popupWindow.localStorage,
        Date.now(),
      ),
    ).toBe("popup-expand");
    expect(popupWindow.close).toHaveBeenCalled();
  });
});
