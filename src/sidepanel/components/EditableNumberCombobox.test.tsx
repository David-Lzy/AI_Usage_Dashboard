import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  EditableNumberCombobox,
  isEditableNumberInRange,
  parseEditableNumberDraft,
} from "./EditableNumberCombobox";

const formControlsCss = readFileSync(
  new URL("../theme/form-controls.css", import.meta.url),
  "utf8",
);

describe("EditableNumberCombobox", () => {
  it("renders an editable combobox instead of a native select", () => {
    const html = renderToStaticMarkup(
      <EditableNumberCombobox
        label="Default sync interval"
        value={30}
        minimum={15}
        maximum={240}
        unitLabel="minutes"
        errorText="Enter 15-240 minutes."
        menuButtonLabel="Show default sync interval presets"
        fieldIdPrefix="sync-interval"
        options={[
          { value: 15, label: "15 minutes" },
          { value: 30, label: "30 minutes" },
          { value: 60, label: "60 minutes" },
        ]}
        onChange={() => undefined}
      />,
    );

    expect(html).toContain('data-settings-custom-number-field="sync-interval"');
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-autocomplete="none"');
    expect(html).toContain('class="editable-number-combobox__menu-icon"');
    expect(html).toContain("minutes");
    expect(html).not.toContain("<select");
  });

  it("parses plain numeric drafts and common unit suffixes", () => {
    expect(parseEditableNumberDraft("45")).toBe(45);
    expect(parseEditableNumberDraft("80%")).toBe(80);
    expect(parseEditableNumberDraft("15 minutes")).toBe(15);
    expect(parseEditableNumberDraft("30 分钟")).toBe(30);
    expect(parseEditableNumberDraft("")).toBeNull();
    expect(parseEditableNumberDraft("about 30")).toBeNull();
  });

  it("validates integer range boundaries", () => {
    expect(isEditableNumberInRange(15, 15, 240)).toBe(true);
    expect(isEditableNumberInRange(240, 15, 240)).toBe(true);
    expect(isEditableNumberInRange(14, 15, 240)).toBe(false);
    expect(isEditableNumberInRange(241, 15, 240)).toBe(false);
    expect(isEditableNumberInRange(30.5, 15, 240)).toBe(false);
  });

  it("keeps editable values readable without inheriting tiny nested text", () => {
    expect(formControlsCss).toContain(
      "min-height: var(--app-control-height-large);",
    );
    expect(formControlsCss).toContain(".editable-number-combobox__input {");
    expect(formControlsCss).toContain(
      "font-size: var(--md-sys-typescale-body-large-size);",
    );
    expect(formControlsCss).toContain("text-align: start;");
  });
});
