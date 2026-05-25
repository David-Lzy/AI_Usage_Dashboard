import { describe, expect, it } from "vitest";

import {
  SURFACE_SESSION_STATE_TTL_MS,
  buildSurfaceSessionKey,
  captureSurfaceSessionState,
  clearSurfaceSessionState,
  normalizeSurfaceSessionState,
  restoreSurfaceSessionState,
  type SurfaceSessionState,
} from "./surface-session-state";

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(values.keys())[index] ?? null;
    },
    removeItem(key: string) {
      values.delete(key);
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}

function createExtensionSessionStorage() {
  const values = new Map<string, unknown>();

  return {
    values,
    area: {
      async get(key: string) {
        return { [key]: values.get(key) };
      },
      async set(items: Record<string, unknown>) {
        Object.entries(items).forEach(([key, value]) => {
          values.set(key, value);
        });
      },
      async remove(key: string) {
        values.delete(key);
      },
    },
  };
}

function createState(overrides: Partial<SurfaceSessionState> = {}): SurfaceSessionState {
  return {
    routeName: "settings",
    routeKey: "settings",
    scrollProgress: 0.4,
    scrollY: 640,
    settings: {
      activeSectionId: "appearance",
      advancedOpen: true,
      uiMoreOpen: true,
      toolbarPopupPreview: {
        open: true,
        percent: 51,
        position: {
          left: 320,
          top: 96,
        },
      },
      activePopover: null,
      providerProgressDetailsOpen: {
        "codex-personal-page": true,
      },
      carouselIndexById: {
        "quick-setup": 2,
      },
    },
    providerDetail: null,
    ...overrides,
  };
}

describe("surface session state", () => {
  it("builds a shared key from route and surface family without sidebar/tab split", () => {
    expect(buildSurfaceSessionKey("#settings/section/appearance")).toBe(
      "ai-usage-dashboard:surface-session-state:standard:settings/section/appearance",
    );
    expect(buildSurfaceSessionKey("#settings", "sidepanel tab")).toBe(
      "ai-usage-dashboard:surface-session-state:sidepanel-tab:settings",
    );
  });

  it("stores and restores through extension storage session when available", async () => {
    const extensionStorage = createExtensionSessionStorage();
    const key = buildSurfaceSessionKey("settings");
    const state = createState();

    await captureSurfaceSessionState(key, state, {
      extensionStorage: extensionStorage.area,
      now: () => 1_000,
    });

    await expect(
      restoreSurfaceSessionState(key, {
        extensionStorage: extensionStorage.area,
        now: () => 2_000,
      }),
    ).resolves.toEqual(state);
  });

  it("falls back to sessionStorage before localStorage", async () => {
    const sessionStorage = createMemoryStorage();
    const localStorage = createMemoryStorage();
    const key = buildSurfaceSessionKey("dashboard");

    await captureSurfaceSessionState(key, createState({ routeName: "dashboard" }), {
      extensionStorage: null,
      sessionStorage,
      localStorage,
      now: () => 1_000,
    });

    expect(sessionStorage.getItem(key)).not.toBeNull();
    expect(localStorage.getItem(key)).toBeNull();
    await expect(
      restoreSurfaceSessionState(key, {
        extensionStorage: null,
        sessionStorage,
        localStorage,
        now: () => 1_500,
      }),
    ).resolves.toMatchObject({
      routeName: "dashboard",
      routeKey: "settings",
    });
  });

  it("falls back to localStorage with expiry when sessionStorage is unavailable", async () => {
    const localStorage = createMemoryStorage();
    const key = buildSurfaceSessionKey("provider-detail/codex-personal-page");
    const state = createState({
      routeName: "provider-detail",
      routeKey: "provider-detail/codex-personal-page",
      settings: null,
      providerDetail: {
        providerId: "codex-personal-page",
        quotaDetailsOpen: {
          weekly: true,
        },
      },
    });

    await captureSurfaceSessionState(key, state, {
      extensionStorage: null,
      sessionStorage: null,
      localStorage,
      now: () => 10_000,
    });

    await expect(
      restoreSurfaceSessionState(key, {
        extensionStorage: null,
        sessionStorage: null,
        localStorage,
        now: () => 10_500,
      }),
    ).resolves.toEqual(state);
  });

  it("removes expired and malformed payloads", async () => {
    const localStorage = createMemoryStorage();
    const expiredKey = buildSurfaceSessionKey("settings");
    const malformedKey = buildSurfaceSessionKey("dashboard");

    await captureSurfaceSessionState(expiredKey, createState(), {
      extensionStorage: null,
      sessionStorage: null,
      localStorage,
      now: () => 1_000,
    });
    localStorage.setItem(malformedKey, "{not-json");

    await expect(
      restoreSurfaceSessionState(expiredKey, {
        extensionStorage: null,
        sessionStorage: null,
        localStorage,
        now: () => 1_000 + SURFACE_SESSION_STATE_TTL_MS + 1,
      }),
    ).resolves.toBeNull();
    await expect(
      restoreSurfaceSessionState(malformedKey, {
        extensionStorage: null,
        sessionStorage: null,
        localStorage,
        now: () => 1_000,
      }),
    ).resolves.toBeNull();
    expect(localStorage.getItem(expiredKey)).toBeNull();
    expect(localStorage.getItem(malformedKey)).toBeNull();
  });

  it("normalizes state without accepting sensitive draft fields", () => {
    const normalized = normalizeSurfaceSessionState({
      routeName: "settings",
      routeKey: "settings",
      scrollProgress: 1.25,
      scrollY: 42.4,
      apiKeyDraft: "secret",
      importJson: "{}",
      cookie: "secret",
      authHeader: "secret",
      settings: {
        activeSectionId: "appearance",
        advancedOpen: true,
        uiMoreOpen: true,
        apiKeyDraft: "secret",
        toolbarPopupPreview: {
          open: true,
          percent: 151,
          position: {
            left: 12.4,
            top: 18.6,
          },
        },
        activePopover: {
          id: "  progress-color-band:high:color  ",
          customPanelOpen: true,
          apiKeyDraft: "secret",
        },
        providerProgressDetailsOpen: {
          codex: true,
          cursor: "yes",
        },
        carouselIndexById: {
          setup: 2.2,
          hidden: "3",
        },
      },
    });

    expect(normalized).toEqual({
      routeName: "settings",
      routeKey: "settings",
      scrollProgress: 1,
      scrollY: 42,
      settings: {
        activeSectionId: "appearance",
        advancedOpen: true,
        uiMoreOpen: true,
        toolbarPopupPreview: {
          open: true,
          percent: 100,
          position: {
            left: 12,
            top: 19,
          },
        },
        activePopover: {
          id: "progress-color-band:high:color",
          customPanelOpen: true,
        },
        providerProgressDetailsOpen: {
          codex: true,
        },
        carouselIndexById: {
          setup: 2,
        },
      },
      providerDetail: null,
    });
    expect(JSON.stringify(normalized)).not.toContain("secret");
  });

  it("clears the selected backend", async () => {
    const sessionStorage = createMemoryStorage();
    const key = buildSurfaceSessionKey("settings");

    await captureSurfaceSessionState(key, createState(), {
      extensionStorage: null,
      sessionStorage,
      localStorage: null,
    });
    await clearSurfaceSessionState(key, {
      extensionStorage: null,
      sessionStorage,
      localStorage: null,
    });

    expect(sessionStorage.getItem(key)).toBeNull();
  });
});
