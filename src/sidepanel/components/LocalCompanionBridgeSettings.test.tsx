import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LocalCompanionBridgeSettings } from "./LocalCompanionBridgeSettings";

describe("LocalCompanionBridgeSettings", () => {
  it("renders compact developer controls without a saved pairing code", () => {
    const html = renderToStaticMarkup(
      <LocalCompanionBridgeSettings
        customSources={[]}
        customSourceStates={[]}
        locale="en"
      />,
    );

    expect(html).toContain('data-local-companion-bridge-settings=""');
    expect(html).toContain('data-local-companion-settings=""');
    expect(html).toContain('data-local-companion-base-url=""');
    expect(html).toContain('data-companion-input="base-url"');
    expect(html).toContain('data-local-companion-pairing-code=""');
    expect(html).toContain('data-companion-input="pairing-code"');
    expect(html).toContain('data-local-companion-action="pair"');
    expect(html).toContain('data-companion-action="pair"');
    expect(html).toContain('data-local-companion-action="refresh-index"');
    expect(html).toContain('data-local-companion-action="remove-source"');
    expect(html).toContain('data-companion-source=""');
    expect(html).toContain('data-companion-status="disconnected"');
    expect(html).toContain('data-material-action-icon="refresh"');
    expect(html).toContain('class="settings-section-anchor local-companion-bridge-settings"');
    expect(html).not.toContain("status-card local-companion");
    expect(html).not.toContain("Pairing was not accepted.");
  });
});
