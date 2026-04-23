import { describe, expect, it } from "vitest";

import { buildInteractionAuditReviewArchiveRecord } from "./interaction-audit-review-archive.mjs";

const SIGNOFF_EXPORT = {
  metadata: {
    reviewerName: "Operator Example",
    sessionLabel: "request-context archive pass",
    reviewedAt: "2026-04-24T11:30:00.000Z",
  },
  requestContext: {
    requestId: "2026-04-24-traceable-operator-review-request",
    requestCreatedAt: "2026-04-24T11:00:00.000Z",
    requestRevisionSha256:
      "4e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e",
  },
  surfaces: [
    {
      id: "dashboard-360",
      title: "Dashboard",
      description: "Compact dashboard frame.",
      signoffStatus: "pass",
      operatorNotes: "Looks stable.",
      manualChecks: [
        { label: "Confirm focus visibility.", completed: true },
        { label: "Confirm density.", completed: false },
      ],
    },
  ],
};

const EVIDENCE_REPORT = {
  evidenceItems: [
    {
      surfaceTitle: "Dashboard",
      label: "Focus first provider action",
      expectation: "Focus the first dashboard action.",
      screenshot: "tmp/phase69/01-dashboard.png",
      auditStatus: {
        message: "Focused the first provider action button.",
      },
    },
  ],
};

describe("interaction audit review archive helpers", () => {
  it("preserves request context in archive manifests and README output", () => {
    const record = buildInteractionAuditReviewArchiveRecord({
      signoffExport: SIGNOFF_EXPORT,
      evidenceReport: EVIDENCE_REPORT,
      sourceSignoffExport: "tmp/operator-signoff-export.json",
      sourceEvidencePack: "tmp/phase69-results.json",
      evidenceContext: {
        source: "request_snapshot",
        sourceLabel: "Request evidence snapshot",
        selectedPath:
          "Doc/testing/operator_review_requests/2026-04-24-traceable-operator-review-request/interaction-audit-evidence-pack.json",
        requestPath: "tmp/phase69-results.json",
        snapshotPath:
          "Doc/testing/operator_review_requests/2026-04-24-traceable-operator-review-request/interaction-audit-evidence-pack.json",
        evidenceItemCount: 1,
        integrityOk: true,
        integrityState: "verified",
        expectedSha256: "def456",
        actualSha256: "def456",
        expectedSizeBytes: 5837,
        actualSizeBytes: 5837,
      },
      sourceRequest: {
        requestId: "2026-04-24-traceable-operator-review-request",
        requestReadmePath:
          "Doc/testing/operator_review_requests/2026-04-24-traceable-operator-review-request/README.md",
        requestManifestPath:
          "Doc/testing/operator_review_requests/2026-04-24-traceable-operator-review-request/review-request.json",
      },
      archiveId: "2026-04-24-request-context-archive-pass",
      archivedAt: "2026-04-24T12:00:00.000Z",
    });

    expect(record.manifest.requestContext).toEqual({
      requestId: "2026-04-24-traceable-operator-review-request",
      requestCreatedAt: "2026-04-24T11:00:00.000Z",
      requestRevisionSha256:
        "4e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e",
    });
    expect(record.manifest.evidenceContext).toEqual({
      source: "request_snapshot",
      sourceLabel: "Request evidence snapshot",
      selectedPath:
        "Doc/testing/operator_review_requests/2026-04-24-traceable-operator-review-request/interaction-audit-evidence-pack.json",
      requestPath: "tmp/phase69-results.json",
      snapshotPath:
        "Doc/testing/operator_review_requests/2026-04-24-traceable-operator-review-request/interaction-audit-evidence-pack.json",
      evidenceItemCount: 1,
      integrityOk: true,
      integrityState: "verified",
      expectedSha256: "def456",
      actualSha256: "def456",
      expectedSizeBytes: 5837,
      actualSizeBytes: 5837,
    });
    expect(record.readme).toContain(
      "- Request binding: 2026-04-24-traceable-operator-review-request @ 2026-04-24T11:00:00.000Z",
    );
    expect(record.readme).toContain(
      "- Request revision: sha256:4e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e",
    );
    expect(record.readme).toContain("- Evidence source: Request evidence snapshot");
    expect(record.readme).toContain("- Evidence items: 1");
    expect(record.readme).toContain(
      "- Evidence integrity: verified sha256:def456 (5837 bytes)",
    );
  });
});
