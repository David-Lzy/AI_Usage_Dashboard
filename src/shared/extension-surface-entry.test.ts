import { describe, expect, it } from "vitest";

import {
  consumePendingFullPageEntry,
  storePendingFullPageEntry,
} from "./extension-surface-entry";

function createStorage() {
  const values = new Map<string, string>();

  return {
    storage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
      removeItem: (key: string) => {
        values.delete(key);
      },
    },
    values,
  };
}

describe("extension surface entry helpers", () => {
  it("stores and consumes a matching pending full-page entry once", () => {
    const { storage } = createStorage();

    storePendingFullPageEntry("popup-expand", "dashboard", storage, 100);

    expect(consumePendingFullPageEntry("#dashboard", storage, 200)).toBe(
      "popup-expand",
    );
    expect(consumePendingFullPageEntry("#dashboard", storage, 201)).toBeNull();
  });

  it("keeps a pending entry when the target hash does not match yet", () => {
    const { storage, values } = createStorage();

    storePendingFullPageEntry("sidebar-expand", "#settings", storage, 100);

    expect(consumePendingFullPageEntry("#dashboard", storage, 200)).toBeNull();
    expect(values.size).toBe(1);
    expect(consumePendingFullPageEntry("#settings", storage, 201)).toBe(
      "sidebar-expand",
    );
  });

  it("drops stale pending entries", () => {
    const { storage, values } = createStorage();

    storePendingFullPageEntry("popup-expand", "#dashboard", storage, 100);

    expect(consumePendingFullPageEntry("#dashboard", storage, 20_101)).toBeNull();
    expect(values.size).toBe(0);
  });
});
