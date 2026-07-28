import { afterEach, describe, expect, it, vi } from "vitest";

import { SAMPLE_APP_STATE } from "./constants";
import {
  readAppStateFromChromeStorageChanges,
  readAppStateFromWindowStorageEvent,
  subscribeToAppStateStorageChanges,
} from "./app-state-storage-events";

describe("app state storage events", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads the shared state only from the local Chrome storage area", () => {
    const changes = {
      "ai-usage-dashboard.app-state": {
        newValue: SAMPLE_APP_STATE,
      },
    };

    const state = readAppStateFromChromeStorageChanges(changes, "local");
    const sampleCodex = SAMPLE_APP_STATE.providers.find(
      (provider) => provider.providerId === "codex-personal-page",
    );

    expect(state).toEqual(
      expect.objectContaining({
        providers: expect.arrayContaining([
          expect.objectContaining({
            providerId: "codex-personal-page",
            remaining: sampleCodex?.remaining,
            usageWindows: sampleCodex?.usageWindows,
          }),
        ]),
        settings: expect.any(Object),
      }),
    );
    expect(readAppStateFromChromeStorageChanges(changes, "sync")).toBeNull();
    expect(
      readAppStateFromChromeStorageChanges({ unrelated: {} }, "local"),
    ).toBeNull();
  });

  it("normalizes legacy surface preferences before publishing a storage event", () => {
    const legacyState = structuredClone(SAMPLE_APP_STATE);

    delete (legacyState.settings as Partial<typeof legacyState.settings>)
      .providerOrderBySurface;
    delete (legacyState.settings as Partial<typeof legacyState.settings>)
      .progressItemsBySurface;
    delete (legacyState.settings as Partial<typeof legacyState.settings>)
      .usageHistoryModulesBySurface;
    delete (legacyState.settings as Partial<typeof legacyState.settings>)
      .providerServiceStatusVisibilityBySurface;

    const normalized = readAppStateFromChromeStorageChanges(
      {
        "ai-usage-dashboard.app-state": {
          newValue: legacyState,
        },
      },
      "local",
    );

    expect(normalized?.settings.providerOrderBySurface).toEqual({
      popup: [],
      sidebar: [],
      fullPage: [],
    });
    expect(normalized?.settings.progressItemsBySurface).toEqual({
      popup: {},
      sidebar: {},
      fullPage: {},
    });
    expect(normalized?.settings.usageHistoryModulesBySurface).toEqual(
      expect.objectContaining({
        popup: expect.any(Object),
        sidebar: expect.any(Object),
        fullPage: expect.any(Object),
      }),
    );
    expect(
      normalized?.settings.providerServiceStatusVisibilityBySurface,
    ).toEqual(
      expect.objectContaining({
        popup: expect.any(Object),
        sidebar: expect.any(Object),
        fullPage: expect.any(Object),
      }),
    );
  });

  it("parses the HTTP preview fallback without accepting malformed state", () => {
    const state = readAppStateFromWindowStorageEvent({
      key: "ai-usage-dashboard.app-state",
      newValue: JSON.stringify(SAMPLE_APP_STATE),
    });
    const sampleCodex = SAMPLE_APP_STATE.providers.find(
      (provider) => provider.providerId === "codex-personal-page",
    );

    expect(state).toEqual(
      expect.objectContaining({
        providers: expect.arrayContaining([
          expect.objectContaining({
            providerId: "codex-personal-page",
            remaining: sampleCodex?.remaining,
            usageWindows: sampleCodex?.usageWindows,
          }),
        ]),
        settings: expect.any(Object),
      }),
    );
    expect(
      readAppStateFromWindowStorageEvent({
        key: "ai-usage-dashboard.app-state",
        newValue: "{not-json",
      }),
    ).toBeNull();
    expect(
      readAppStateFromWindowStorageEvent({
        key: "unrelated",
        newValue: JSON.stringify(SAMPLE_APP_STATE),
      }),
    ).toBeNull();
  });

  it("subscribes to both event sources and removes both listeners", () => {
    const addWindowListener = vi.fn();
    const removeWindowListener = vi.fn();
    const addChromeListener = vi.fn();
    const removeChromeListener = vi.fn();
    const onChange = vi.fn();

    vi.stubGlobal("window", {
      addEventListener: addWindowListener,
      removeEventListener: removeWindowListener,
    });
    vi.stubGlobal("chrome", {
      storage: {
        onChanged: {
          addListener: addChromeListener,
          removeListener: removeChromeListener,
        },
      },
    });

    const unsubscribe = subscribeToAppStateStorageChanges(onChange);
    const windowListener = addWindowListener.mock.calls[0]?.[1] as (
      event: Pick<StorageEvent, "key" | "newValue">,
    ) => void;
    const chromeListener = addChromeListener.mock.calls[0]?.[0] as (
      changes: Record<string, { newValue?: unknown }>,
      areaName: string,
    ) => void;

    windowListener({
      key: "ai-usage-dashboard.app-state",
      newValue: JSON.stringify(SAMPLE_APP_STATE),
    });
    chromeListener(
      {
        "ai-usage-dashboard.app-state": {
          newValue: SAMPLE_APP_STATE,
        },
      },
      "local",
    );

    expect(onChange).toHaveBeenCalledTimes(2);

    unsubscribe();

    expect(removeWindowListener).toHaveBeenCalledWith(
      "storage",
      windowListener,
    );
    expect(removeChromeListener).toHaveBeenCalledWith(chromeListener);
  });
});
