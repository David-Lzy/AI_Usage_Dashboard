import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { ActionBadgeSelection } from "../../providers/types";
import {
  ActionBadgeSelectionControls,
  getActionBadgeSelectionOptionDisplayLabel,
  getActionBadgeSelectionSummary,
  groupActionBadgeSelectionOptions,
} from "./ActionBadgeSelectionControls";
import type { MaterialSelectOption } from "./MaterialSelect";

const OPTIONS: Array<MaterialSelectOption<ActionBadgeSelection>> = [
  { value: "attention", label: "Attention count" },
  { value: "quota:codex:5h", label: "Codex · 5-hour window remaining" },
  { value: "quota:codex:weekly", label: "Codex · Weekly window remaining" },
  { value: "quota:cursor:monthly", label: "Cursor · Monthly included requests" },
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
    expect(html).toContain('aria-readonly="true"');
    expect(html).toContain("material-select__button");
    expect(html).toContain("Attention count · Codex · 5-hour window remaining");
    expect(html).not.toContain('data-action-badge-mode-switch=""');
    expect(html).not.toContain("Automatic");
    expect(html).not.toContain("Manual");
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
    ).toBe("Attention count · Codex · 5-hour window remaining +1");
  });

  it("groups quota options by provider and shortens repeated option labels", () => {
    const optionGroups = groupActionBadgeSelectionOptions(OPTIONS);

    expect(optionGroups.attentionOptions).toEqual([OPTIONS[0]]);
    expect(optionGroups.providerGroups.map((group) => group.label)).toEqual([
      "Codex",
      "Cursor",
    ]);
    expect(optionGroups.providerGroups[0]?.options).toEqual([
      OPTIONS[1],
      OPTIONS[2],
    ]);
    expect(getActionBadgeSelectionOptionDisplayLabel(OPTIONS[1]!)).toBe(
      "5-hour window remaining",
    );
    expect(getActionBadgeSelectionOptionDisplayLabel(OPTIONS[0]!)).toBe(
      "Attention count",
    );
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
    expect(formControlsCss).toContain(
      ".action-badge-selection-controls__menu-header {",
    );
    expect(formControlsCss).toContain(
      ".action-badge-selection-controls__provider-options {",
    );
    expect(formControlsCss).toContain(
      "min-inline-size: min(420px, calc(100vw - 32px));",
    );
  });
});
