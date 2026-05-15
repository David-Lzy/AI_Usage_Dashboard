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
    expect(copy.providerOrder.sectionLabel).toBe("Provider order");
    expect(copy.providerOrder.providerCount(5)).toBe("5 providers");
    expect(copy.providerOrder.surfaceLabels).toEqual({
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "Full-page tab",
    });
    expect(copy.progressItems.surfaceLabels).toEqual({
      popup: "Popup",
      sidebar: "Sidebar",
      fullPage: "Full-page tab",
    });
    expect(copy.progressAppearance.sectionLabel).toBe("Progress appearance");
    expect(copy.progressAppearance.thickness.unit).toBe("px");
    expect(copy.colorChoices.colorNames.indigo).toBe("Indigo");
    expect(copy.preferenceGroups.uiMoreShow).toBe("More UI settings");
    expect(copy.preferenceGroups.providerDisplayShow).toBe(
      "Provider display settings",
    );
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
    expect(copy.providerOrder.sectionLabel).toBe("Provider 顺序");
    expect(copy.providerOrder.providerCount(5)).toBe("5 个 Provider");
    expect(copy.progressItems.sectionLabel).toBe("额度项");
    expect(copy.progressItems.visibleCount(1, 3)).toBe("1/3 已显示");
    expect(copy.progressAppearance.sectionLabel).toBe("进度外观");
    expect(copy.progressAppearance.colorBands.rangeLabel(0, 20)).toBe(
      "剩余 0-20%",
    );
    expect(copy.colorChoices.colorNames.indigo).toBe("靛蓝");
    expect(copy.preferenceGroups.uiMoreShow).toBe("更多 UI 设置");
    expect(copy.preferenceGroups.uiMoreHide).toBe("收起 UI 设置");
    expect(copy.preferenceGroups.providerDisplayShow).toBe(
      "Provider 显示设置",
    );
  });

  it("ships Settings core, credential, source, permission, and quota item copy for every non-English locale", () => {
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
      expect(copy.sources.preferenceLabel).not.toBe(
        englishCopy.sources.preferenceLabel,
      );
      expect(copy.sources.operationalNoteLabel).not.toBe(
        englishCopy.sources.operationalNoteLabel,
      );
      expect(copy.sources.itemCount(3)).not.toBe(
        englishCopy.sources.itemCount(3),
      );
      expect(copy.sources.cardLabels.primary.availabilitySummary).not.toBe(
        englishCopy.sources.cardLabels.primary.availabilitySummary,
      );
      expect(copy.permissions.hostAccessMissing).not.toBe(
        englishCopy.permissions.hostAccessMissing,
      );
      expect(copy.permissions.requestAccess).not.toBe(
        englishCopy.permissions.requestAccess,
      );
      expect(copy.providerOrder.sectionLabel).not.toBe(
        englishCopy.providerOrder.sectionLabel,
      );
      expect(copy.providerOrder.title).not.toBe(englishCopy.providerOrder.title);
      expect(copy.providerOrder.up).not.toBe(englishCopy.providerOrder.up);
      expect(copy.progressItems.sectionLabel).not.toBe(
        englishCopy.progressItems.sectionLabel,
      );
      expect(copy.progressItems.title).not.toBe(englishCopy.progressItems.title);
      expect(copy.progressItems.detail).not.toBe(
        englishCopy.progressItems.detail,
      );
      expect(copy.progressItems.shown).not.toBe(englishCopy.progressItems.shown);
      expect(copy.progressItems.up).not.toBe(englishCopy.progressItems.up);
      expect(copy.progressItems.allHidden).not.toBe(
        englishCopy.progressItems.allHidden,
      );
      expect(copy.progressAppearance.sectionLabel).not.toBe(
        englishCopy.progressAppearance.sectionLabel,
      );
      expect(copy.progressAppearance.title).not.toBe(
        englishCopy.progressAppearance.title,
      );
      expect(copy.progressAppearance.colorBands.validationError).not.toBe(
        englishCopy.progressAppearance.colorBands.validationError,
      );
      expect(copy.colorChoices.customLabel).not.toBe(
        englishCopy.colorChoices.customLabel,
      );
      expect(copy.preferenceGroups.uiMoreShow).not.toBe(
        englishCopy.preferenceGroups.uiMoreShow,
      );
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
