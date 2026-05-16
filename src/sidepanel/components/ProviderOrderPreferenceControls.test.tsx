import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/constants";
import { createRuntimeI18n } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import {
  moveProviderInOrder,
  reorderProviderBefore,
} from "../../shared/display-preferences";
import { ProviderOrderPreferenceControls } from "./ProviderOrderPreferenceControls";

describe("ProviderOrderPreferenceControls", () => {
  it("renders one reorder surface for popup, sidebar, and full-page tab", () => {
    const copy = buildSettingsLocalizedCopy(createRuntimeI18n("en"));
    const html = renderToStaticMarkup(
      <ProviderOrderPreferenceControls
        copy={copy.providerOrder}
        providers={SAMPLE_APP_STATE.providerSettings}
        providerOrderBySurface={SAMPLE_APP_STATE.settings.providerOrderBySurface}
        onChange={() => {}}
      />,
    );

    expect(html).toContain('data-provider-order-preferences=""');
    expect(html).toContain('data-provider-order-surface="popup"');
    expect(html).toContain('data-provider-order-surface="sidebar"');
    expect(html).toContain('data-provider-order-surface="fullPage"');
    expect(html).toContain('data-provider-order-row="cursor-personal-page"');
    expect(html).toContain('draggable="true"');
    expect(html).toContain("ArrowUp");
    expect(html).toContain("ArrowDown");
    expect(html).toContain("Full-page tab");
    expect(html).toContain("8 providers");
    expect(html).toContain("Move Cursor Personal Usage Page down on Popup");
  });

  it("renders non-English provider-order copy", () => {
    const copy = buildSettingsLocalizedCopy(createRuntimeI18n("de"));
    const html = renderToStaticMarkup(
      <ProviderOrderPreferenceControls
        copy={copy.providerOrder}
        providers={SAMPLE_APP_STATE.providerSettings}
        providerOrderBySurface={SAMPLE_APP_STATE.settings.providerOrderBySurface}
        onChange={() => {}}
      />,
    );

    expect(html).toContain("Provider-Reihenfolge");
    expect(html).toContain("Vollseiten-Tab");
    expect(html).toContain("Nach unten");
    expect(html).not.toContain("Choose the order per surface");
  });

  it("uses shared provider-order helpers for button and drag semantics", () => {
    const providerIds = SAMPLE_APP_STATE.providerSettings.map(
      (provider) => provider.id,
    );

    expect(moveProviderInOrder([], providerIds, "jetbrains-org-page", "up")).toEqual([
      "cursor-personal-page",
      "jetbrains-org-page",
      "cursor-team-api",
      "claude-code-team-page",
      "claude-code-admin-api",
      "gemini-policy",
      "codex-personal-page",
      "codex-enterprise-api",
    ]);
    expect(reorderProviderBefore([], providerIds, "codex-personal-page", "cursor-personal-page")).toEqual([
      "codex-personal-page",
      "cursor-personal-page",
      "cursor-team-api",
      "jetbrains-org-page",
      "claude-code-team-page",
      "claude-code-admin-api",
      "gemini-policy",
      "codex-enterprise-api",
    ]);
  });
});
