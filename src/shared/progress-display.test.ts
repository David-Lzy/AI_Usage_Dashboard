import { describe, expect, it } from "vitest";

import {
  DEFAULT_POPUP_PROGRESS_STYLE,
  normalizeProgressDisplayStyle,
  PROGRESS_DISPLAY_STYLE_OPTIONS,
} from "./progress-display";

describe("progress display preferences", () => {
  it("defaults fresh popup installs to the soft circle style", () => {
    expect(DEFAULT_POPUP_PROGRESS_STYLE).toBe("circle-soft");
  });

  it("keeps all shipped progress style values valid", () => {
    expect(PROGRESS_DISPLAY_STYLE_OPTIONS.map((option) => option.value)).toEqual([
      "line",
      "circle",
      "circle-soft",
      "circle-gauge",
    ]);
    expect(normalizeProgressDisplayStyle("line")).toBe("line");
    expect(normalizeProgressDisplayStyle("circle")).toBe("circle");
    expect(normalizeProgressDisplayStyle("circle-soft")).toBe("circle-soft");
    expect(normalizeProgressDisplayStyle("circle-gauge")).toBe("circle-gauge");
    expect(normalizeProgressDisplayStyle("unknown", "circle")).toBe("circle");
  });
});
