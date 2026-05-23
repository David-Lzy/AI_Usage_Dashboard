import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/constants";
import { createRuntimeI18n } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import { ProviderProgressItemPreferenceControls } from "./ProviderProgressItemPreferenceControls";

describe("ProviderProgressItemPreferenceControls", () => {
  it("renders quota item controls for each surface without exposing usage facts", () => {
    const copy = buildSettingsLocalizedCopy(createRuntimeI18n("en"));
    const html = renderToStaticMarkup(
      <ProviderProgressItemPreferenceControls
        copy={copy.progressItems}
        providers={SAMPLE_APP_STATE.providerSettings}
        snapshots={SAMPLE_APP_STATE.providers}
        progressItemsBySurface={SAMPLE_APP_STATE.settings.progressItemsBySurface}
        onChange={() => {}}
      />,
    );

    expect(html).toContain('data-provider-progress-preferences=""');
    expect(html).toContain(
      'data-provider-progress-preference-provider="jetbrains-org-page"',
    );
    expect(html).toContain('data-provider-progress-surface="popup"');
    expect(html).toContain('data-provider-progress-surface="sidebar"');
    expect(html).toContain('data-provider-progress-surface="fullPage"');
    expect(html).toContain("Popup");
    expect(html).toContain("Sidebar");
    expect(html).toContain("Full-page tab");
    expect(html).not.toContain("ポップアップ");
    expect(html).toContain('data-provider-progress-item-row="primary"');
    expect(html).toContain("Primary quota");
    expect(html).toContain("Shown");
    expect(html).not.toContain("Billing period");
    expect(html).not.toContain("Total spend");
  });

  it("keeps each provider quota item detail collapsed by default", () => {
    const copy = buildSettingsLocalizedCopy(createRuntimeI18n("en"));
    const html = renderToStaticMarkup(
      <ProviderProgressItemPreferenceControls
        copy={copy.progressItems}
        providers={SAMPLE_APP_STATE.providerSettings}
        snapshots={SAMPLE_APP_STATE.providers}
        progressItemsBySurface={SAMPLE_APP_STATE.settings.progressItemsBySurface}
        onChange={() => {}}
      />,
    );

    expect(html).toContain(
      '<details class="provider-progress-provider" data-provider-progress-preference-provider="jetbrains-org-page">',
    );
    expect(html).toContain(
      'data-provider-progress-preference-provider-summary="jetbrains-org-page"',
    );
    expect(html).toContain("1 configurable quota items");
    expect(html).not.toMatch(
      /<details[^>]*data-provider-progress-preference-provider="jetbrains-org-page"[^>]*open/,
    );
    expect(html).toContain(
      '<details class="provider-progress-provider" data-provider-progress-preference-provider="codex-personal-page">',
    );
    expect(html).toContain(
      'data-provider-progress-preference-provider-summary="codex-personal-page"',
    );
    expect(html).not.toMatch(
      /<details[^>]*data-provider-progress-preference-provider="codex-personal-page"[^>]*open/,
    );
  });

  it("can restore a provider quota item detail open state", () => {
    const copy = buildSettingsLocalizedCopy(createRuntimeI18n("en"));
    const html = renderToStaticMarkup(
      <ProviderProgressItemPreferenceControls
        copy={copy.progressItems}
        providers={SAMPLE_APP_STATE.providerSettings}
        snapshots={SAMPLE_APP_STATE.providers}
        detailsOpenByProvider={{ "codex-personal-page": true }}
        progressItemsBySurface={SAMPLE_APP_STATE.settings.progressItemsBySurface}
        onChange={() => {}}
      />,
    );

    expect(html).toMatch(
      /<details[^>]*data-provider-progress-preference-provider="codex-personal-page"[^>]*open/,
    );
  });

  it("renders quota item controls with non-English localized copy", () => {
    const copy = buildSettingsLocalizedCopy(createRuntimeI18n("de"));
    const html = renderToStaticMarkup(
      <ProviderProgressItemPreferenceControls
        copy={copy.progressItems}
        providers={SAMPLE_APP_STATE.providerSettings}
        snapshots={SAMPLE_APP_STATE.providers}
        progressItemsBySurface={SAMPLE_APP_STATE.settings.progressItemsBySurface}
        onChange={() => {}}
      />,
    );

    expect(html).toContain("Kontingentelemente");
    expect(html).toContain("Angezeigt");
    expect(html).toContain("Vollseiten-Tab");
    expect(html).not.toContain("Quota items");
    expect(html).not.toContain(">Shown<");
  });
});
