import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { ActionBadgeSelection } from "../../providers/types";
import {
  ActionBadgeSelectionControls,
  getActionBadgeSelectionSummary,
} from "./ActionBadgeSelectionControls";
import type { MaterialSelectOption } from "./MaterialSelect";

const OPTIONS: Array<MaterialSelectOption<ActionBadgeSelection>> = [
  { value: "attention", label: "Attention count" },
  { value: "quota:codex:5h", label: "Codex 5-hour window" },
  { value: "quota:codex:weekly", label: "Codex weekly window" },
];
const formControlsCss = readFileSync(
  new URL("../theme/form-controls.css", import.meta.url),
  "utf8",
);

describe("ActionBadgeSelectionControls", () => {
  it("renders multi-select badges as one dropdown trigger by default", () => {
    const html = renderToStaticMarkup(
      <ActionBadgeSelectionControls
        label="Toolbar badge"
        options={OPTIONS}
        selectedValues={["attention", "quota:codex:5h"]}
        selectionMode="auto"
        selectionModeLabel="Badge selection mode"
        automaticLabel="Automatic"
        manualLabel="Manual"
        onSelectionModeChange={() => {}}
        onSelectionsChange={() => {}}
      />,
    );

    expect(html).toContain('data-action-badge-selection-controls=""');
    expect(html).toContain('data-action-badge-selection-mode="auto"');
    expect(html).toContain('data-action-badge-mode-switch=""');
    expect(html).toContain('aria-readonly="true"');
    expect(html).toContain("Automatic");
    expect(html).toContain("Manual");
    expect(html).toContain("material-select__button");
    expect(html).toContain("Attention count · Codex 5-hour window");
    expect(html).not.toContain("action-badge-selection-controls__list");
    expect(html).not.toContain("action-badge-selection-controls__option");
    expect(html).not.toContain('data-settings-custom-number-field="action-badge-rotation-interval"');
  });

  it("summarizes long badge selections without expanding the field height", () => {
    expect(
      getActionBadgeSelectionSummary(
        OPTIONS,
        ["attention", "quota:codex:5h", "quota:codex:weekly"],
        "Attention count",
      ),
    ).toBe("Attention count · Codex 5-hour window +1");
  });

  it("keeps the dropdown wrapper aligned inside adaptive control grids", () => {
    expect(formControlsCss).toContain(
      ".adaptive-control-grid .action-badge-selection-controls__dropdown,",
    );
    expect(formControlsCss).toContain(
      ".adaptive-control-grid .action-badge-selection-controls__button {",
    );
    expect(formControlsCss).toContain(
      ".adaptive-control-grid .action-badge-selection-controls__label-row {",
    );
  });
});
