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

    expect(readAppStateFromChromeStorageChanges(changes, "local")).toBe(
      SAMPLE_APP_STATE,
    );
    expect(readAppStateFromChromeStorageChanges(changes, "sync")).toBeNull();
    expect(
      readAppStateFromChromeStorageChanges({ unrelated: {} }, "local"),
    ).toBeNull();
  });

  it("parses the HTTP preview fallback without accepting malformed state", () => {
    expect(
      readAppStateFromWindowStorageEvent({
        key: "ai-usage-dashboard.app-state",
        newValue: JSON.stringify(SAMPLE_APP_STATE),
      }),
    ).toEqual(SAMPLE_APP_STATE);
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
