import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createRuntimeI18n } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import {
  DEFAULT_PROGRESS_THICKNESS_PX,
  createDefaultProgressColorBands,
} from "../../shared/progress-appearance";
import { ProgressAppearancePreferenceControls } from "./ProgressAppearancePreferenceControls";

describe("ProgressAppearancePreferenceControls", () => {
  it("renders localized thickness and color-band controls", () => {
    const copy = buildSettingsLocalizedCopy(createRuntimeI18n("de"));
    const html = renderToStaticMarkup(
      <ProgressAppearancePreferenceControls
        copy={copy.progressAppearance}
        thicknessPx={DEFAULT_PROGRESS_THICKNESS_PX}
        colorBands={createDefaultProgressColorBands()}
        onThicknessPxChange={() => {}}
        onColorBandsChange={() => {}}
      />,
    );

    expect(html).toContain('data-progress-appearance-preferences=""');
    expect(html).toContain("Fortschrittsdarstellung");
    expect(html).toContain('id="progress-thickness-input"');
    expect(html).toContain('data-progress-color-band="low"');
    expect(html).toContain("#B3261E");
    expect(html).toContain("Farben zurucksetzen");
  });
});
