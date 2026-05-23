import { describe, expect, it } from "vitest";

import { resolveFloatingMenuPosition } from "./floating-menu-position";

describe("resolveFloatingMenuPosition", () => {
  it("opens below when there is enough room", () => {
    expect(
      resolveFloatingMenuPosition(
        { left: 100, right: 300, top: 120, bottom: 176, width: 200 },
        { width: 900, height: 700 },
        { preferredWidth: 520, preferredMaxHeight: 360 },
      ),
    ).toEqual({
      left: 100,
      top: 182,
      width: 520,
      maxHeight: 360,
      placement: "below",
    });
  });

  it("opens above when the trigger is near the viewport bottom", () => {
    expect(
      resolveFloatingMenuPosition(
        { left: 520, right: 760, top: 590, bottom: 646, width: 240 },
        { width: 900, height: 700 },
        { preferredWidth: 520, preferredMaxHeight: 360 },
      ),
    ).toEqual({
      left: 364,
      top: 224,
      width: 520,
      maxHeight: 360,
      placement: "above",
    });
  });

  it("aligns to the end edge for RTL menus", () => {
    expect(
      resolveFloatingMenuPosition(
        { left: 520, right: 760, top: 180, bottom: 236, width: 240 },
        { width: 900, height: 700 },
        { align: "end", preferredWidth: 520, preferredMaxHeight: 360 },
      ).left,
    ).toBe(240);
  });
});
