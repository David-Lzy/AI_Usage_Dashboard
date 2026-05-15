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

describe("ActionBadgeSelectionControls", () => {
  it("renders multi-select badges as one dropdown trigger by default", () => {
    const html = renderToStaticMarkup(
      <ActionBadgeSelectionControls
        label="Toolbar badge"
        options={OPTIONS}
        selectedValues={["attention", "quota:codex:5h"]}
        rotationLabel="Badge rotation interval"
        rotationValue={60}
        rotationMinimum={30}
        rotationMaximum={3600}
        rotationUnitLabel="seconds"
        rotationErrorText="Use 30-3600."
        rotationMenuButtonLabel="Expand badge rotation presets"
        rotationOptions={[{ value: 60, label: "60 seconds" }]}
        onSelectionsChange={() => {}}
        onRotationIntervalChange={() => {}}
      />,
    );

    expect(html).toContain('data-action-badge-selection-controls=""');
    expect(html).toContain("material-select__button");
    expect(html).toContain("Attention count · Codex 5-hour window");
    expect(html).not.toContain("action-badge-selection-controls__list");
    expect(html).not.toContain("action-badge-selection-controls__option");
    expect(html).toContain('data-settings-custom-number-field="action-badge-rotation-interval"');
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
});
