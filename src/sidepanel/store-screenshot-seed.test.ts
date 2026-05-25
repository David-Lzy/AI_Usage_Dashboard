import { afterEach, describe, expect, it, vi } from "vitest";

import type { WebStorageLike } from "../shared/local-storage";
import { SAMPLE_APP_STATE } from "../shared/constants";
import {
  STORE_SCREENSHOT_SEED_BACKUP_STORAGE_KEY,
  clearStoreScreenshotSeedBackup,
  isStoreScreenshotSeedLockEnabled,
  readStoreScreenshotSeedBackup,
  setStoreScreenshotSeedLockEnabled,
  writeStoreScreenshotSeedBackup,
} from "./store-screenshot-seed";

function createMemoryStorage(): WebStorageLike {
  const values = new Map<string, string>();

  return {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

function createThrowingStorage(): WebStorageLike {
  return {
    getItem: () => {
      throw new Error("getItem failed");
    },
    removeItem: () => {
      throw new Error("removeItem failed");
    },
    setItem: () => {
      throw new Error("setItem failed");
    },
  };
}

describe("store screenshot seed storage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads, writes, and clears successful localStorage values", () => {
    vi.stubGlobal("window", {
      localStorage: createMemoryStorage(),
    });

    setStoreScreenshotSeedLockEnabled(true);
    expect(isStoreScreenshotSeedLockEnabled()).toBe(true);

    setStoreScreenshotSeedLockEnabled(false);
    expect(isStoreScreenshotSeedLockEnabled()).toBe(false);

    writeStoreScreenshotSeedBackup(SAMPLE_APP_STATE);
    expect(readStoreScreenshotSeedBackup()).toMatchObject({
      hasBackup: true,
      appState: {
        settings: {
          locale: SAMPLE_APP_STATE.settings.locale,
        },
      },
    });

    clearStoreScreenshotSeedBackup();
    expect(readStoreScreenshotSeedBackup()).toEqual({
      hasBackup: false,
      appState: null,
    });
  });

  it("treats throwing localStorage operations as no-ops", () => {
    vi.stubGlobal("window", {
      localStorage: createThrowingStorage(),
    });

    expect(isStoreScreenshotSeedLockEnabled()).toBe(false);
    expect(() => setStoreScreenshotSeedLockEnabled(true)).not.toThrow();
    expect(() => setStoreScreenshotSeedLockEnabled(false)).not.toThrow();
    expect(() => writeStoreScreenshotSeedBackup(SAMPLE_APP_STATE)).not.toThrow();
    expect(readStoreScreenshotSeedBackup()).toEqual({
      hasBackup: false,
      appState: null,
    });
    expect(() => clearStoreScreenshotSeedBackup()).not.toThrow();
  });

  it("drops malformed backup payloads when cleanup throws", () => {
    const removeItem = vi.fn(() => {
      throw new Error("removeItem failed");
    });

    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) =>
          key === STORE_SCREENSHOT_SEED_BACKUP_STORAGE_KEY ? "{not-json" : null,
        removeItem,
        setItem: () => {},
      } satisfies WebStorageLike,
    });

    expect(readStoreScreenshotSeedBackup()).toEqual({
      hasBackup: false,
      appState: null,
    });
    expect(removeItem).toHaveBeenCalledWith(
      STORE_SCREENSHOT_SEED_BACKUP_STORAGE_KEY,
    );
  });
});
