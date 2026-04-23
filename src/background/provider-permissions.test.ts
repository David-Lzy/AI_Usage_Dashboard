import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AppState } from "../providers/types";
import { SAMPLE_APP_STATE } from "../shared/constants";
import { readAppState, writeAppState } from "../shared/storage";
import {
  reconcileProviderPermissions,
  toggleProviderPermission,
} from "./provider-permissions";

type ChromePermissionsApi = {
  permissions: {
    contains: (args: { origins?: string[] }) => Promise<boolean>;
    request: (args: { origins?: string[] }) => Promise<boolean>;
    remove: (args: { origins?: string[] }) => Promise<boolean>;
  };
};

function createState(overrides?: Partial<AppState>): AppState {
  return {
    ...SAMPLE_APP_STATE,
    ...overrides,
    providers: overrides?.providers ?? SAMPLE_APP_STATE.providers,
    providerSettings:
      overrides?.providerSettings ?? SAMPLE_APP_STATE.providerSettings,
    settings: overrides?.settings ?? SAMPLE_APP_STATE.settings,
  };
}

function setChromePermissionsApi(api: ChromePermissionsApi["permissions"]) {
  Object.defineProperty(globalThis, "chrome", {
    value: {
      permissions: api,
    } as unknown as typeof chrome,
    configurable: true,
    writable: true,
  });
}

function clearChromePermissionsApi() {
  Object.defineProperty(globalThis, "chrome", {
    value: undefined,
    configurable: true,
    writable: true,
  });
}

describe("provider permissions", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    clearChromePermissionsApi();
    await writeAppState(createState());
  });

  afterEach(() => {
    clearChromePermissionsApi();
  });

  it("reconciles provider access from chrome.permissions.contains", async () => {
    const contains = vi.fn(async ({ origins }: { origins?: string[] }) =>
      Boolean(origins?.includes("https://api.cursor.com/*")),
    );

    setChromePermissionsApi({
      contains,
      request: vi.fn(async () => true),
      remove: vi.fn(async () => true),
    });

    const state = await reconcileProviderPermissions(createState());

    expect(
      state.providerSettings.find((provider) => provider.id === "cursor")?.status,
    ).toBe("granted");
    expect(
      state.providerSettings.find((provider) => provider.id === "jetbrains")
        ?.status,
    ).toBe("missing");
    expect(
      state.providerSettings.find((provider) => provider.id === "gemini")?.status,
    ).toBe("granted");
    expect(contains).toHaveBeenCalled();
  });

  it("simulates local toggles when chrome.permissions is unavailable", async () => {
    const result = await toggleProviderPermission("jetbrains");

    expect(result.notice.title).toContain("simulated");
    expect(
      result.state.providerSettings.find((provider) => provider.id === "jetbrains")
        ?.status,
    ).toBe("granted");
  });

  it("requests host access through chrome.permissions in extension mode", async () => {
    const request = vi.fn(async () => true);

    setChromePermissionsApi({
      contains: vi.fn(async () => false),
      request,
      remove: vi.fn(async () => true),
    });

    const result = await toggleProviderPermission("jetbrains");
    const persistedState = await readAppState();

    expect(request).toHaveBeenCalledWith({
      origins: ["https://account.jetbrains.com/*", "https://*.jetbrains.com/*"],
    });
    expect(result.notice.title).toContain("granted");
    expect(
      persistedState?.providerSettings.find(
        (provider) => provider.id === "jetbrains",
      )?.status,
    ).toBe("granted");
  });
});
