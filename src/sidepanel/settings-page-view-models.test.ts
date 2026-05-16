import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../shared/constants";
import { createRuntimeI18n } from "../shared/i18n";
import { buildSettingsLocalizedCopy } from "../shared/localized-copy";
import { SETTINGS_SECTION_IDS } from "./settings-section-ids";
import { buildSettingsPageViewModels } from "./settings-page-view-models";

describe("buildSettingsPageViewModels", () => {
  it("builds Settings nav, summary, and credential section models", () => {
    const i18n = createRuntimeI18n("en", undefined);
    const settingsCopy = buildSettingsLocalizedCopy(i18n);
    const viewModels = buildSettingsPageViewModels({
      providers: SAMPLE_APP_STATE.providerSettings,
      settings: SAMPLE_APP_STATE.settings,
      settingsCopy,
      snapshots: SAMPLE_APP_STATE.providers,
    });

    expect(viewModels.settingsSectionNavItems).toEqual([
      { id: SETTINGS_SECTION_IDS.overview, label: "Overview" },
      { id: SETTINGS_SECTION_IDS.quickSetup, label: "Quick Setup" },
      { id: SETTINGS_SECTION_IDS.appearance, label: "Appearance & Sync" },
      {
        id: SETTINGS_SECTION_IDS.providerDisplay,
        label: "Provider display settings",
      },
    ]);
    expect(viewModels.settingsSummaryItems.length).toBeGreaterThan(0);
    expect(
      viewModels.credentialProviders.map(({ provider }) => provider.id),
    ).toEqual(["cursor-team-api", "claude-code-admin-api"]);
    expect(viewModels.credentialProviders[0]).toMatchObject({
      title: "Cursor Team Admin API key",
      inputLabel: "Admin API key",
    });
    expect(viewModels.codexProvider?.id).toBe("codex-enterprise-api");
  });

  it("uses localized Settings section labels for the zh-CN pilot", () => {
    const i18n = createRuntimeI18n("zh-CN", undefined);
    const settingsCopy = buildSettingsLocalizedCopy(i18n);
    const viewModels = buildSettingsPageViewModels({
      providers: SAMPLE_APP_STATE.providerSettings,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        userLevel: "debug",
      },
      settingsCopy,
      snapshots: SAMPLE_APP_STATE.providers,
    });

    expect(viewModels.settingsSectionNavItems).toContainEqual({
      id: SETTINGS_SECTION_IDS.appearance,
      label: "外观与同步",
    });
    expect(viewModels.settingsSectionNavItems).toContainEqual({
      id: SETTINGS_SECTION_IDS.providerDisplay,
      label: "Provider 显示设置",
    });
    expect(viewModels.settingsSectionNavItems).toContainEqual({
      id: SETTINGS_SECTION_IDS.advanced,
      label: "高级",
    });
    expect(viewModels.credentialProviders[1]?.title).toBe(
      "Claude Code Analytics Admin API key",
    );
  });

  it("can expose the advanced nav chip for a focused settings deep link", () => {
    const i18n = createRuntimeI18n("en", undefined);
    const settingsCopy = buildSettingsLocalizedCopy(i18n);
    const viewModels = buildSettingsPageViewModels({
      providers: SAMPLE_APP_STATE.providerSettings,
      settings: SAMPLE_APP_STATE.settings,
      settingsCopy,
      snapshots: SAMPLE_APP_STATE.providers,
      showAdvancedSection: true,
    });

    expect(viewModels.settingsSectionNavItems).toContainEqual({
      id: SETTINGS_SECTION_IDS.advanced,
      label: "Advanced",
    });
  });
});
