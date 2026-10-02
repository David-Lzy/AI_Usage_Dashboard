import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { FusionSelect, FusionTextField, FusionCheckbox, FusionButton } from "./FusionControls";
import { installSelectTopLayer, labelSelectMenu, restoreRequiredSelectValue } from "./mdui-compat";

describe("MDUI production adapter", () => {
  it("labels the native menu button with the current choice and links its menu", async () => {
    const input = {
      type: "text", style: {}, parentElement: { style: {} },
      ariaControlsElements: [] as unknown[], setAttribute: vi.fn(),
    };
    const menu = { setAttribute: vi.fn() };
    const field = { updateComplete: Promise.resolve(), shadowRoot: { querySelector: () => input } };
    const element = {
      updateComplete: Promise.resolve(), isConnected: true,
      shadowRoot: { querySelector: (selector: string) => selector === "mdui-text-field" ? field : menu },
    };
    await labelSelectMenu(element as unknown as Parameters<typeof labelSelectMenu>[0], "Language", "English");
    expect(input.type).toBe("button");
    expect(input.setAttribute).toHaveBeenCalledWith("aria-label", "Language: English");
    expect(input.setAttribute).toHaveBeenCalledWith("aria-haspopup", "menu");
    expect(menu.setAttribute).toHaveBeenCalledWith("role", "menu");
    expect(input.ariaControlsElements).toEqual([menu]);
    expect(input.parentElement.style).toEqual({ minWidth: "0" });
  });
  it("keeps a reopened menu in the top layer and cleans it up on unmount", () => {
    let shown = false;
    const panel = {
      isConnected: true, hidden: true, popover: null, style: {},
      matches: () => shown,
      showPopover: vi.fn(() => { shown = true; }),
      hidePopover: vi.fn(() => { shown = false; }),
    };
    const dropdown = Object.assign(new EventTarget(), {
      open: false, shadowRoot: { querySelector: () => panel },
    });
    const detach = installSelectTopLayer(dropdown as unknown as Parameters<typeof installSelectTopLayer>[0]);
    dropdown.open = true;
    dropdown.dispatchEvent(new Event("open"));
    expect(panel.popover).toBe("manual");
    expect(panel.hidden).toBe(false);
    expect(shown).toBe(true);
    panel.hidden = true;
    dropdown.dispatchEvent(new Event("closed"));
    expect(shown).toBe(true);
    expect(panel.hidden).toBe(false);
    dropdown.open = false;
    dropdown.dispatchEvent(new Event("closed"));
    expect(shown).toBe(false);
    dropdown.open = true;
    dropdown.dispatchEvent(new Event("open"));
    detach();
    expect(shown).toBe(false);
    dropdown.dispatchEvent(new Event("open"));
    expect(panel.showPopover).toHaveBeenCalledTimes(2);
  });
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
    expect(html).toContain('role="menuitemradio"');
    expect(html).toContain('aria-checked="true"');
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
