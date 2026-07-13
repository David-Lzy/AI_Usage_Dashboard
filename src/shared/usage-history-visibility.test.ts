import { describe, expect, it } from "vitest";
import {
  createDefaultUsageHistoryModulesBySurface,
  isProviderUsageHistoryModuleVisible,
  moveProviderUsageHistoryModulePreference,
  normalizeUsageHistoryModulesBySurface,
  resolveProviderUsageHistoryModules,
  setProviderUsageHistoryModuleVisibility,
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
    expect(
      resolveProviderUsageHistoryModules(
        settings,
        "popup",
        "codex-personal-page",
      ),
    ).toEqual([
      { id: "turns_history", visible: false },
      { id: "personal_usage_by_surface", visible: true },
    ]);
  });

  it("updates one provider module on one surface without changing the others", () => {
    const current = createDefaultUsageHistoryModulesBySurface();
    const updated = setProviderUsageHistoryModuleVisibility(
      current,
      "popup",
      "codex-personal-page",
      "turns_history",
      false,
    );

    expect(isProviderUsageHistoryModuleVisible(updated, "popup", "codex-personal-page", "turns_history")).toBe(false);
    expect(isProviderUsageHistoryModuleVisible(updated, "sidebar", "codex-personal-page", "turns_history")).toBe(true);
    expect(isProviderUsageHistoryModuleVisible(updated, "popup", "codex-personal-page", "personal_usage_by_surface")).toBe(true);
  });

  it("moves one surface module while preserving visibility and other surfaces", () => {
    const current = setProviderUsageHistoryModuleVisibility(
      createDefaultUsageHistoryModulesBySurface(),
      "popup",
      "codex-personal-page",
      "turns_history",
      false,
    );
    const updated = moveProviderUsageHistoryModulePreference(
      current,
      "popup",
      "codex-personal-page",
      "turns_history",
      "up",
    );

    expect(
      resolveProviderUsageHistoryModules(
        updated,
        "popup",
        "codex-personal-page",
      ),
    ).toEqual([
      { id: "turns_history", visible: false },
      { id: "personal_usage_by_surface", visible: true },
    ]);
    expect(
      resolveProviderUsageHistoryModules(
        updated,
        "sidebar",
        "codex-personal-page",
      ),
    ).toEqual([
      { id: "personal_usage_by_surface", visible: true },
      { id: "turns_history", visible: true },
    ]);
  });
});
