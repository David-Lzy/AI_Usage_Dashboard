import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/constants";
import { createRuntimeI18n } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import { getSettingsUserLevelVisibility } from "../settings-user-level-visibility";
import { SettingsSourceSection } from "./SettingsSourceSection";

describe("SettingsSourceSection", () => {
  it("renders source cards with stable source hooks", () => {
    const i18n = createRuntimeI18n("en", undefined);
    const settingsCopy = buildSettingsLocalizedCopy(i18n);
    const html = renderToStaticMarkup(
      <SettingsSourceSection
        sectionId="settings-source-test"
        eyebrow="Source connections"
        title="Provider sources"
        detail="Choose how each provider is refreshed."
        focusedProviderId="codex-personal-page"
        providers={SAMPLE_APP_STATE.providerSettings}
        snapshots={SAMPLE_APP_STATE.providers}
        i18n={i18n}
        settingsCopy={settingsCopy}
        userLevelVisibility={getSettingsUserLevelVisibility("advanced")}
        sessionPageNavigationAvailable
        activeSessionPageAttachAvailable={false}
        onSetSourcePreference={() => {}}
        onOpenSessionPage={() => {}}
        onAttachActiveSessionPage={() => {}}
        onClearPageBinding={() => {}}
      />,
    );

    expect(html).toContain('id="settings-source-test"');
    expect(html).toContain('data-provider-carousel=""');
    expect(html).toContain('data-provider-carousel-active-id="codex-personal-page"');
    expect(html).toContain('class="source-card"');
    expect(html).toContain('data-provider-id="cursor-personal-page"');
    expect(html).toContain('data-provider-id="codex-personal-page"');
    expect(html).toContain('data-provider-id="codex-enterprise-api"');
    expect(html).not.toContain("data-settings-material-select=");
  });
});
