import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { writeThemeRecoveryReviewArchiveIndex } from "./theme-recovery-review-archive-index.mjs";

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

describe("theme recovery review archive index helpers", () => {
  it("labels generated archive indexes with their document class", async () => {
    const projectRoot = await mkdtemp(
      path.join(tmpdir(), "theme-recovery-archive-index-"),
    );
    tempDirs.push(projectRoot);

    const archiveRoot = path.join(
      projectRoot,
      "Doc",
      "testing",
      "theme_recovery_reviews",
    );
    const archiveDir = path.join(
      archiveRoot,
      "2026-04-23-theme-recovery-seeded-archive-baseline",
    );
    const indexMarkdownPath = path.join(
      projectRoot,
      "Doc",
      "testing",
      "Theme_Recovery_Review_Archive.md",
    );
    const indexJsonPath = path.join(archiveRoot, "index.json");

    await mkdir(archiveDir, { recursive: true });
    await writeFile(path.join(archiveDir, "README.md"), "# archive\n", "utf8");
    await writeFile(
      path.join(archiveDir, "review-archive.json"),
      JSON.stringify(
        {
          archiveId: "2026-04-23-theme-recovery-seeded-archive-baseline",
          archivedAt: "2026-04-23T12:00:00.000Z",
          seeded: true,
          sourceReviewExport:
            "tmp/phase113-theme-recovery-archive-workflow-review/downloads/theme-recovery-export-2026-04-23-light-needs-access-custom.json",
          summary: {
            overallLabel: "Needs access",
            scopeIsolationLabel: "Cursor + Codex isolated",
            popupSnapshotLabel: "Mixed state",
            themeMode: "light",
            themePreset: "custom",
            themeCustomSeedHex: "#4F46E5",
            recoveredProviderCount: 0,
            targetProviderCount: 2,
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    await writeThemeRecoveryReviewArchiveIndex({
      projectRoot,
      archiveRoot,
      generatedAt: "2026-04-24T09:15:00.000Z",
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
