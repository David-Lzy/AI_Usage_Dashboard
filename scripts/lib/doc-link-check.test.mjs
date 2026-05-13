import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  extractMarkdownLinkTargets,
  isIgnoredMarkdownLinkTarget,
  runDocLinkCheck,
} from "./doc-link-check.mjs";

async function writeFixture(root, relativePath, text) {
  await mkdir(path.dirname(path.join(root, relativePath)), { recursive: true });
  await writeFile(path.join(root, relativePath), text);
}

describe("doc link check helpers", () => {
  it("extracts inline and reference style markdown links", () => {
    expect(
      extractMarkdownLinkTargets({
        relativePath: "README.md",
        text: [
          "[Docs](./Doc/README.md)",
          "",
          "[ref]: ./Doc/TODOs/00_Phase_Index.md",
          "",
          "`[ignored](./missing.md)`",
          "",
          "```md",
          "[ignored](./also-missing.md)",
          "```",
        ].join("\n"),
      }).map((link) => link.rawTarget),
    ).toEqual(["./Doc/README.md", "./Doc/TODOs/00_Phase_Index.md"]);
  });

  it("ignores external links and fragment-only links", () => {
    expect(isIgnoredMarkdownLinkTarget("https://example.com")).toBe(true);
    expect(isIgnoredMarkdownLinkTarget("mailto:test@example.com")).toBe(true);
    expect(isIgnoredMarkdownLinkTarget("chrome://extensions")).toBe(true);
    expect(isIgnoredMarkdownLinkTarget("data:image/png;base64,abc")).toBe(true);
    expect(isIgnoredMarkdownLinkTarget("#local-anchor")).toBe(true);
    expect(isIgnoredMarkdownLinkTarget("./Doc/README.md#start")).toBe(false);
  });

  it("passes valid relative links and archive bucket links", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "doc-link-check-"));
    await writeFixture(root, "README.md", "[Docs](./Doc/README.md)\n");
    await writeFixture(
      root,
      "Doc/README.md",
      [
        "[Phase](./TODOs/00_Phase_Index.md)",
        "[Archive](./TODOs/Archive/by-phase/300-399/388_Phase_Current_Truth_Drift_Closeout.md#goal)",
      ].join("\n"),
    );
    await writeFixture(
      root,
      "Doc/TODOs/00_Phase_Index.md",
      "[README](../README.md?view=plain)\n",
    );
    await writeFixture(
      root,
      "Doc/TODOs/Archive/by-phase/300-399/388_Phase_Current_Truth_Drift_Closeout.md",
      "# Phase 388\n",
    );

    await expect(
      runDocLinkCheck(root, {
        relativeMarkdownFiles: [
          "README.md",
          "Doc/README.md",
          "Doc/TODOs/00_Phase_Index.md",
        ],
      }),
    ).resolves.toMatchObject({
      issues: [],
      checkedFileCount: 3,
      skippedFileCount: 0,
    });
  });

  it("skips convention-only closed evidence files by default", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "doc-link-check-"));
    await writeFixture(root, "README.md", "[Docs](./README.md)\n");
    await writeFixture(
      root,
      "Doc/TODOs/Archive/by-phase/300-399/388_Phase_Closed.md",
      "[Old broken link](../../../Development_Guardrails.md)\n",
    );

    await expect(
      runDocLinkCheck(root, {
        relativeMarkdownFiles: [
          "README.md",
          "Doc/TODOs/Archive/by-phase/300-399/388_Phase_Closed.md",
        ],
      }),
    ).resolves.toMatchObject({
      issues: [],
      checkedFileCount: 1,
      skippedFileCount: 1,
    });
  });

  it("reports broken local markdown links", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "doc-link-check-"));
    await writeFixture(root, "README.md", "[Missing](./Doc/Missing.md)\n");

    const result = await runDocLinkCheck(root, {
      relativeMarkdownFiles: ["README.md"],
    });

    expect(result.issues).toEqual([
      "README.md:1 link target `./Doc/Missing.md` resolved to missing path `Doc/Missing.md`.",
    ]);
  });
});
