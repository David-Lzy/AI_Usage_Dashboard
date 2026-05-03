import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/constants";
import { createRuntimeI18n } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import { SETTINGS_SECTION_IDS } from "../settings-section-ids";
import { SettingsSourceSection } from "./SettingsSourceSection";

describe("SettingsSourceSection", () => {
  it("renders source cards with stable source hooks", () => {
    const i18n = createRuntimeI18n("en", undefined);
    const settingsCopy = buildSettingsLocalizedCopy(i18n);
    const html = renderToStaticMarkup(
      <SettingsSourceSection
        sectionId={SETTINGS_SECTION_IDS.sources}
        eyebrow="Source connections"
        title="Provider sources"
        detail="Choose how each provider is refreshed."
        providers={SAMPLE_APP_STATE.providerSettings}
        snapshots={SAMPLE_APP_STATE.providers}
        i18n={i18n}
        settingsCopy={settingsCopy}
        sessionPageNavigationAvailable
        activeSessionPageAttachAvailable={false}
        onSetSourcePreference={() => {}}
        onOpenSessionPage={() => {}}
        onAttachActiveSessionPage={() => {}}
        onClearPageBinding={() => {}}
      />,
    );

    expect(html).toContain(`id="${SETTINGS_SECTION_IDS.sources}"`);
    expect(html).toContain('class="source-card"');
    expect(html).toContain('data-provider-id="cursor"');
    expect(html).toContain('data-provider-id="codex"');
    expect(html).toContain(
      'data-settings-material-select="source-preference-cursor"',
    );
    expect(html).toContain('class="source-card__details-toggle"');
  });
});
