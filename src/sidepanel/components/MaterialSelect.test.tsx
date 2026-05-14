import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  MaterialSelect,
  getNextMaterialSelectOptionIndex,
} from "./MaterialSelect";

describe("MaterialSelect", () => {
  it("renders a custom select-only combobox instead of a native select", () => {
    const html = renderToStaticMarkup(
      <MaterialSelect
        label="Theme mode"
        value="light"
        fieldIdPrefix="theme-mode"
        options={[
          { value: "system", label: "System" },
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ]}
        onChange={() => undefined}
      />,
    );

    expect(html).toContain('data-settings-material-select="theme-mode"');
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-haspopup="listbox"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('data-open="false"');
    expect(html).toContain('class="material-select__menu-icon"');
    expect(html).toContain("Light");
    expect(html).not.toContain("<select");
  });

  it("can hide the label when an enclosing Settings field already labels it", () => {
    const html = renderToStaticMarkup(
      <MaterialSelect
        label="Preference"
        labelHidden
        value="session_page"
        fieldIdPrefix="source-preference-codex"
        options={[
          { value: "auto", label: "Auto" },
          { value: "official_api", label: "Official API" },
          { value: "session_page", label: "Session page" },
        ]}
        onChange={() => undefined}
      />,
    );

    expect(html).toContain('data-label-hidden="true"');
    expect(html).toContain("material-select__label--hidden");
    expect(html).toContain("Session page");
  });

  it("wraps keyboard navigation through option indexes", () => {
    expect(getNextMaterialSelectOptionIndex(-1, "next", 3)).toBe(0);
    expect(getNextMaterialSelectOptionIndex(-1, "previous", 3)).toBe(2);
    expect(getNextMaterialSelectOptionIndex(2, "next", 3)).toBe(0);
    expect(getNextMaterialSelectOptionIndex(0, "previous", 3)).toBe(2);
  });
});
