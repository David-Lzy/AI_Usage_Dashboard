import { describe, expect, it } from "vitest";

import type { WebStorageLike } from "./local-storage";
import {
  createDefaultCursorUsageUiPreferences,
  moveCursorUsageModulePreference,
  readCursorUsageCollapsePreference,
  readCursorUsageUiPreferences,
  setCursorUsageModuleVisibility,
  writeCursorUsageUiPreferences,
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

  it("persists visibility and order independently for every surface", () => {
    const storage = createStorage();
    const defaults = createDefaultCursorUsageUiPreferences();
    const hiddenPopupHistory = setCursorUsageModuleVisibility(
      defaults,
      "popup",
      "usage_history",
      false,
    );
    const reorderedSidebar = moveCursorUsageModulePreference(
      hiddenPopupHistory,
      "sidebar",
      "usage_history",
      "up",
    );

    writeCursorUsageUiPreferences(reorderedSidebar, { storage });

    expect(readCursorUsageUiPreferences({ storage })).toEqual({
      popup: [
        { id: "billing_summary", visible: true },
        { id: "usage_history", visible: false },
      ],
      sidebar: [
        { id: "usage_history", visible: true },
        { id: "billing_summary", visible: true },
      ],
      fullPage: [
        { id: "billing_summary", visible: true },
        { id: "usage_history", visible: true },
      ],
    });
  });

  it("normalizes malformed and partial module preferences", () => {
    const storage = createStorage({
      "ai-usage-dashboard:cursor-usage:module-preferences": JSON.stringify({
        popup: [
          { id: "usage_history", visible: false },
          { id: "usage_history", visible: true },
          { id: "unknown", visible: true },
        ],
      }),
    });

    expect(readCursorUsageUiPreferences({ storage }).popup).toEqual([
      { id: "usage_history", visible: false },
      { id: "billing_summary", visible: true },
    ]);
    expect(readCursorUsageUiPreferences({
      storage: createStorage({
        "ai-usage-dashboard:cursor-usage:module-preferences": "{",
      }),
    })).toEqual(createDefaultCursorUsageUiPreferences());
  });
});
