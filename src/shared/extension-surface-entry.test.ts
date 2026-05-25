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

  it("ignores storage write failures", () => {
    expect(() =>
      storePendingFullPageEntry(
        "popup-expand",
        "#dashboard",
        {
          getItem: () => null,
          setItem: () => {
            throw new Error("localStorage unavailable");
          },
          removeItem: () => undefined,
        },
        100,
      ),
    ).not.toThrow();
  });

  it("ignores storage read failures", () => {
    expect(
      consumePendingFullPageEntry(
        "#dashboard",
        {
          getItem: () => {
            throw new Error("localStorage unavailable");
          },
          setItem: () => undefined,
          removeItem: () => undefined,
        },
        200,
      ),
    ).toBeNull();
  });

  it("keeps matching entry consumption resilient when cleanup fails", () => {
    expect(
      consumePendingFullPageEntry(
        "#dashboard",
        {
          getItem: () =>
            JSON.stringify({
              source: "sidebar-expand",
              targetHash: "#dashboard",
              createdAt: 100,
            }),
          setItem: () => undefined,
          removeItem: () => {
            throw new Error("localStorage unavailable");
          },
        },
        200,
      ),
    ).toBe("sidebar-expand");
  });
});
