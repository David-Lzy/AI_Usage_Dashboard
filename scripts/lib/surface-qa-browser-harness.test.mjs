import { describe, expect, it } from "vitest";

import { assert, assertVisibleTop } from "./surface-qa-browser-harness.mjs";

describe("surface QA browser harness", () => {
  it("throws assertion errors with the provided message", () => {
    expect(() => assert(false, "failed condition")).toThrow("failed condition");
    expect(() => assert(true, "passed condition")).not.toThrow();
  });

  it("accepts visible element tops inside the viewport band", () => {
    expect(() =>
      assertVisibleTop(
        {
          viewportHeight: 900,
          colorDropdownTop: 320,
        },
        "colorDropdownTop",
        "color dropdown",
      ),
    ).not.toThrow();
  });

  it("rejects missing or offscreen element tops", () => {
    expect(() =>
      assertVisibleTop(
        {
          viewportHeight: 900,
          colorDropdownTop: null,
        },
        "colorDropdownTop",
        "color dropdown",
      ),
    ).toThrow("color dropdown top was not available");
    expect(() =>
      assertVisibleTop(
        {
          viewportHeight: 900,
          colorDropdownTop: 850,
        },
        "colorDropdownTop",
        "color dropdown",
      ),
    ).toThrow("color dropdown was not restored into view");
  });
});
