import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/demo-state";
import { createRuntimeI18n } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import { getSettingsUserLevelVisibility } from "../settings-user-level-visibility";
import { SettingsSourceSection } from "./SettingsSourceSection";

function renderSourceSection(userLevel: "advanced" | "debug") {
  const i18n = createRuntimeI18n("en");

  return renderToStaticMarkup(
    <SettingsSourceSection
      detail="Choose how each provider is refreshed."
      eyebrow="Source connections"
      i18n={i18n}
      providers={SAMPLE_APP_STATE.providerSettings}
      providerAccounts={SAMPLE_APP_STATE.providerAccounts}
      sessionPageNavigationAvailable
      settingsCopy={buildSettingsLocalizedCopy(i18n)}
      snapshots={SAMPLE_APP_STATE.providers}
      title="Provider sources"
      userLevelVisibility={getSettingsUserLevelVisibility(userLevel)}
      activeSessionPageAttachAvailable={false}
      onAttachActiveSessionPage={() => {}}
      onClearPageBinding={() => {}}
      onOpenSessionPage={() => {}}
      onSetSourcePreference={() => {}}
    />,
  );
}

describe("SettingsSourceSection diagnostics export", () => {
  it("keeps sanitized export debug-only", () => {
    expect(renderSourceSection("advanced")).not.toContain(
      'data-diagnostics-export=""',
    );
    expect(renderSourceSection("debug")).toContain(
      'data-diagnostics-export=""',
    );
  });
});
