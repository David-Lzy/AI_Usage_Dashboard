import { describe, expect, it } from "vitest";

import {
  DESIGN_CONTRACT_REQUIRED_REFERENCES,
  DESIGN_CONTRACT_REQUIRED_SECTIONS,
  validateDesignContract,
} from "./design-contract.mjs";

function createValidContract() {
  const references = DESIGN_CONTRACT_REQUIRED_REFERENCES.map(
    (relativePath) => `- [Source](${relativePath})`,
  ).join("\n");
  const sections = DESIGN_CONTRACT_REQUIRED_SECTIONS.map(
    (heading, index) => `## ${heading}\n\nContract section ${index + 1}.`,
  ).join("\n\n");

  return `# Design Contract\n\n${references}\n\n${sections}\n`;
}

describe("design contract quality", () => {
  it("accepts the required sections, source links, and semantic color guidance", () => {
    expect(
      validateDesignContract({
        content: createValidContract(),
        pathExists: () => true,
      }),
    ).toEqual([]);
  });

  it("reports a missing required section", () => {
    const content = createValidContract().replace(
      "## Data Visualization\n\nContract section 8.",
      "",
    );

    expect(validateDesignContract({ content }).join("\n")).toContain(
      "missing the `## Data Visualization` section",
    );
  });

  it("rejects raw color literals", () => {
    const content = `${createValidContract()}\nUse #abcdef for the focus ring.\n`;

    expect(validateDesignContract({ content }).join("\n")).toContain(
      "contains raw color literals (#abcdef)",
    );
  });

  it("reports missing and broken implementation references", () => {
    const missingReference = DESIGN_CONTRACT_REQUIRED_REFERENCES[0];
    const content = createValidContract().replace(
      `- [Source](${missingReference})`,
      "- Source is described without a link.",
    );
    const issues = validateDesignContract({
      content,
      pathExists: (relativePath) => relativePath !== "Doc/testing/README.md",
    }).join("\n");

    expect(issues).toContain(`must link to the implementation source \`${missingReference}\``);
    expect(issues).toContain(
      "references missing local path `Doc/testing/README.md`",
    );
  });
});

