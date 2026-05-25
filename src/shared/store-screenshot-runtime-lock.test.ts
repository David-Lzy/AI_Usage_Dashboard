import { afterEach, describe, expect, it, vi } from "vitest";

import type { WebStorageLike } from "./local-storage";
import {
  readStoreScreenshotRuntimeLock,
  writeStoreScreenshotRuntimeLock,
} from "./store-screenshot-runtime-lock";

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

describe("store screenshot runtime lock", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("treats throwing localStorage reads as unlocked", async () => {
    vi.stubGlobal("window", {
      localStorage: createThrowingStorage(),
    });

    await expect(readStoreScreenshotRuntimeLock()).resolves.toBe(false);
  });

  it("makes throwing localStorage writes and clears no-ops", async () => {
    vi.stubGlobal("window", {
      localStorage: createThrowingStorage(),
    });

    await expect(writeStoreScreenshotRuntimeLock(true)).resolves.toBeUndefined();
    await expect(writeStoreScreenshotRuntimeLock(false)).resolves.toBeUndefined();
  });
});
