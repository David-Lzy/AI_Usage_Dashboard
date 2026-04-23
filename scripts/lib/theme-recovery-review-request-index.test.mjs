import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { writeThemeRecoveryReviewRequestIndex } from "./theme-recovery-review-request-index.mjs";

const tempDirs = [];

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map(async (directory) => {
      await import("node:fs/promises").then(({ rm }) =>
        rm(directory, { recursive: true, force: true }),
      );
    }),
  );
});

describe("theme recovery review request index helpers", () => {
  it("labels generated request indexes with their document class", async () => {
    const projectRoot = await mkdtemp(
      path.join(tmpdir(), "theme-recovery-request-index-"),
    );
    tempDirs.push(projectRoot);

    const requestRoot = path.join(
      projectRoot,
      "Doc",
      "testing",
      "theme_recovery_review_requests",
    );
    const requestDir = path.join(
      requestRoot,
      "2026-04-23-first-real-theme-recovery-review-request",
    );
    const indexMarkdownPath = path.join(
      projectRoot,
      "Doc",
      "testing",
      "Theme_Recovery_Review_Requests.md",
    );
    const indexJsonPath = path.join(requestRoot, "index.json");

    await mkdir(requestDir, { recursive: true });
    await writeFile(path.join(requestDir, "README.md"), "# request\n", "utf8");
    await writeFile(
      path.join(requestDir, "review-request.json"),
      JSON.stringify(
        {
          requestId: "2026-04-23-first-real-theme-recovery-review-request",
          createdAt: "2026-04-23T10:00:00.000Z",
          status: "pending_operator_review",
          workspaceRoute:
            "http://127.0.0.1:4173/src/sidepanel/index.html#debug-theme-recovery-review",
          sourceTemplate:
            "Doc/testing/theme_recovery_review_requests/2026-04-23-first-real-theme-recovery-review-request/theme-recovery-review-template.json",
          sourceSeedArchiveReadme:
            "Doc/testing/theme_recovery_reviews/2026-04-23-theme-recovery-seeded-archive-baseline/README.md",
          seedReferenceSummary: {
            overallLabel: "Needs access",
            popupSnapshotLabel: "Mixed state",
            scopeIsolationLabel: "Cursor + Codex isolated",
            themeMode: "light",
            themePreset: "custom",
            themeCustomSeedHex: "#4F46E5",
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    await writeThemeRecoveryReviewRequestIndex({
      projectRoot,
      requestRoot,
      generatedAt: "2026-04-24T09:00:00.000Z",
      indexMarkdownPath,
      indexJsonPath,
    });

    const indexMarkdown = await readFile(indexMarkdownPath, "utf8");

    expect(indexMarkdown).toContain("Document class:");
    expect(indexMarkdown).toContain("- generated operational ledger");
    expect(indexMarkdown).toContain(
      "- taxonomy: [Documentation_Taxonomy.md](../Documentation_Taxonomy.md)",
    );
  });
});
