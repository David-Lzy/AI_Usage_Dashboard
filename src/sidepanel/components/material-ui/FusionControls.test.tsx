import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FusionSelect, FusionTextField, FusionCheckbox, FusionButton } from "./FusionControls";
import { restoreRequiredSelectValue } from "./mdui-compat";

describe("MDUI production adapter", () => {
  it("keeps required controlled values when MDUI deselects or returns an unknown option", () => {
    const options = [{ value: "on" }, { value: "off" }];
    expect(restoreRequiredSelectValue("", "on", options)).toBe("on");
    expect(restoreRequiredSelectValue(["off"], "on", options)).toBe("on");
    expect(restoreRequiredSelectValue("off", "on", options)).toBe("off");
  });
  it("renders local custom elements with real disabled and required state", () => {
    const html = renderToStaticMarkup(<FusionSelect label="Language" fieldIdPrefix="locale"
      value="en" options={[{ value: "en", label: "English" }]} sessionPopoverId="locale" disabled onChange={() => {}} />);
    expect(html).toContain("mdui-select");
    expect(html).toContain('aria-label="Language"');
    expect(html).toContain("required");
    expect(html).toContain("disabled");
    expect(html).toContain("English");
    expect(html).toContain('data-session-popover-id="locale"');
    expect(html).toContain('data-settings-material-select="locale"');
  });
  it("does not discard validation bounds, helper or error text", () => {
    const html = renderToStaticMarkup(<FusionTextField id="threshold" label="Used percent"
      value="80" type="number" min={1} max={100} step={1} error="Invalid value" onChange={() => {}} />);
    expect(html).toContain('min="1"');
    expect(html).toContain('max="100"');
    expect(html).toContain('role="alert"');
    expect(html).toContain("Invalid value");
  });
  it("keeps checkbox labels and explicit command buttons", () => {
    const html = renderToStaticMarkup(<><FusionCheckbox checked disabled onChange={() => {}}>Weekly</FusionCheckbox>
      <FusionButton onClick={() => {}} compact>Test</FusionButton></>);
    expect(html).toContain("Weekly");
    expect(html).toContain("checked");
    expect(html).toContain("fusion-button--compact");
  });
});
