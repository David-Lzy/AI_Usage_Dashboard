import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createRuntimeI18n } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import {
  DEFAULT_PROGRESS_THICKNESS_PX,
  createDefaultProgressColorAppearance,
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
        colorAppearance={createDefaultProgressColorAppearance()}
        colorBands={createDefaultProgressColorBands()}
        onThicknessPxChange={() => {}}
        onColorAppearanceChange={() => {}}
        onColorBandsChange={() => {}}
      />,
    );

    expect(html).toContain('data-progress-appearance-preferences=""');
    expect(html).toContain("Fortschrittsdarstellung");
    expect(html).toContain(
      'class="progress-appearance-card progress-appearance-thickness"',
    );
    expect(html).toContain(
      'class="form-field__label progress-appearance-card__title"',
    );
    expect(html).toContain(
      'class="progress-appearance-card progress-appearance-bands"',
    );
    expect(html).toContain('class="progress-appearance-card__title"');
    expect(html).not.toContain("provider-progress-provider__title");
    expect(html).toContain('id="progress-thickness-input"');
    expect(html).toContain('step="0.01"');
    expect(html).toContain('inputMode="decimal"');
    expect(html).toContain('aria-valuetext="10 px"');
    expect(html).toContain('data-progress-color-band="low"');
    expect(html).toContain('data-color-choice-dropdown="progress-color-band-low"');
    expect(html).toContain('data-color-choice-menu-density="compact"');
    expect(html).toContain(
      'data-session-popover-id="progress-color-band:low:color"',
    );
    expect(html).toContain("Rot");
    expect(html).toContain("#B3261E");
    expect(html).toContain("Farben zurucksetzen");
    expect(html).toContain("Traditional");
    expect(html).toContain("Gradient");
    expect(html).not.toContain("color-choice-dropdown__hex");
    expect(html).not.toContain('type="color"');
  });

  it("renders gradient stop editor when the gradient mode is selected", () => {
    const copy = buildSettingsLocalizedCopy(createRuntimeI18n("zh-CN"));
    const html = renderToStaticMarkup(
      <ProgressAppearancePreferenceControls
        copy={copy.progressAppearance}
        colorChoiceCopy={copy.colorChoices}
        thicknessPx={DEFAULT_PROGRESS_THICKNESS_PX}
        colorAppearance={{
          mode: "gradient",
          stops: [
            {
              id: "empty",
              positionPercent: 0,
              colorHex: "#B3261E",
            },
            {
              id: "middle",
              positionPercent: 50,
              colorHex: "#8A4B00",
            },
            {
              id: "full",
              positionPercent: 100,
              colorHex: "#146C2E",
            },
          ],
        }}
        colorBands={createDefaultProgressColorBands()}
        onThicknessPxChange={() => {}}
        onColorAppearanceChange={() => {}}
        onColorBandsChange={() => {}}
      />,
    );

    expect(html).toContain('data-progress-gradient-editor=""');
    expect(html).toContain("剩余渐变");
    expect(html).toContain("--progress-gradient-track");
    expect(html).toContain('role="slider"');
    expect(html).toContain('aria-valuenow="50"');
    expect(html).toContain('data-selected="true"');
    expect(html).toContain('data-color-choice-dropdown="progress-gradient-stop-empty"');
    expect(html).toContain("删除停止点");
  });

  it("keeps color-band number and color controls compact but aligned", () => {
    expect(settingsAppearanceCss).toContain(".progress-appearance-card {");
    expect(settingsAppearanceCss).toContain(".progress-appearance-card__title {");
    expect(settingsAppearanceCss).toContain(
      "grid-template-columns: repeat(\n    auto-fit,",
    );
    expect(settingsAppearanceCss).toContain(
      "minmax(min(100%, var(--progress-appearance-band-field-min)), 1fr)",
    );
    expect(settingsAppearanceCss).toContain("justify-content: stretch;");
    expect(settingsAppearanceCss).toContain("inline-size: 100%;");
    expect(settingsAppearanceCss).toContain("@media (max-width: 720px)");
    expect(settingsAppearanceCss).toContain(
      "grid-template-columns: repeat(2, minmax(0, 1fr));",
    );
    expect(settingsAppearanceCss).toContain("grid-column: 1 / -1;");
    expect(settingsAppearanceCss).toContain(
      ".progress-appearance-band__range {\n    grid-column: 1;",
    );
    expect(settingsAppearanceCss).toContain(
      ".progress-appearance-band__actions {\n    grid-column: 2;",
    );
  });

  it("keeps the thickness number field wide enough for localized controls", () => {
    expect(settingsAppearanceCss).toContain(
      "grid-template-columns: minmax(112px, 132px) minmax(160px, 1fr) auto;",
    );
    expect(settingsAppearanceCss).toContain("min-inline-size: 7.5rem;");
  });

  it("centers the UI settings toggle label with its icon", () => {
    expect(settingsAppearanceCss).toContain(
      ".settings-preferences__more-toggle-label {",
    );
    expect(settingsAppearanceCss).toContain("display: inline-flex;");
    expect(settingsAppearanceCss).toContain("align-items: center;");
    expect(settingsAppearanceCss).toContain(
      "min-height: var(--md-sys-typescale-label-large-line-height);",
    );
  });
});
