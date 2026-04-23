import { describe, expect, it } from "vitest";

import {
  comparePhaseTuples,
  evaluateDocLabels,
  extractLatestCompletedSlicePath,
  parsePhaseTupleFromFilename,
} from "./doc-taxonomy-check.mjs";

describe("doc taxonomy check helpers", () => {
  it("parses phase filenames into sortable tuples", () => {
    expect(parsePhaseTupleFromFilename("135_Phase_Foo.md")).toEqual([135, 0]);
    expect(parsePhaseTupleFromFilename("41_2_Phase_Bar.md")).toEqual([41, 2]);
    expect(parsePhaseTupleFromFilename("README.md")).toBeNull();
  });

  it("compares phase tuples in archive order", () => {
    expect(comparePhaseTuples([41, 0], [41, 2])).toBeLessThan(0);
    expect(comparePhaseTuples([135, 0], [134, 0])).toBeGreaterThan(0);
  });

  it("extracts the latest completed slice path from the phase index", () => {
    expect(
      extractLatestCompletedSlicePath(
        "- latest completed slice: [135_Phase_Foo.md](./Archive/135_Phase_Foo.md)",
      ),
    ).toBe("./Archive/135_Phase_Foo.md");
  });

  it("reports missing documentation labels", () => {
    expect(
      evaluateDocLabels({
        relativePath: "Doc/example.md",
        text: "# Example\n",
        needsClass: true,
        needsFreshness: true,
        needsStatus: true,
      }).issues,
    ).toEqual([
      "Doc/example.md is missing `Document class:`.",
      "Doc/example.md is missing `Freshness model:`.",
      "Doc/example.md is missing `Status note:`.",
    ]);
  });
});
