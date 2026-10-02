import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ControlVisibilityBoundary, useControlVisibility } from "./control-visibility";
import { MaterialSelect } from "../sidepanel/components/MaterialSelect";

describe("control visibility", () => {
  it("keeps hidden panels hidden even when a consumer assigns grid display", () => {
    const html = renderToStaticMarkup(<ControlVisibilityBoundary hidden style={{ display: "grid", color: "red" }}>Draft</ControlVisibilityBoundary>);
    expect(html).toContain("display:none;color:red");
  });
  it("keeps an empty animated region logically inaccessible when closed", () => {
    const html = renderToStaticMarkup(<ControlVisibilityBoundary animate hidden id="empty-region" />);
    expect(html).toContain('data-motion-disclosure="true"');
    expect(html).toContain('inert=""');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('hidden=""');
  });
  it("retains mounted children while propagating hidden ancestors", () => {
    function Probe() { return <output>{String(useControlVisibility())}</output>; }
    const html = renderToStaticMarkup(<ControlVisibilityBoundary hidden><ControlVisibilityBoundary><Probe /></ControlVisibilityBoundary></ControlVisibilityBoundary>);
    expect(html).toContain('hidden=""');
    expect(html).toContain("<output>false</output>");
  });
  it("separates a visible closing shell from its logically hidden controls", () => {
    function Probe() { return <output>{String(useControlVisibility())}</output>; }
    const html = renderToStaticMarkup(<ControlVisibilityBoundary logicalHidden><Probe /></ControlVisibilityBoundary>);
    expect(html).not.toContain('hidden=""');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('inert=""');
    expect(html).toContain('<output>false</output>');
  });
  it("does not render a restored portal menu for a hidden settings category", () => {
    const html = renderToStaticMarkup(<ControlVisibilityBoundary hidden><MaterialSelect
      label="Choice" value="one" fieldIdPrefix="test" sessionPopoverId="test" activePopover={{ id: "test" }}
      options={[{ value: "one", label: "One" }, { value: "two", label: "Two" }]} onChange={() => {}} />
    </ControlVisibilityBoundary>);
    expect(html).toContain('role="combobox"');
    expect(html).not.toContain('role="listbox"');
  });
});
