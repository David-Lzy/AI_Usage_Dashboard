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
    expect(html).toContain('data-usage-history-preferences=""');
    expect(html).toContain("Show history modules by surface");
    expect(html).toContain(
      "Choose and order personal usage and turns independently",
    );
    expect(html).toContain(
      "provider-progress-list__item usage-history-preferences__item",
    );
    expect(html).toContain("Hide Personal usage on Popup");
    expect(html).toContain("Move Turns trend up on Popup");
    expect(html).toContain("Move Personal usage down on Popup");
    expect(html).toContain("2 providers");
    expect(html).not.toContain('data-provider-order-row="jetbrains-org-page"');
    expect(html).not.toContain(
      'data-provider-progress-preference-provider="jetbrains-org-page"',
    );
    expect(html).not.toContain('data-provider-order-row="gemini-policy"');
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

    expect(html).toContain("2 providers");
    expect(html).not.toContain('data-provider-order-row="cursor-personal-page"');
    expect(html).not.toContain(
      'data-provider-progress-preference-provider="cursor-personal-page"',
    );
  });

  it("includes custom sources in surface order and progress item controls", () => {
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
        customSources={[
          {
            id: "custom:build_quota",
            label: "Build Quota",
            description: "Internal quota endpoint",
            endpointUrl: "https://example.com/ai-usage.json",
            displayEnabled: true,
            refreshIntervalMinutes: 15,
            createdAt: "2026-06-26T00:00:00.000Z",
            updatedAt: "2026-06-26T00:00:00.000Z",
          },
        ]}
        customSourceStates={[
          {
            sourceId: "custom:build_quota",
            status: "ok",
            snapshot: {
              sourceId: "custom:build_quota",
              endpointId: "build_quota",
              label: "Build Quota",
              description: "Internal quota endpoint",
              planName: "Custom",
              quotaUnit: "percent",
              quotaWindow: "daily",
              used: 72,
              remaining: 28,
              total: 100,
              resetAt: "2026-06-27T10:00:00.000Z",
              resetLabel: "Resets tomorrow",
              syncedAt: "2026-06-26T10:00:00.000Z",
              syncStatus: "ok",
              tone: "neutral",
              warningReason: null,
              lastSyncLabel: "Just now",
              usageSummary: "28% daily quota remaining",
              quota: {
                label: "Daily quota",
                unit: "percent",
                window: "daily",
                used: 72,
                remaining: 28,
                total: 100,
                resetAt: null,
                resetLabel: "Resets tomorrow",
              },
              windows: [],
              balances: [],
              facts: [],
            },
            lastAttemptAt: "2026-06-26T10:00:00.000Z",
            lastSuccessAt: "2026-06-26T10:00:00.000Z",
            lastFailureAt: null,
            lastFailureReason: null,
            stale: false,
          },
        ]}
        settingsCopy={settingsCopy}
        onProviderOrderBySurfaceChange={() => {}}
        onProgressItemsBySurfaceChange={() => {}}
      />,
    );

    expect(html).toContain('data-provider-order-row="custom:build_quota"');
    expect(html).toContain(
      'data-provider-progress-preference-provider="custom:build_quota"',
    );
    expect(html).toContain(">Build Quota · Custom<");
    expect(html).toContain(">Daily quota<");
  });
});
