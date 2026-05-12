import { describe, expect, it, vi } from "vitest";

import {
  closeOpenedPageSessionTab,
  normalizeReloadOptions,
  openMissingPageSessionTab,
  reloadPageSessionTab,
  type PageSessionTabLifecycleTabsApi,
} from "./page-session-tab-lifecycle";

describe("page-session tab lifecycle helpers", () => {
  it("normalizes disabled, boolean, and object reload options", () => {
    const customOptions = {
      bypassCache: false,
      postLoadDelayMs: 0,
      waitForLoadTimeoutMs: 0,
    };

    expect(normalizeReloadOptions(undefined)).toBeNull();
    expect(normalizeReloadOptions(false)).toBeNull();
    expect(normalizeReloadOptions(true)).toEqual({});
    expect(normalizeReloadOptions(customOptions)).toBe(customOptions);
  });

  it("reloads with bypass cache by default and returns the loaded tab", async () => {
    const reload = vi.fn<NonNullable<PageSessionTabLifecycleTabsApi["reload"]>>();
    const get = vi
      .fn<NonNullable<PageSessionTabLifecycleTabsApi["get"]>>()
      .mockResolvedValue({
        id: 42,
        status: "complete",
        title: "Loaded usage page",
      });

    await expect(
      reloadPageSessionTab(
        {
          get,
          reload,
        },
        42,
        {
          waitForLoadTimeoutMs: 0,
        },
      ),
    ).resolves.toEqual({
      id: 42,
      status: "complete",
      title: "Loaded usage page",
    });

    expect(reload).toHaveBeenCalledWith(42, { bypassCache: true });
  });

  it("keeps explicit reload bypass-cache choices", async () => {
    const reload = vi.fn<NonNullable<PageSessionTabLifecycleTabsApi["reload"]>>();

    await reloadPageSessionTab(
      {
        reload,
      },
      7,
      {
        bypassCache: false,
      },
    );

    expect(reload).toHaveBeenCalledWith(7, { bypassCache: false });
  });

  it("opens a missing page and merges the loaded tab state", async () => {
    const create = vi
      .fn<NonNullable<PageSessionTabLifecycleTabsApi["create"]>>()
      .mockResolvedValue({
        id: 9,
        active: false,
        status: "loading",
        url: "https://cursor.com/dashboard",
      });
    const get = vi
      .fn<NonNullable<PageSessionTabLifecycleTabsApi["get"]>>()
      .mockResolvedValue({
        id: 9,
        active: true,
        status: "complete",
        title: "Cursor Usage",
      });

    await expect(
      openMissingPageSessionTab(
        {
          create,
          get,
        },
        {
          url: "https://cursor.com/dashboard",
          waitForLoadTimeoutMs: 0,
        },
      ),
    ).resolves.toEqual({
      id: 9,
      active: true,
      bindingMode: "auto",
      status: "complete",
      title: "Cursor Usage",
      url: "https://cursor.com/dashboard",
    });

    expect(create).toHaveBeenCalledWith({
      active: false,
      url: "https://cursor.com/dashboard",
    });
  });

  it("swallows close cleanup failures for user-closed tabs", async () => {
    const remove = vi
      .fn<NonNullable<PageSessionTabLifecycleTabsApi["remove"]>>()
      .mockRejectedValue(new Error("No tab with id: 13."));

    await expect(
      closeOpenedPageSessionTab(
        {
          remove,
        },
        13,
      ),
    ).resolves.toBeUndefined();

    expect(remove).toHaveBeenCalledWith(13);
  });
});
