import { describe, expect, it } from "vitest";

import type { WebStorageLike } from "./local-storage";
import {
  readCursorUsageCollapsePreference,
  writeCursorUsageCollapsePreference,
} from "./cursor-usage-ui-preferences";

function createStorage(initial: Record<string, string> = {}): WebStorageLike {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

describe("cursor usage UI preferences", () => {
  it("keeps module and surface collapse choices independent", () => {
    const storage = createStorage();

    writeCursorUsageCollapsePreference(
      "cursor-personal-page",
      "popup",
      "billing_summary",
      true,
      { storage },
    );

    expect(
      readCursorUsageCollapsePreference(
        "cursor-personal-page",
        "popup",
        "billing_summary",
        { storage },
      ),
    ).toBe(true);
    expect(
      readCursorUsageCollapsePreference(
        "cursor-personal-page",
        "sidebar",
        "billing_summary",
        { storage },
      ),
    ).toBe(false);
    expect(
      readCursorUsageCollapsePreference(
        "cursor-personal-page",
        "popup",
        "usage_history",
        { storage },
      ),
    ).toBe(false);
  });

  it("fails closed when storage is unavailable", () => {
    expect(
      readCursorUsageCollapsePreference(
        "cursor-personal-page",
        "popup",
        "usage_history",
        { storage: null },
      ),
    ).toBe(false);
    expect(() =>
      writeCursorUsageCollapsePreference(
        "cursor-personal-page",
        "popup",
        "usage_history",
        true,
        { storage: null },
      ),
    ).not.toThrow();
  });
});
