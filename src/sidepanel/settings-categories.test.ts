import { describe, expect, it } from "vitest";
import {
  SETTINGS_CATEGORIES,
  SETTINGS_CATEGORY_SECTIONS,
  getSettingsCategoryForFocus,
  getSettingsCategoryForSection,
} from "./settings-categories";
import { getSettingsCategoryCopy } from "../shared/settings-category-localized-copy";
import { SUPPORTED_APP_LOCALES } from "../shared/i18n";

describe("settings categories", () => {
  it("keeps five categories and reversible canonical section destinations", () => {
    expect(SETTINGS_CATEGORIES).toEqual([
      "connections",
      "usage",
      "appearance",
      "general",
      "data",
    ]);
    for (const category of SETTINGS_CATEGORIES)
      expect(
        getSettingsCategoryForSection(SETTINGS_CATEGORY_SECTIONS[category]),
      ).toBe(category);
  });
  it("maps old appearance, overview and advanced links without deleting them", () => {
    expect(getSettingsCategoryForSection("settings-provider-display")).toBe(
      "appearance",
    );
    expect(getSettingsCategoryForSection("settings-overview")).toBe("general");
    expect(getSettingsCategoryForSection("settings-advanced")).toBe(
      "connections",
    );
    expect(
      getSettingsCategoryForFocus({
        kind: "credential-provider",
        providerId: "sub2api-api-key",
      }),
    ).toBe("connections");
    expect(
      getSettingsCategoryForFocus({
        kind: "source-provider",
        providerId: "codex-personal-page",
      }),
    ).toBe("connections");
  });
  it("has nonempty category and configuration labels for every runtime locale", () => {
    for (const locale of SUPPORTED_APP_LOCALES) {
      const copy = getSettingsCategoryCopy(locale);
      for (const key of [...SETTINGS_CATEGORIES, "configure"] as const)
        expect(copy[key].trim().length).toBeGreaterThan(0);
    }
  });
});
