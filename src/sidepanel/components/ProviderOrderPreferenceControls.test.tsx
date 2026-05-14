import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/constants";
import {
  moveProviderInOrder,
  reorderProviderBefore,
} from "../../shared/display-preferences";
import { ProviderOrderPreferenceControls } from "./ProviderOrderPreferenceControls";

describe("ProviderOrderPreferenceControls", () => {
  it("renders one reorder surface for popup, sidebar, and full-page tab", () => {
    const html = renderToStaticMarkup(
      <ProviderOrderPreferenceControls
        providers={SAMPLE_APP_STATE.providerSettings}
        providerOrderBySurface={SAMPLE_APP_STATE.settings.providerOrderBySurface}
        onChange={() => {}}
      />,
    );

    expect(html).toContain('data-provider-order-preferences=""');
    expect(html).toContain('data-provider-order-surface="popup"');
    expect(html).toContain('data-provider-order-surface="sidebar"');
    expect(html).toContain('data-provider-order-surface="fullPage"');
    expect(html).toContain('data-provider-order-row="cursor"');
    expect(html).toContain('draggable="true"');
    expect(html).toContain("ArrowUp");
    expect(html).toContain("ArrowDown");
  });

  it("uses shared provider-order helpers for button and drag semantics", () => {
    const providerIds = SAMPLE_APP_STATE.providerSettings.map(
      (provider) => provider.id,
    );

    expect(moveProviderInOrder([], providerIds, "jetbrains", "up")).toEqual([
      "jetbrains",
      "cursor",
      "claude-code",
      "gemini",
      "codex",
    ]);
    expect(reorderProviderBefore([], providerIds, "codex", "cursor")).toEqual([
      "codex",
      "cursor",
      "jetbrains",
      "claude-code",
      "gemini",
    ]);
  });
});
