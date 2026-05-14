import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createRuntimeI18n } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import {
  DEFAULT_PROGRESS_THICKNESS_PX,
  createDefaultProgressColorBands,
} from "../../shared/progress-appearance";
import { ProgressAppearancePreferenceControls } from "./ProgressAppearancePreferenceControls";

const settingsAppearanceCss = readFileSync(
  new URL("../theme/settings-appearance.css", import.meta.url),
  "utf8",
);

describe("ProgressAppearancePreferenceControls", () => {
  it("renders localized thickness and color-band controls", () => {
    const copy = buildSettingsLocalizedCopy(createRuntimeI18n("de"));
    const html = renderToStaticMarkup(
      <ProgressAppearancePreferenceControls
        copy={copy.progressAppearance}
        colorChoiceCopy={copy.colorChoices}
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
    expect(html).toContain('data-color-choice-dropdown="progress-color-band-low"');
    expect(html).toContain("Rot");
    expect(html).toContain("#B3261E");
    expect(html).toContain("Farben zurucksetzen");
    expect(html).not.toContain("color-choice-dropdown__hex");
    expect(html).not.toContain('type="color"');
  });

  it("keeps color-band number and color controls compact but aligned", () => {
    expect(settingsAppearanceCss).toContain(
      "grid-template-columns: max-content max-content minmax(148px, 16rem);",
    );
    expect(settingsAppearanceCss).toContain("inline-size: 5.5ch;");
    expect(settingsAppearanceCss).toContain("min-inline-size: 68px;");
    expect(settingsAppearanceCss).toContain("min-inline-size: 9.5rem;");
    expect(settingsAppearanceCss).toContain("@media (max-width: 720px)");
    expect(settingsAppearanceCss).toContain("grid-column: 1 / -1;");
  });
});
