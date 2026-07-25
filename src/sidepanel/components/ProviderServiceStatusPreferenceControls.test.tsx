import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createRuntimeI18n } from "../../shared/i18n";
import { createDefaultProviderServiceStatusVisibilityBySurface } from "../../shared/provider-service-status";
import { buildSettingsLocalizedCopy } from "../../shared/settings-localized-copy";
import { ProviderServiceStatusPreferenceControls } from "./ProviderServiceStatusPreferenceControls";

describe("ProviderServiceStatusPreferenceControls", () => {
  it("renders default-off controls for every approved vendor and surface", () => {
    const markup = renderToStaticMarkup(
      <ProviderServiceStatusPreferenceControls
        locale="en"
        settingsCopy={buildSettingsLocalizedCopy(createRuntimeI18n("en"))}
        value={createDefaultProviderServiceStatusVisibilityBySurface()}
        onChange={() => undefined}
      />,
    );

    expect(markup.match(/<fieldset/g)).toHaveLength(3);
    expect(markup.match(/type="checkbox"/g)).toHaveLength(9);
    expect(markup).not.toContain("checked=\"\"");
    expect(markup).toContain("OpenAI");
    expect(markup).toContain("Anthropic");
    expect(markup).toContain("Cursor");
  });

  it("renders localized default-off controls without mounting status content", () => {
    const markup = renderToStaticMarkup(
      <ProviderServiceStatusPreferenceControls
        locale="zh-CN"
        settingsCopy={buildSettingsLocalizedCopy(createRuntimeI18n("zh-CN"))}
        value={createDefaultProviderServiceStatusVisibilityBySurface()}
        onChange={() => undefined}
      />,
    );

    expect(markup).toContain("官方服务状态");
    expect(markup).toContain("Popup");
    expect(markup).not.toContain("data-provider-service-status-level");
  });
});
