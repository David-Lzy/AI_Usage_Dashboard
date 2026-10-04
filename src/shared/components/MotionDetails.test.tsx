import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MotionDetails } from "./MotionDetails";
import { ControlVisibilityBoundary, useControlVisibility } from "../control-visibility";

describe("motion details", () => {
  function Probe() { return <output>{String(useControlVisibility())}</output>; }
  it("retains a closed form while declaring its logical state immediately", () => {
    const html = renderToStaticMarkup(<MotionDetails summary="Configure"><Probe /><input defaultValue="draft" /></MotionDetails>);
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('hidden=""');
    expect(html).toContain('inert=""');
    expect(html).toContain('<output>false</output>');
    expect(html).toContain('value="draft"');
  });
  it("supports initial and controlled expansion without exposing hidden ancestors", () => {
    const open = renderToStaticMarkup(<MotionDetails open summary="Configure"><Probe /></MotionDetails>);
    expect(open).toContain('aria-expanded="true"');
    expect(open).toContain('<output>true</output>');
    const hidden = renderToStaticMarkup(<ControlVisibilityBoundary hidden><MotionDetails open onOpenChange={() => {}} summary="Configure"><Probe /></MotionDetails></ControlVisibilityBoundary>);
    expect(hidden).toContain('<output>false</output>');
  });
});
