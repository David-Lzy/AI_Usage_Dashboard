import { describe, expect, it } from "vitest";

import type { WebStorageLike } from "../shared/local-storage";
import {
  readPopupCollapsePreference,
  writePopupCollapsePreference,
} from "./popup-collapse-preferences";

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

describe("popup collapse preferences", () => {
  it("stores header and footer collapsed states independently", () => {
    const storage = createMemoryStorage();

    expect(readPopupCollapsePreference("headerActions", { storage })).toBe(false);
    expect(readPopupCollapsePreference("footerInfo", { storage })).toBe(false);

    writePopupCollapsePreference("headerActions", true, { storage });
    writePopupCollapsePreference("footerInfo", false, { storage });

    expect(readPopupCollapsePreference("headerActions", { storage })).toBe(true);
    expect(readPopupCollapsePreference("footerInfo", { storage })).toBe(false);

    writePopupCollapsePreference("headerActions", false, { storage });
    writePopupCollapsePreference("footerInfo", true, { storage });

    expect(readPopupCollapsePreference("headerActions", { storage })).toBe(false);
    expect(readPopupCollapsePreference("footerInfo", { storage })).toBe(true);
  });

  it("treats malformed values and storage failures as expanded", () => {
    const malformedStorage: WebStorageLike = {
      getItem: () => "true",
      removeItem: () => {},
      setItem: () => {},
    };
    const throwingStorage = createThrowingStorage();

    expect(
      readPopupCollapsePreference("headerActions", { storage: malformedStorage }),
    ).toBe(false);
    expect(
      readPopupCollapsePreference("footerInfo", { storage: throwingStorage }),
    ).toBe(false);
    expect(() =>
      writePopupCollapsePreference("footerInfo", true, {
        storage: throwingStorage,
      }),
    ).not.toThrow();
  });
});
