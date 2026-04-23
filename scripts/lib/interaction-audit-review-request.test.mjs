import { describe, expect, it } from "vitest";

import {
  buildInteractionAuditReviewRequestRecord,
  buildInteractionAuditReviewExpectedShape,
  buildInteractionAuditReviewRequestBoundTemplate,
  buildInteractionAuditReviewRequestRevisionSha256,
  INTERACTION_AUDIT_REVIEW_REQUEST_FULFILLED_STATUS,
  buildInteractionAuditReviewShapeMismatchError,
  buildInteractionAuditReviewTemplateDriftError,
  normalizeInteractionAuditReviewExpectedShape,
} from "./interaction-audit-review-request.mjs";

const TEMPLATE = {
  surfaces: [
    {
      id: "dashboard-360",
      manualChecks: [{ label: "Confirm focus visibility." }, { label: "Confirm density." }],
    },
    {
      id: "settings-420",
      manualChecks: [{ label: "Confirm diagnostics readability." }],
    },
  ],
};

describe("interaction audit review request helpers", () => {
  it("builds and normalizes expected export shape metadata", () => {
    const expectedShape = buildInteractionAuditReviewExpectedShape(TEMPLATE);

    expect(expectedShape).toEqual({
      surfaceCount: 2,
      totalManualCheckCount: 3,
      surfaces: [
        {
          id: "dashboard-360",
          manualCheckLabels: ["Confirm focus visibility.", "Confirm density."],
        },
        {
          id: "settings-420",
          manualCheckLabels: ["Confirm diagnostics readability."],
        },
      ],
    });
    expect(normalizeInteractionAuditReviewExpectedShape(expectedShape)).toEqual(
      expectedShape,
    );
  });

  it("detects mismatched exported workspace shape", () => {
    const expectedShape = buildInteractionAuditReviewExpectedShape(TEMPLATE);
    const mismatchError = buildInteractionAuditReviewShapeMismatchError({
      expectedShape,
      signoffExport: {
        surfaces: [
          {
            id: "dashboard-360",
            manualChecks: [{ label: "Confirm focus visibility." }],
          },
          {
            id: "popup-360",
            manualChecks: [{ label: "Confirm popup spacing." }],
          },
        ],
      },
    });

    expect(mismatchError).toContain("manual-check count");
  });

  it("accepts matching exported workspace shape", () => {
    const expectedShape = buildInteractionAuditReviewExpectedShape(TEMPLATE);
    const mismatchError = buildInteractionAuditReviewShapeMismatchError({
      expectedShape,
      signoffExport: {
        surfaces: [
          {
            id: "dashboard-360",
            manualChecks: [
              { label: "Confirm focus visibility." },
              { label: "Confirm density." },
            ],
          },
          {
            id: "settings-420",
            manualChecks: [{ label: "Confirm diagnostics readability." }],
          },
        ],
      },
    });

    expect(mismatchError).toBe("");
  });

  it("builds a stable request revision digest and binds it into the request template", () => {
    const requestRevisionSha256 = buildInteractionAuditReviewRequestRevisionSha256({
      requestId: "2026-04-24-request",
      createdAt: "2026-04-24T12:00:00.000Z",
      signoffTemplate: TEMPLATE,
      sourceTemplate: "fixtures/interaction-audit/operator-review-request-template.fixture.json",
      sourceEvidencePack: "tmp/request-evidence.json",
      evidenceSnapshot: {
        path: "interaction-audit-evidence-pack.json",
        sha256: "snapshot-digest",
        sizeBytes: 128,
      },
    });

    expect(requestRevisionSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(
      buildInteractionAuditReviewRequestBoundTemplate({
        signoffTemplate: TEMPLATE,
        requestId: "2026-04-24-request",
        createdAt: "2026-04-24T12:00:00.000Z",
        requestRevisionSha256,
      }).requestContext,
    ).toEqual({
      requestId: "2026-04-24-request",
      requestCreatedAt: "2026-04-24T12:00:00.000Z",
      requestRevisionSha256,
    });
  });

  it("detects current source-template drift against a pending request shape", () => {
    const expectedShape = buildInteractionAuditReviewExpectedShape(TEMPLATE);
    const driftError = buildInteractionAuditReviewTemplateDriftError({
      expectedShape,
      currentTemplate: {
        surfaces: [
          {
            id: "dashboard-360",
            manualChecks: [
              { label: "Confirm focus visibility." },
              { label: "Confirm density." },
            ],
          },
          {
            id: "settings-420",
            manualChecks: [{ label: "Confirm refreshed diagnostics readability." }],
          },
        ],
      },
    });

    expect(driftError).toContain("Current source template");
    expect(driftError).toContain("pending request template");
  });

  it("preserves fulfillment receipt metadata in fulfilled request records", () => {
    const record = buildInteractionAuditReviewRequestRecord({
      requestId: "2026-04-24-request",
      createdAt: "2026-04-24T12:00:00.000Z",
      signoffTemplate: TEMPLATE,
      sourceTemplate:
        "fixtures/interaction-audit/operator-review-request-template.fixture.json",
      sourceEvidencePack: "tmp/request-evidence.json",
      evidenceSnapshot: {
        path: "interaction-audit-evidence-pack.json",
        sha256: "snapshot-digest",
        sizeBytes: 128,
      },
      status: INTERACTION_AUDIT_REVIEW_REQUEST_FULFILLED_STATUS,
      fulfillment: {
        fulfilledAt: "2026-04-24T13:00:00.000Z",
        sourceCompletedSignoffExport: "tmp/operator-signoff-export.json",
        archiveId: "2026-04-24-request-pass",
        archiveReadmePath:
          "Doc/testing/operator_reviews/2026-04-24-request-pass/README.md",
        archiveManifestPath:
          "Doc/testing/operator_reviews/2026-04-24-request-pass/review-archive.json",
        completedReviewSession: {
          reviewerName: "Operator Example",
          sessionLabel: "compact pass",
          reviewedAt: "2026-04-24T12:45:00.000Z",
        },
        completedRequestContext: {
          requestId: "2026-04-24-request",
          requestCreatedAt: "2026-04-24T12:00:00.000Z",
          requestRevisionSha256: "revision-123",
        },
        completedEvidenceContext: {
          source: "request_snapshot",
          sourceLabel: "Request evidence snapshot",
          selectedPath:
            "Doc/testing/operator_review_requests/2026-04-24-request/interaction-audit-evidence-pack.json",
          evidenceItemCount: 7,
          integrityOk: true,
          integrityState: "verified",
          expectedSha256: "evidence-123",
          actualSha256: "evidence-123",
          expectedSizeBytes: 5837,
          actualSizeBytes: 5837,
        },
        completedSignoffExportDigest: {
          sha256: "export-123",
          sizeBytes: 2048,
        },
        summary: {
          readyForSignoff: false,
          reviewedSurfaceCount: 1,
          totalSurfaceCount: 2,
          followUpSurfaceCount: 1,
          notReviewedSurfaceCount: 0,
          pendingManualCheckCount: 1,
          totalManualCheckCount: 3,
        },
      },
    });

    expect(record.manifest.fulfillment.completedRequestContext.requestRevisionSha256).toBe(
      "revision-123",
    );
    expect(record.manifest.fulfillment.completedEvidenceContext.source).toBe(
      "request_snapshot",
    );
    expect(record.manifest.fulfillment.completedSignoffExportDigest.sha256).toBe(
      "export-123",
    );
    expect(record.readme).toContain("- Completed reviewer: Operator Example");
    expect(record.readme).toContain(
      "- Completion request revision: `sha256:revision-123`",
    );
    expect(record.readme).toContain(
      "- Completion evidence source: Request evidence snapshot",
    );
    expect(record.readme).toContain(
      "- Completion evidence integrity: `verified sha256:evidence-123 (5837 bytes)`",
    );
    expect(record.readme).toContain(
      "- Completed signoff export digest: `sha256:export-123 (2048 bytes)`",
    );
  });
});
