import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MaterialColorPicker } from "./MaterialColorPicker";

describe("MaterialColorPicker", () => {
  it("renders an in-app Material-style picker with a hue slider", () => {
    const html = renderToStaticMarkup(
      <MaterialColorPicker
        label="Open color picker"
        valueHex="#146C2E"
        onChange={() => {}}
      />,
    );

    expect(html).toContain("color-choice-dropdown__material-picker");
    expect(html).toContain("color-choice-dropdown__picker-plane");
    expect(html).toContain("color-choice-dropdown__hue-range");
    expect(html).toContain('type="range"');
    expect(html).not.toContain('type="color"');
  });
});
