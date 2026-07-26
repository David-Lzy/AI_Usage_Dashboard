import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createDefaultApiGatewayMeteringDisplayPreferences } from "../../shared/api-gateway-metering";
import { createRuntimeI18n } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import { ApiGatewayMeteringModulePreferenceControls } from "./ApiGatewayMeteringModulePreferenceControls";

describe("ApiGatewayMeteringModulePreferenceControls", () => {
  it("renders four ordered modules for every display surface", () => {
    const settingsCopy = buildSettingsLocalizedCopy(
      createRuntimeI18n("en", undefined),
    );
    const html = renderToStaticMarkup(
      <ApiGatewayMeteringModulePreferenceControls
        locale="en"
        settingsCopy={settingsCopy}
        value={createDefaultApiGatewayMeteringDisplayPreferences()}
        onChange={() => {}}
      />,
    );

    expect(html).toContain('data-api-gateway-module-preferences=""');
    expect(html.match(/data-api-gateway-module-row=/g)).toHaveLength(12);
    expect(html.match(/data-api-gateway-module-row="summary"/g)).toHaveLength(
      3,
    );
    expect(html).toContain("Choose and order metering modules");
    expect(html).toContain("Usage summary");
    expect(html).toContain("Usage trend");
    expect(html).toContain("Leading models");
    expect(html).toContain("Limit windows");
    expect(html).toContain("Move Usage summary down on Popup");
    expect(html).toContain("Up");
    expect(html).toContain("Down");
    expect(html).toContain("provider-order-preferences__surfaces");
    expect(html).toContain("provider-order-surface");
    expect(html).toContain("provider-order-list__item");
    expect(html).toContain("api-gateway-module-preferences__visibility");
    expect(html).toContain('draggable="true"');
    expect(html).toContain('tabindex="0"');
  });
});
