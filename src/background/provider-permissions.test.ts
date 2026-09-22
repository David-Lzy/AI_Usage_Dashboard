import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AppState } from "../providers/types";
import { SAMPLE_APP_STATE } from "../shared/constants";
import {
  readAppState,
  seedAppStateIfEmpty,
  updateAppState,
  writeAppState,
} from "../shared/storage";
import {
  reconcileProviderPermissions,
  syncStoredProviderPermissions,
  toggleProviderPermission,
} from "./provider-permissions";

vi.mock("../shared/storage", () => ({
  readAppState: vi.fn(),
  seedAppStateIfEmpty: vi.fn(),
  updateAppState: vi.fn(),
  writeAppState: vi.fn(),
}));

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

function setExtensionPermissionsApi(
  namespace: "browser" | "chrome",
  api: ChromePermissionsApi["permissions"],
) {
  Object.defineProperty(globalThis, namespace, {
    value: {
      runtime: {
        id: "extension-id",
      },
      permissions: api,
    } as unknown as typeof chrome,
    configurable: true,
    writable: true,
  });
}

function setChromePermissionsApi(api: ChromePermissionsApi["permissions"]) {
  setExtensionPermissionsApi("chrome", api);
}

function clearExtensionPermissionApis() {
  Object.defineProperty(globalThis, "chrome", {
    value: undefined,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "browser", {
    value: undefined,
    configurable: true,
    writable: true,
  });
}

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

function createDeferred<T>(): Deferred<T> {
  let resolve = (_value: T) => {};
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

describe("provider permissions", () => {
  let stored: AppState;

  beforeEach(async () => {
    vi.restoreAllMocks();
    clearExtensionPermissionApis();
    stored = createState();
    vi.mocked(readAppState).mockImplementation(async () => structuredClone(stored));
    vi.mocked(writeAppState).mockImplementation(async (state) => {
      stored = structuredClone(state);
      return structuredClone(stored);
    });
    vi.mocked(updateAppState).mockImplementation(async (updater) => {
      stored = updater(structuredClone(stored));
      return structuredClone(stored);
    });
    vi.mocked(seedAppStateIfEmpty).mockImplementation(async () =>
      structuredClone(stored),
    );
  });

  afterEach(() => {
    clearExtensionPermissionApis();
  });

  it("reconciles provider access from chrome.permissions.contains", async () => {
    const contains = vi.fn(async ({ origins }: { origins?: string[] }) =>
      Boolean(origins?.includes("https://cursor.com/*")),
    );

    setChromePermissionsApi({
      contains,
      request: vi.fn(async () => true),
      remove: vi.fn(async () => true),
    });

    const state = await reconcileProviderPermissions(createState());

    expect(
      state.providerSettings.find((provider) => provider.id === "cursor-personal-page")?.status,
    ).toBe("granted");
    expect(
      state.providerSettings.find((provider) => provider.id === "jetbrains-org-page")
        ?.status,
    ).toBe("missing");
    expect(
      state.providerSettings.find((provider) => provider.id === "gemini-policy")?.status,
    ).toBe("granted");
    expect(contains).toHaveBeenCalled();
  });

  it("simulates local toggles when chrome.permissions is unavailable", async () => {
    const result = await toggleProviderPermission("jetbrains-org-page");

    expect(result.notice.title).toContain("simulated");
    expect(
      result.state.providerSettings.find((provider) => provider.id === "jetbrains-org-page")
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

    const result = await toggleProviderPermission("jetbrains-org-page");
    const persistedState = await readAppState();

    expect(request).toHaveBeenCalledWith({
      origins: ["https://account.jetbrains.com/*", "https://*.jetbrains.com/*"],
    });
    expect(result.notice.title).toContain("granted");
    expect(
      persistedState?.providerSettings.find(
        (provider) => provider.id === "jetbrains-org-page",
      )?.status,
    ).toBe("granted");
  });

  it("requests host access through browser.permissions in Firefox extension mode", async () => {
    const request = vi.fn(async () => true);

    setExtensionPermissionsApi("browser", {
      contains: vi.fn(async () => false),
      request,
      remove: vi.fn(async () => true),
    });

    const result = await toggleProviderPermission("jetbrains-org-page");

    expect(request).toHaveBeenCalledWith({
      origins: ["https://account.jetbrains.com/*", "https://*.jetbrains.com/*"],
    });
    expect(result.notice.title).toContain("granted");
  });

  it("preserves newer settings and ignores a permission result for reconfigured hosts", async () => {
    const permissionCheck = createDeferred<boolean>();
    const permissionCheckStarted = createDeferred<void>();
    setChromePermissionsApi({
      contains: vi.fn(async ({ origins }: { origins?: string[] }) => {
        if (origins?.includes("https://cursor.com/*")) {
          permissionCheckStarted.resolve();
          return permissionCheck.promise;
        }

        return true;
      }),
      request: vi.fn(async () => true),
      remove: vi.fn(async () => true),
    });

    const sync = syncStoredProviderPermissions();
    await permissionCheckStarted.promise;

    const latest = await readAppState();
    if (!latest) {
      throw new Error("Expected a persisted test state");
    }
    await writeAppState({
      ...latest,
      providerSettings: latest.providerSettings.map((provider) =>
        provider.id === "cursor-personal-page"
          ? {
              ...provider,
              hostOrigins: ["https://reconfigured.cursor.invalid/*"],
              status: "missing",
            }
          : provider,
      ),
      settings: {
        ...latest.settings,
        warningThresholdPercent: 77,
      },
    });

    permissionCheck.resolve(true);
    const state = await sync;

    expect(state.settings.warningThresholdPercent).toBe(77);
    expect(
      state.providerSettings.find((provider) => provider.id === "cursor-personal-page"),
    ).toMatchObject({
      hostOrigins: ["https://reconfigured.cursor.invalid/*"],
      status: "missing",
    });
  });

  it("allows a later permission toggle after a browser request rejects", async () => {
    const request = vi
      .fn<ChromePermissionsApi["permissions"]["request"]>()
      .mockRejectedValueOnce(new Error("request failed"))
      .mockResolvedValueOnce(true);
    setChromePermissionsApi({
      contains: vi.fn(async () => false),
      request,
      remove: vi.fn(async () => true),
    });

    await expect(toggleProviderPermission("jetbrains-org-page")).rejects.toThrow(
      "request failed",
    );
    const result = await toggleProviderPermission("jetbrains-org-page");

    expect(result.notice.title).toContain("granted");
    expect(
      result.state.providerSettings.find(
        (provider) => provider.id === "jetbrains-org-page",
      )?.status,
    ).toBe("granted");
  });
});
