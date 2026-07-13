import { describe, expect, it } from "vitest";
import {
  createDefaultUsageHistoryModulesBySurface,
  isProviderUsageHistoryModuleVisible,
  normalizeUsageHistoryModulesBySurface,
  resolveProviderUsageHistoryModules,
} from "./usage-history-visibility";

describe("usage history visibility", () => {
  it("defaults both modules to visible on every surface", () => {
    const settings = createDefaultUsageHistoryModulesBySurface();

    expect(
      resolveProviderUsageHistoryModules(
        settings,
        "popup",
        "codex-personal-page",
      ),
    ).toEqual([
      { id: "personal_usage_by_surface", visible: true },
      { id: "turns_history", visible: true },
    ]);
  });

  it("normalizes known provider modules and discards unknown entries", () => {
    const settings = normalizeUsageHistoryModulesBySurface(
      {
        popup: {
          "codex-personal-page": [
            { id: "turns_history", visible: false },
            { id: "unknown", visible: false },
          ],
          unknown: [{ id: "turns_history", visible: false }],
        },
      },
      ["codex-personal-page"],
    );

    expect(
      isProviderUsageHistoryModuleVisible(
        settings,
        "popup",
        "codex-personal-page",
        "personal_usage_by_surface",
      ),
    ).toBe(true);
    expect(
      isProviderUsageHistoryModuleVisible(
        settings,
        "popup",
        "codex-personal-page",
        "turns_history",
      ),
    ).toBe(false);
    expect(settings.popup).not.toHaveProperty("unknown");
  });
});
