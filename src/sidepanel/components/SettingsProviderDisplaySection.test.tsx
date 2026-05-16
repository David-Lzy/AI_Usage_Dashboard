import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/constants";
import { createRuntimeI18n } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import { buildProviderSourceDisplayLocalizedCopy } from "../../shared/provider-source-display-localized-copy";
import { SETTINGS_SECTION_IDS } from "../settings-section-ids";
import { SettingsProviderDisplaySection } from "./SettingsProviderDisplaySection";

describe("SettingsProviderDisplaySection", () => {
  it("renders provider display controls as a standalone Settings section", () => {
    const i18n = createRuntimeI18n("en", undefined);
    const settingsCopy = buildSettingsLocalizedCopy(i18n);
    const providerSourceDisplayCopy =
      buildProviderSourceDisplayLocalizedCopy(i18n);
    const html = renderToStaticMarkup(
      <SettingsProviderDisplaySection
        sectionId={SETTINGS_SECTION_IDS.providerDisplay}
        settings={SAMPLE_APP_STATE.settings}
        providers={SAMPLE_APP_STATE.providerSettings}
        providerSourceDisplayCopy={providerSourceDisplayCopy}
        snapshots={SAMPLE_APP_STATE.providers}
        settingsCopy={settingsCopy}
        onProviderOrderBySurfaceChange={() => {}}
        onProgressItemsBySurfaceChange={() => {}}
      />,
    );

    expect(html).toContain(`id="${SETTINGS_SECTION_IDS.providerDisplay}"`);
    expect(html).toContain('data-settings-provider-display-section=""');
    expect(html).toContain(">Provider display settings<");
    expect(html).toContain("Manage provider order and visible quota progress items");
    expect(html).toContain('data-provider-order-preferences=""');
    expect(html).toContain('data-provider-progress-preferences=""');
    expect(html).toContain('data-provider-order-surface="popup"');
    expect(html).toContain('data-provider-order-surface="sidebar"');
    expect(html).toContain('data-provider-order-surface="fullPage"');
    expect(html).toContain('data-provider-progress-surface="popup"');
    expect(html).toContain('data-provider-progress-surface="sidebar"');
    expect(html).toContain('data-provider-progress-surface="fullPage"');
    expect(html).toContain("4 providers");
    expect(html).not.toContain('data-provider-order-row="jetbrains-org-page"');
    expect(html).not.toContain(
      'data-provider-progress-preference-provider="jetbrains-org-page"',
    );
    expect(html).toContain('data-provider-order-row="gemini-policy"');
  });

  it("keeps hidden providers out of surface order and quota item controls", () => {
    const i18n = createRuntimeI18n("en", undefined);
    const settingsCopy = buildSettingsLocalizedCopy(i18n);
    const providerSourceDisplayCopy =
      buildProviderSourceDisplayLocalizedCopy(i18n);
    const html = renderToStaticMarkup(
      <SettingsProviderDisplaySection
        sectionId={SETTINGS_SECTION_IDS.providerDisplay}
        settings={SAMPLE_APP_STATE.settings}
        providers={SAMPLE_APP_STATE.providerSettings.map((provider) =>
          provider.id === "cursor-personal-page"
            ? {
                ...provider,
                displayEnabled: false,
              }
            : provider,
        )}
        providerSourceDisplayCopy={providerSourceDisplayCopy}
        snapshots={SAMPLE_APP_STATE.providers}
        settingsCopy={settingsCopy}
        onProviderOrderBySurfaceChange={() => {}}
        onProgressItemsBySurfaceChange={() => {}}
      />,
    );

    expect(html).toContain("3 providers");
    expect(html).not.toContain('data-provider-order-row="cursor-personal-page"');
    expect(html).not.toContain(
      'data-provider-progress-preference-provider="cursor-personal-page"',
    );
  });
});
