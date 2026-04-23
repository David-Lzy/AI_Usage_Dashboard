import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { writeInteractionAuditReviewArchiveIndex } from "./interaction-audit-review-archive-index.mjs";

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

describe("interaction audit review archive index helpers", () => {
  it("preserves linked source request metadata in generated archive indexes", async () => {
    const projectRoot = await mkdtemp(
      path.join(tmpdir(), "interaction-audit-archive-index-"),
    );
    tempDirs.push(projectRoot);

    const archiveRoot = path.join(projectRoot, "Doc", "testing", "operator_reviews");
    const archiveDir = path.join(archiveRoot, "2026-04-24-traceable-compact-pass");
    const indexMarkdownPath = path.join(
      projectRoot,
      "Doc",
      "testing",
      "Interaction_Audit_Review_Archive.md",
    );
    const indexJsonPath = path.join(archiveRoot, "index.json");

    await mkdir(archiveDir, { recursive: true });
    await writeFile(path.join(archiveDir, "README.md"), "# archive\n", "utf8");
    await writeFile(
      path.join(archiveDir, "review-archive.json"),
      JSON.stringify(
        {
          archiveId: "2026-04-24-traceable-compact-pass",
          archivedAt: "2026-04-24T12:00:00.000Z",
          seeded: false,
          sourceSignoffExport: "tmp/operator-signoff-export.json",
          sourceEvidencePack:
            "tmp/phase69-interaction-audit-evidence-pack/phase69-results.json",
          sourceRequest: {
            requestId: "2026-04-24-traceable-operator-review-request",
            requestReadmePath:
              "Doc/testing/operator_review_requests/2026-04-24-traceable-operator-review-request/README.md",
            requestManifestPath:
              "Doc/testing/operator_review_requests/2026-04-24-traceable-operator-review-request/review-request.json",
          },
          requestContext: {
            requestId: "2026-04-24-traceable-operator-review-request",
            requestCreatedAt: "2026-04-24T11:00:00.000Z",
            requestRevisionSha256:
              "4e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e",
          },
          evidenceContext: {
            source: "request_snapshot",
            sourceLabel: "Request evidence snapshot",
            selectedPath:
              "Doc/testing/operator_review_requests/2026-04-24-traceable-operator-review-request/interaction-audit-evidence-pack.json",
            evidenceItemCount: 7,
            integrityOk: true,
            integrityState: "verified",
            expectedSha256: "feedbeef",
            actualSha256: "feedbeef",
            expectedSizeBytes: 5837,
            actualSizeBytes: 5837,
          },
          reviewSession: {
            reviewerName: "Operator Example",
            sessionLabel: "traceable compact pass",
            reviewedAt: "2026-04-24T11:30:00.000Z",
          },
          summary: {
            readyForSignoff: false,
            totalSurfaceCount: 5,
            reviewedSurfaceCount: 3,
            passSurfaceCount: 2,
            followUpSurfaceCount: 1,
            notReviewedSurfaceCount: 2,
            completedManualCheckCount: 6,
            totalManualCheckCount: 11,
            pendingManualCheckCount: 5,
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    const result = await writeInteractionAuditReviewArchiveIndex({
      projectRoot,
      archiveRoot,
      generatedAt: "2026-04-24T12:05:00.000Z",
      indexMarkdownPath,
      indexJsonPath,
    });
    const indexMarkdown = await readFile(indexMarkdownPath, "utf8");
    const indexJson = JSON.parse(await readFile(indexJsonPath, "utf8"));

    expect(result.recordCount).toBe(1);
    expect(indexMarkdown).toContain(
      "source request: [2026-04-24-traceable-operator-review-request]",
    );
    expect(indexMarkdown).toContain(
      "request binding: `2026-04-24-traceable-operator-review-request @ 2026-04-24T11:00:00.000Z`",
    );
    expect(indexMarkdown).toContain(
      "request revision: `sha256:4e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e`",
    );
    expect(indexMarkdown).toContain(
      "evidence source: `Request evidence snapshot`",
    );
    expect(indexMarkdown).toContain("evidence integrity: `verified`");
    expect(indexJson.records[0].sourceRequest.requestId).toBe(
      "2026-04-24-traceable-operator-review-request",
    );
    expect(indexJson.records[0].requestContext.requestRevisionSha256).toBe(
      "4e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e",
    );
    expect(indexJson.records[0].evidenceContext.integrityState).toBe("verified");
  });
});
