import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getExtensionApiNamespace,
  getExtensionPermissionsApi,
  getExtensionScriptingApi,
  getExtensionTabsApi,
  hasExtensionRuntime,
} from "./extension-api";

describe("extension API namespace", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("prefers browser namespace when it has an extension runtime", () => {
    const browserPermissions = {
      contains: vi.fn(() => true),
    };
    const browserTabs = {
      query: vi.fn(async () => []),
    };
    const browserScripting = {
      executeScript: vi.fn(),
    };
    const chromeTabs = {
      query: vi.fn(async () => []),
    };

    vi.stubGlobal("browser", {
      permissions: browserPermissions,
      runtime: {
        id: "browser-extension-id",
      },
      scripting: browserScripting,
      tabs: browserTabs,
    });
    vi.stubGlobal("chrome", {
      runtime: {
        id: "chrome-extension-id",
      },
      tabs: chromeTabs,
    });

    const api = getExtensionApiNamespace();

    expect(api?.runtime?.id).toBe("browser-extension-id");
    expect(hasExtensionRuntime()).toBe(true);
    expect(getExtensionPermissionsApi()).toBe(browserPermissions);
    expect(getExtensionTabsApi()).toBe(browserTabs);
    expect(getExtensionScriptingApi()).toBe(browserScripting);
  });

  it("falls back to Chrome namespace when browser runtime is absent", () => {
    const chromePermissions = {
      request: vi.fn(() => true),
    };
    const chromeTabs = {
      create: vi.fn(async () => ({ id: 7 })),
    };

    vi.stubGlobal("browser", {
      tabs: {
        query: vi.fn(async () => []),
      },
    });
    vi.stubGlobal("chrome", {
      permissions: chromePermissions,
      runtime: {
        id: "chrome-extension-id",
      },
      tabs: chromeTabs,
    });

    const api = getExtensionApiNamespace();

    expect(api?.runtime?.id).toBe("chrome-extension-id");
    expect(hasExtensionRuntime()).toBe(true);
    expect(getExtensionPermissionsApi()).toBe(chromePermissions);
    expect(getExtensionTabsApi()).toBe(chromeTabs);
  });

  it("does not expose API groups without an extension runtime", () => {
    vi.stubGlobal("chrome", {
      permissions: {
        contains: vi.fn(() => true),
      },
      tabs: {
        query: vi.fn(async () => []),
      },
    });

    expect(getExtensionApiNamespace()).toEqual({
      permissions: expect.any(Object),
      tabs: expect.any(Object),
    });
    expect(hasExtensionRuntime()).toBe(false);
    expect(getExtensionPermissionsApi()).toBeNull();
    expect(getExtensionTabsApi()).toBeNull();
    expect(getExtensionScriptingApi()).toBeNull();
  });

  it("returns null when no extension namespace exists", () => {
    expect(getExtensionApiNamespace()).toBeNull();
    expect(hasExtensionRuntime()).toBe(false);
    expect(getExtensionPermissionsApi()).toBeNull();
    expect(getExtensionTabsApi()).toBeNull();
    expect(getExtensionScriptingApi()).toBeNull();
  });

  it("uses the explicit namespace argument for runtime checks", () => {
    expect(hasExtensionRuntime(null)).toBe(false);
    expect(hasExtensionRuntime({})).toBe(false);
    expect(
      hasExtensionRuntime({
        runtime: {
          id: "extension-id",
        },
      }),
    ).toBe(true);
  });
});
