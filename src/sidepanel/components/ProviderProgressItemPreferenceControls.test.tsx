import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/constants";
import { ProviderProgressItemPreferenceControls } from "./ProviderProgressItemPreferenceControls";

describe("ProviderProgressItemPreferenceControls", () => {
  it("renders quota item controls for each surface without exposing usage facts", () => {
    const html = renderToStaticMarkup(
      <ProviderProgressItemPreferenceControls
        providers={SAMPLE_APP_STATE.providerSettings}
        snapshots={SAMPLE_APP_STATE.providers}
        progressItemsBySurface={SAMPLE_APP_STATE.settings.progressItemsBySurface}
        onChange={() => {}}
      />,
    );

    expect(html).toContain('data-provider-progress-preferences=""');
    expect(html).toContain(
      'data-provider-progress-preference-provider="jetbrains"',
    );
    expect(html).toContain('data-provider-progress-surface="popup"');
    expect(html).toContain('data-provider-progress-surface="sidebar"');
    expect(html).toContain('data-provider-progress-surface="fullPage"');
    expect(html).toContain('data-provider-progress-item-row="primary"');
    expect(html).toContain("Primary quota");
    expect(html).toContain("Shown");
    expect(html).not.toContain("Billing period");
    expect(html).not.toContain("Total spend");
  });
});
