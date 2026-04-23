import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  buildInteractionAuditReviewExpectedShape,
  INTERACTION_AUDIT_REVIEW_REQUEST_FULFILLED_STATUS,
  INTERACTION_AUDIT_REVIEW_REQUEST_PENDING_STATUS,
  INTERACTION_AUDIT_REVIEW_REQUEST_SUPERSEDED_STATUS,
} from "./interaction-audit-review-request.mjs";
import { writeInteractionAuditReviewRequestIndex } from "./interaction-audit-review-request-index.mjs";

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

describe("interaction audit review request index helpers", () => {
  it("builds generated markdown and json catalogs for pending plus fulfilled requests", async () => {
    const projectRoot = await mkdtemp(
      path.join(tmpdir(), "interaction-audit-request-index-"),
    );
    tempDirs.push(projectRoot);

    const requestRoot = path.join(
      projectRoot,
      "Doc",
      "testing",
      "operator_review_requests",
    );
    const templateDir = path.join(
      projectRoot,
      "fixtures",
      "interaction-audit",
    );
    const pendingRequestDir = path.join(
      requestRoot,
      "2026-04-23-first-real-operator-review-request",
    );
    const driftedRequestDir = path.join(
      requestRoot,
      "2026-04-23-drifted-operator-review-request",
    );
    const fulfilledRequestDir = path.join(
      requestRoot,
      "2026-04-24-first-real-operator-review-request",
    );
    const supersededRequestDir = path.join(
      requestRoot,
      "2026-04-24-superseded-operator-review-request",
    );
    const indexMarkdownPath = path.join(
      projectRoot,
      "Doc",
      "testing",
      "Interaction_Audit_Review_Requests.md",
    );
    const indexJsonPath = path.join(requestRoot, "index.json");
    const alignedTemplate = {
      surfaces: [
        {
          id: "dashboard-360",
          manualChecks: [{ label: "Confirm focus visibility." }],
        },
      ],
    };
    const driftedTemplate = {
      surfaces: [
        {
          id: "dashboard-360",
          manualChecks: [{ label: "Confirm refreshed focus visibility." }],
        },
      ],
    };

    await mkdir(templateDir, { recursive: true });
    await mkdir(pendingRequestDir, { recursive: true });
    await mkdir(driftedRequestDir, { recursive: true });
    await mkdir(fulfilledRequestDir, { recursive: true });
    await mkdir(supersededRequestDir, { recursive: true });
    await writeFile(
      path.join(templateDir, "operator-review-request-template.fixture.json"),
      JSON.stringify(alignedTemplate, null, 2),
      "utf8",
    );
    await writeFile(
      path.join(templateDir, "operator-review-request-drifted.fixture.json"),
      JSON.stringify(driftedTemplate, null, 2),
      "utf8",
    );
    await writeFile(path.join(pendingRequestDir, "README.md"), "# pending\n", "utf8");
    await writeFile(path.join(driftedRequestDir, "README.md"), "# drifted\n", "utf8");
    await writeFile(
      path.join(fulfilledRequestDir, "README.md"),
      "# fulfilled\n",
      "utf8",
    );
    await writeFile(
      path.join(supersededRequestDir, "README.md"),
      "# superseded\n",
      "utf8",
    );
    await writeFile(
      path.join(pendingRequestDir, "review-request.json"),
      JSON.stringify(
        {
          requestId: "2026-04-23-first-real-operator-review-request",
          createdAt: "2026-04-23T10:00:00.000Z",
          requestRevisionSha256: "pending-request-revision",
          status: INTERACTION_AUDIT_REVIEW_REQUEST_PENDING_STATUS,
          sourceTemplate:
            "fixtures/interaction-audit/operator-review-request-template.fixture.json",
          sourceEvidencePack:
            "tmp/phase69-interaction-audit-evidence-pack/phase69-results.json",
          expectedShape: buildInteractionAuditReviewExpectedShape(alignedTemplate),
          artifacts: {
            evidencePack: "interaction-audit-evidence-pack.json",
          },
          evidenceSnapshot: {
            path: "interaction-audit-evidence-pack.json",
            sha256: "pending123",
            sizeBytes: 512,
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      path.join(driftedRequestDir, "review-request.json"),
      JSON.stringify(
        {
          requestId: "2026-04-23-drifted-operator-review-request",
          createdAt: "2026-04-23T11:00:00.000Z",
          requestRevisionSha256: "drifted-request-revision",
          status: INTERACTION_AUDIT_REVIEW_REQUEST_PENDING_STATUS,
          sourceTemplate:
            "fixtures/interaction-audit/operator-review-request-drifted.fixture.json",
          sourceEvidencePack:
            "tmp/phase69-interaction-audit-evidence-pack/phase69-results.json",
          expectedShape: buildInteractionAuditReviewExpectedShape(alignedTemplate),
          artifacts: {
            evidencePack: "interaction-audit-evidence-pack.json",
          },
          evidenceSnapshot: {
            path: "interaction-audit-evidence-pack.json",
            sha256: "drifted123",
            sizeBytes: 513,
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      path.join(fulfilledRequestDir, "review-request.json"),
      JSON.stringify(
        {
          requestId: "2026-04-24-first-real-operator-review-request",
          createdAt: "2026-04-24T10:00:00.000Z",
          requestRevisionSha256: "fulfilled-request-revision",
          status: INTERACTION_AUDIT_REVIEW_REQUEST_FULFILLED_STATUS,
          sourceTemplate:
            "fixtures/interaction-audit/operator-review-request-template.fixture.json",
          sourceEvidencePack:
            "tmp/phase69-interaction-audit-evidence-pack/phase69-results.json",
          expectedShape: buildInteractionAuditReviewExpectedShape(alignedTemplate),
          artifacts: {
            evidencePack: "interaction-audit-evidence-pack.json",
          },
          evidenceSnapshot: {
            path: "interaction-audit-evidence-pack.json",
            sha256: "fulfilled123",
            sizeBytes: 514,
          },
          fulfillment: {
            fulfilledAt: "2026-04-24T11:00:00.000Z",
            sourceCompletedSignoffExport: "tmp/operator-signoff-export.json",
            archiveId: "2026-04-24-real-compact-pass",
            archiveReadmePath:
              "Doc/testing/operator_reviews/2026-04-24-real-compact-pass/README.md",
            archiveManifestPath:
              "Doc/testing/operator_reviews/2026-04-24-real-compact-pass/review-archive.json",
            completedReviewSession: {
              reviewerName: "Operator Example",
              sessionLabel: "real compact pass",
              reviewedAt: "2026-04-24T10:45:00.000Z",
            },
            completedRequestContext: {
              requestId: "2026-04-24-first-real-operator-review-request",
              requestCreatedAt: "2026-04-24T10:00:00.000Z",
              requestRevisionSha256: "fulfilled-request-revision",
            },
            completedEvidenceContext: {
              source: "request_snapshot",
              sourceLabel: "Request evidence snapshot",
              selectedPath:
                "Doc/testing/operator_review_requests/2026-04-24-first-real-operator-review-request/interaction-audit-evidence-pack.json",
              evidenceItemCount: 7,
              integrityOk: true,
              integrityState: "verified",
              expectedSha256: "fulfilled-evidence-digest",
              actualSha256: "fulfilled-evidence-digest",
              expectedSizeBytes: 5837,
              actualSizeBytes: 5837,
            },
            completedSignoffExportDigest: {
              sha256: "fulfilled-export-digest",
              sizeBytes: 2048,
            },
            summary: {
              readyForSignoff: false,
              reviewedSurfaceCount: 4,
              totalSurfaceCount: 5,
              followUpSurfaceCount: 1,
              notReviewedSurfaceCount: 1,
              pendingManualCheckCount: 2,
              totalManualCheckCount: 11,
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      path.join(supersededRequestDir, "review-request.json"),
      JSON.stringify(
        {
          requestId: "2026-04-24-superseded-operator-review-request",
          createdAt: "2026-04-24T09:00:00.000Z",
          requestRevisionSha256: "superseded-request-revision",
          status: INTERACTION_AUDIT_REVIEW_REQUEST_SUPERSEDED_STATUS,
          sourceTemplate:
            "fixtures/interaction-audit/operator-review-request-template.fixture.json",
          sourceEvidencePack:
            "tmp/phase69-interaction-audit-evidence-pack/phase69-results.json",
          expectedShape: buildInteractionAuditReviewExpectedShape(alignedTemplate),
          artifacts: {
            evidencePack: "interaction-audit-evidence-pack.json",
          },
          evidenceSnapshot: {
            path: "interaction-audit-evidence-pack.json",
            sha256: "superseded123",
            sizeBytes: 515,
          },
          supersededBy: {
            supersededAt: "2026-04-24T12:00:00.000Z",
            reason: "template_drift_regenerated_request",
            replacementRequestId: "2026-04-24-refreshed-operator-review-request",
            replacementRequestReadmePath:
              "Doc/testing/operator_review_requests/2026-04-24-refreshed-operator-review-request/README.md",
            replacementRequestManifestPath:
              "Doc/testing/operator_review_requests/2026-04-24-refreshed-operator-review-request/review-request.json",
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    const result = await writeInteractionAuditReviewRequestIndex({
      projectRoot,
      requestRoot,
      generatedAt: "2026-04-24T12:00:00.000Z",
      indexMarkdownPath,
      indexJsonPath,
    });
    const indexMarkdown = await readFile(indexMarkdownPath, "utf8");
    const indexJson = JSON.parse(await readFile(indexJsonPath, "utf8"));

    expect(result.recordCount).toBe(4);
    expect(result.pendingRequestCount).toBe(2);
    expect(result.fulfilledRequestCount).toBe(1);
    expect(indexMarkdown).toContain("## Pending Requests");
    expect(indexMarkdown).toContain("## Fulfilled Requests");
    expect(indexMarkdown).toContain("## Other Request States");
    expect(indexMarkdown).toContain(
      "2026-04-23-first-real-operator-review-request",
    );
    expect(indexMarkdown).toContain(
      "2026-04-23-drifted-operator-review-request",
    );
    expect(indexMarkdown).toContain(
      "2026-04-24-first-real-operator-review-request",
    );
    expect(indexMarkdown).toContain(
      "2026-04-24-superseded-operator-review-request",
    );
    expect(indexMarkdown).toContain("2026-04-24-real-compact-pass");
    expect(indexMarkdown).toContain(
      "completion request revision: `sha256:fulfilled-request-revision`",
    );
    expect(indexMarkdown).toContain(
      "completion evidence source: `Request evidence snapshot`",
    );
    expect(indexMarkdown).toContain("completion evidence integrity: `verified`");
    expect(indexMarkdown).toContain(
      "completed export digest: `sha256:fulfilled-export-digest (2048 bytes)`",
    );
    expect(indexMarkdown).toContain("2026-04-24-refreshed-operator-review-request");
    expect(indexMarkdown).toContain("source evidence seed");
    expect(indexMarkdown).toContain("request evidence snapshot");
    expect(indexMarkdown).toContain("request evidence snapshot integrity");
    expect(indexMarkdown).toContain("request revision");
    expect(indexMarkdown).toContain(
      "Doc/testing/operator_review_requests/2026-04-23-first-real-operator-review-request/interaction-audit-evidence-pack.json",
    );
    expect(indexMarkdown).toContain("aligned with current source template");
    expect(indexMarkdown).toContain("shape mismatch with current source template");
    expect(indexJson.pendingRequestCount).toBe(2);
    expect(indexJson.fulfilledRequestCount).toBe(1);
    expect(indexJson.records[0].requestId).toBe(
      "2026-04-24-first-real-operator-review-request",
    );
    expect(
      indexJson.records.find(
        (record) =>
          record.requestId === "2026-04-23-drifted-operator-review-request",
      ).templateDrift.state,
    ).toBe("shape_mismatch");
    expect(
      indexJson.records.find(
        (record) =>
          record.requestId === "2026-04-24-superseded-operator-review-request",
      ).supersededBy.replacementRequestId,
    ).toBe("2026-04-24-refreshed-operator-review-request");
    expect(
      indexJson.records.find(
        (record) =>
          record.requestId === "2026-04-23-first-real-operator-review-request",
      ).evidenceSnapshotPath,
    ).toBe(
      "Doc/testing/operator_review_requests/2026-04-23-first-real-operator-review-request/interaction-audit-evidence-pack.json",
    );
    expect(
      indexJson.records.find(
        (record) =>
          record.requestId === "2026-04-24-first-real-operator-review-request",
      ).evidenceSnapshotSha256,
    ).toBe("fulfilled123");
    expect(
      indexJson.records.find(
        (record) =>
          record.requestId === "2026-04-24-first-real-operator-review-request",
      ).fulfillment.completedEvidenceContext.source,
    ).toBe("request_snapshot");
    expect(
      indexJson.records.find(
        (record) =>
          record.requestId === "2026-04-24-first-real-operator-review-request",
      ).fulfillment.completedSignoffExportDigest.sha256,
    ).toBe("fulfilled-export-digest");
    expect(
      indexJson.records.find(
        (record) =>
          record.requestId === "2026-04-23-first-real-operator-review-request",
      ).requestRevisionSha256,
    ).toBe("pending-request-revision");
  });
});
