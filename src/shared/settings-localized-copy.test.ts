import { describe, expect, it } from "vitest";

import type { ProviderSourceKind, ProviderSourcePreference } from "../providers/types";
import { createRuntimeI18n, SUPPORTED_APP_LOCALES } from "./i18n";
import {
  buildSettingsLocalizedCopy as buildReexportedCopy,
  getSettingsSourceKindLabel as getReexportedSourceKindLabel,
  getSettingsSourcePreferenceLabel as getReexportedSourcePreferenceLabel,
} from "./localized-copy";
import {
  buildSettingsLocalizedCopy,
  getSettingsSourceKindLabel,
  getSettingsSourcePreferenceLabel,
} from "./settings-localized-copy";

describe("buildSettingsLocalizedCopy", () => {
  it("builds English settings credential and source copy", () => {
    const copy = buildSettingsLocalizedCopy(createRuntimeI18n("en"));

    expect(copy.credentials.saveKey).toBe("Save key");
    expect(copy.sources.preferenceLabel).toBe("Preference");
    expect(copy.layout.userLevel.label).toBe("Display level");
    expect(copy.layout.userLevel.options).toEqual({
      basic: "Basic",
      advanced: "Advanced",
      developer: "Developer",
      debug: "Debug",
    });
    expect(getSettingsSourcePreferenceLabel("session_page", copy)).toBe(
      "Session page",
    );
    expect(getSettingsSourceKindLabel("policy_only", copy)).toBe("Policy only");
  });

  it("builds Simplified Chinese settings helper copy", () => {
    const copy = buildSettingsLocalizedCopy(createRuntimeI18n("zh-CN"));

    expect(copy.themeCustomization.enterValidSeed).toContain(
      "输入有效的 #RRGGBB 值",
    );
    expect(copy.credentials.saveConfig).toBe("保存配置");
    expect(copy.sources.itemCount(3)).toBe("3 项");
    expect(copy.permissions.requestAccess).toBe("请求授权");
  });

  it("ships Settings core and credential copy for every non-English locale", () => {
    const englishCopy = buildSettingsLocalizedCopy(createRuntimeI18n("en"));

    for (const locale of SUPPORTED_APP_LOCALES.filter(
      (supportedLocale) => supportedLocale !== "en",
    )) {
      const copy = buildSettingsLocalizedCopy(createRuntimeI18n(locale));

      expect(copy.layout.overview.title).not.toBe(
        englishCopy.layout.overview.title,
      );
      expect(copy.quickSetup.noActionNeeded).not.toBe(
        englishCopy.quickSetup.noActionNeeded,
      );
      expect(copy.preferences.detail).not.toBe(englishCopy.preferences.detail);
      expect(copy.themeCustomization.enterValidSeed).not.toBe(
        englishCopy.themeCustomization.enterValidSeed,
      );
      expect(copy.credentials.saveConfig).not.toBe(
        englishCopy.credentials.saveConfig,
      );
      expect(copy.credentials.cursorHelpText).not.toBe(
        englishCopy.credentials.cursorHelpText,
      );
      expect(copy.credentials.codexHelpText).not.toBe(
        englishCopy.credentials.codexHelpText,
      );

      if (locale !== "zh-CN") {
        expect(copy.sources.preferenceLabel).toBe(
          englishCopy.sources.preferenceLabel,
        );
        expect(copy.permissions.requestAccess).toBe(
          englishCopy.permissions.requestAccess,
        );
      }
    }
  });

  it("preserves the legacy localized-copy export path", () => {
    const preference: ProviderSourcePreference = "official_api";
    const sourceKind: ProviderSourceKind = "session_page";
    const copy = buildReexportedCopy(createRuntimeI18n("en"));

    expect(getReexportedSourcePreferenceLabel(preference, copy)).toBe(
      "Official API",
    );
    expect(getReexportedSourceKindLabel(sourceKind, copy)).toBe("Session page");
  });
});
