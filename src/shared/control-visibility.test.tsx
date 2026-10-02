import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ControlVisibilityBoundary, useControlVisibility } from "./control-visibility";
import { MaterialSelect } from "../sidepanel/components/MaterialSelect";

describe("control visibility", () => {
  it("retains mounted children while propagating hidden ancestors", () => {
    function Probe() { return <output>{String(useControlVisibility())}</output>; }
    const html = renderToStaticMarkup(<ControlVisibilityBoundary hidden><ControlVisibilityBoundary><Probe /></ControlVisibilityBoundary></ControlVisibilityBoundary>);
    expect(html).toContain('hidden=""');
    expect(html).toContain("<output>false</output>");
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
