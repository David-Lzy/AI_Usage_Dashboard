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
      i18n,
      providers: SAMPLE_APP_STATE.providerSettings,
      settingsCopy,
      snapshots: SAMPLE_APP_STATE.providers,
    });

    expect(viewModels.settingsSectionNavItems).toEqual([
      { id: SETTINGS_SECTION_IDS.preferences, label: "Preferences" },
      { id: SETTINGS_SECTION_IDS.visibility, label: "Visibility" },
      { id: SETTINGS_SECTION_IDS.credentials, label: "Credentials" },
      { id: SETTINGS_SECTION_IDS.sources, label: "Sources" },
      { id: SETTINGS_SECTION_IDS.permissions, label: "Permissions" },
    ]);
    expect(viewModels.settingsSummaryItems.length).toBeGreaterThan(0);
    expect(
      viewModels.credentialProviders.map(({ provider }) => provider.id),
    ).toEqual(["cursor", "claude-code"]);
    expect(viewModels.credentialProviders[0]).toMatchObject({
      title: "Cursor Team Admin API key",
      inputLabel: "Admin API key",
    });
    expect(viewModels.codexProvider?.id).toBe("codex");
  });

  it("uses localized Settings section labels for the zh-CN pilot", () => {
    const i18n = createRuntimeI18n("zh-CN", undefined);
    const settingsCopy = buildSettingsLocalizedCopy(i18n);
    const viewModels = buildSettingsPageViewModels({
      i18n,
      providers: SAMPLE_APP_STATE.providerSettings,
      settingsCopy,
      snapshots: SAMPLE_APP_STATE.providers,
    });

    expect(viewModels.settingsSectionNavItems).toContainEqual({
      id: SETTINGS_SECTION_IDS.preferences,
      label: "偏好",
    });
    expect(viewModels.credentialProviders[1]?.title).toBe(
      "Claude Code Analytics Admin API key",
    );
  });
});
