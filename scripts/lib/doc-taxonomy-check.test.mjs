import { describe, expect, it } from "vitest";

import {
  comparePhaseTuples,
  DOC_TAXONOMY_CONVENTION_ONLY_PATTERNS,
  evaluateCompatibilityStub,
  evaluateDocLabels,
  evaluateTopLevelDocFiles,
  extractLatestCompletedSlicePath,
  parsePhaseTupleFromFilename,
} from "./doc-taxonomy-check.mjs";

describe("doc taxonomy check helpers", () => {
  it("parses phase filenames into sortable tuples", () => {
    expect(parsePhaseTupleFromFilename("135_Phase_Foo.md")).toEqual([135, 0]);
    expect(parsePhaseTupleFromFilename("41_2_Phase_Bar.md")).toEqual([41, 2]);
    expect(
      parsePhaseTupleFromFilename(
        "Doc/TODOs/Archive/by-phase/100-199/135_Phase_Foo.md",
      ),
    ).toEqual([135, 0]);
    expect(parsePhaseTupleFromFilename("README.md")).toBeNull();
  });

  it("compares phase tuples in archive order", () => {
    expect(comparePhaseTuples([41, 0], [41, 2])).toBeLessThan(0);
    expect(comparePhaseTuples([135, 0], [134, 0])).toBeGreaterThan(0);
  });

  it("extracts the latest completed slice path from the phase index", () => {
    expect(
      extractLatestCompletedSlicePath(
        "- latest completed slice: [135_Phase_Foo.md](./Archive/by-phase/100-199/135_Phase_Foo.md)",
      ),
    ).toBe("./Archive/by-phase/100-199/135_Phase_Foo.md");
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

  it("exposes the intentional convention-only taxonomy boundary", () => {
    expect(DOC_TAXONOMY_CONVENTION_ONLY_PATTERNS).toEqual([
      "Doc/TODOs/Archive/by-phase/*/*.md",
      "Doc/testing/Archive/phase-reports/*/Phase_*.md",
      "Doc/testing/operator_reviews/*/interaction-audit-handoff-bundle.md",
      "Doc/testing/theme_recovery_reviews/*/theme-recovery-summary.md",
    ]);
  });

  it("reports unclassified top-level Doc markdown files", () => {
    expect(
      evaluateTopLevelDocFiles([
        "Doc/README.md",
        "Doc/AI_Usage_Dashboard_TODOs.md",
        "Doc/Loose_Reference.md",
      ]),
    ).toEqual([
      "Doc/Loose_Reference.md is an unclassified top-level Doc markdown file; move it into a functional directory or add an explicit allowlist entry.",
    ]);
  });

  it("keeps compatibility stubs short and explicitly labeled", () => {
    expect(
      evaluateCompatibilityStub({
        relativePath: "Doc/Project_Quickstart.md",
        text: "# Project Quickstart\n\nStatus note:\n\n- compatibility stub\n",
      }),
    ).toEqual([]);
    expect(
      evaluateCompatibilityStub({
        relativePath: "Doc/Project_Quickstart.md",
        text: "# Project Quickstart\n",
        maxLineCount: 1,
      }),
    ).toEqual(["Doc/Project_Quickstart.md must identify itself as a compatibility stub."]);
  });
});
