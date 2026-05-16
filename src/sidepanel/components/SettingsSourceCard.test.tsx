import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/constants";
import { createRuntimeI18n } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import { getSettingsUserLevelVisibility } from "../settings-user-level-visibility";
import { SettingsSourceCard } from "./SettingsSourceCard";

describe("SettingsSourceCard", () => {
  it("renders source controls, session actions, and diagnostics for a provider", () => {
    const i18n = createRuntimeI18n("en", undefined);
    const settingsCopy = buildSettingsLocalizedCopy(i18n);
    const provider = SAMPLE_APP_STATE.providerSettings.find(
      (candidate) => candidate.id === "cursor-personal-page",
    );
    const snapshot = SAMPLE_APP_STATE.providers.find(
      (candidate) => candidate.providerId === "cursor-personal-page",
    );

    if (!provider || !snapshot) {
      throw new Error("Missing Cursor sample provider state.");
    }

    const html = renderToStaticMarkup(
      <SettingsSourceCard
        activeSessionPageAttachAvailable={false}
        i18n={i18n}
        provider={provider}
        sessionPageNavigationAvailable
        settingsCopy={settingsCopy}
        snapshot={snapshot}
        userLevelVisibility={getSettingsUserLevelVisibility("debug")}
        onAttachActiveSessionPage={() => {}}
        onClearPageBinding={() => {}}
        onOpenSessionPage={() => {}}
        onSetSourcePreference={() => {}}
      />,
    );

    expect(html).toContain('class="source-card"');
    expect(html).toContain('data-provider-id="cursor-personal-page"');
    expect(html).toContain(">Session page<");
    expect(html).not.toContain("data-settings-material-select=");
    expect(html).toContain('class="source-card__details-toggle"');
    expect(html).toContain("Detailed diagnostics");
  });
});
