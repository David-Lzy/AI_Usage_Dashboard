import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getSafeLocalStorage,
  getSafeSessionStorage,
  getSafeStorageItem,
  removeSafeStorageItem,
  setSafeStorageItem,
  type WebStorageLike,
} from "./local-storage";

describe("safe web storage helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null when a window storage getter throws", () => {
    const sessionStorage: WebStorageLike = {
      getItem: () => null,
      removeItem: () => {},
      setItem: () => {},
    };
    const windowLike = {};

    Object.defineProperty(windowLike, "localStorage", {
      get() {
        throw new Error("localStorage unavailable");
      },
    });
    Object.defineProperty(windowLike, "sessionStorage", {
      get() {
        return sessionStorage;
      },
    });

    vi.stubGlobal("window", windowLike);

    expect(getSafeLocalStorage()).toBeNull();
    expect(getSafeSessionStorage()).toBe(sessionStorage);
  });

  it("wraps get, set, and remove operations without throwing", () => {
    const values = new Map<string, string>();
    const storage: WebStorageLike = {
      getItem: (key) => values.get(key) ?? null,
      removeItem: (key) => {
        values.delete(key);
      },
      setItem: (key, value) => {
        values.set(key, value);
      },
    };
    const throwingStorage: WebStorageLike = {
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

    expect(setSafeStorageItem(storage, "phase", "563")).toBe(true);
    expect(getSafeStorageItem(storage, "phase")).toBe("563");
    expect(removeSafeStorageItem(storage, "phase")).toBe(true);
    expect(getSafeStorageItem(storage, "phase")).toBeNull();

    expect(getSafeStorageItem(throwingStorage, "phase")).toBeNull();
    expect(setSafeStorageItem(throwingStorage, "phase", "563")).toBe(false);
    expect(removeSafeStorageItem(throwingStorage, "phase")).toBe(false);
  });
});
