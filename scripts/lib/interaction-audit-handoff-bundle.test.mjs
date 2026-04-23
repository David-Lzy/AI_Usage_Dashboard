import { describe, expect, it } from "vitest";

import {
  buildInteractionAuditHandoffBundle,
  buildInteractionAuditHandoffBundleMarkdown,
  buildInteractionAuditHandoffSummaryFromExport,
  buildInteractionAuditHandoffSummaryMarkdown,
} from "./interaction-audit-handoff-bundle.mjs";

const SIGNOFF_EXPORT = {
  metadata: {
    reviewerName: "Codex",
    sessionLabel: "Compact QA Pass",
    reviewedAt: "2026-04-23T00:00:00.000Z",
  },
  requestContext: {
    requestId: "2026-04-23-first-real-operator-review-request",
    requestCreatedAt: "2026-04-22T23:40:08.207Z",
    requestRevisionSha256:
      "c9175c1e90b3442819b91bb6c9173cd506f860835c0e32f3b95dd1a3c8ea58e1",
  },
  summary: {
    reviewedSurfaceCount: 2,
    passSurfaceCount: 1,
    followUpSurfaceCount: 1,
    completedManualCheckCount: 2,
    totalManualCheckCount: 5,
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
    {
      id: "settings-420",
      title: "Settings",
      description: "Compact settings frame.",
      signoffStatus: "follow_up",
      operatorNotes: "Need one more compact-width pass.",
      manualChecks: [
        { label: "Confirm diagnostics readability.", completed: true },
        { label: "Confirm select emphasis.", completed: false },
        { label: "Confirm no overflow.", completed: false },
      ],
    },
    {
      id: "popup-360",
      title: "Toolbar Popup",
      description: "Compact popup frame.",
      signoffStatus: "not_reviewed",
      operatorNotes: "",
      manualChecks: [
        { label: "Confirm action spacing.", completed: false },
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
    {
      surfaceTitle: "Settings",
      label: "Open first diagnostics",
      expectation: "Open the first diagnostics disclosure.",
      screenshot: "tmp/phase69/02-settings.png",
      auditStatus: {
        message: "Opened the first source diagnostics disclosure.",
      },
    },
  ],
};

describe("interaction audit handoff bundle helpers", () => {
  it("builds unresolved-work summary data from an exported signoff payload", () => {
    expect(buildInteractionAuditHandoffSummaryFromExport(SIGNOFF_EXPORT)).toEqual({
      totalSurfaceCount: 3,
      reviewedSurfaceCount: 2,
      passSurfaceCount: 1,
      followUpSurfaceCount: 1,
      notReviewedSurfaceCount: 1,
      totalManualCheckCount: 6,
      completedManualCheckCount: 2,
      pendingManualCheckCount: 4,
      readyForSignoff: false,
      surfaces: [
        {
          id: "dashboard-360",
          title: "Dashboard",
          description: "Compact dashboard frame.",
          signoffStatus: "pass",
          operatorNotes: "Looks stable.",
          completedManualCheckCount: 1,
          totalManualCheckCount: 2,
          pendingManualChecks: ["Confirm density."],
          manualChecks: [
            { label: "Confirm focus visibility.", completed: true },
            { label: "Confirm density.", completed: false },
          ],
        },
        {
          id: "settings-420",
          title: "Settings",
          description: "Compact settings frame.",
          signoffStatus: "follow_up",
          operatorNotes: "Need one more compact-width pass.",
          completedManualCheckCount: 1,
          totalManualCheckCount: 3,
          pendingManualChecks: [
            "Confirm select emphasis.",
            "Confirm no overflow.",
          ],
          manualChecks: [
            { label: "Confirm diagnostics readability.", completed: true },
            { label: "Confirm select emphasis.", completed: false },
            { label: "Confirm no overflow.", completed: false },
          ],
        },
        {
          id: "popup-360",
          title: "Toolbar Popup",
          description: "Compact popup frame.",
          signoffStatus: "not_reviewed",
          operatorNotes: "",
          completedManualCheckCount: 0,
          totalManualCheckCount: 1,
          pendingManualChecks: ["Confirm action spacing."],
          manualChecks: [{ label: "Confirm action spacing.", completed: false }],
        },
      ],
      followUpSurfaces: [
        {
          id: "settings-420",
          title: "Settings",
          description: "Compact settings frame.",
          signoffStatus: "follow_up",
          operatorNotes: "Need one more compact-width pass.",
          completedManualCheckCount: 1,
          totalManualCheckCount: 3,
          pendingManualChecks: [
            "Confirm select emphasis.",
            "Confirm no overflow.",
          ],
          manualChecks: [
            { label: "Confirm diagnostics readability.", completed: true },
            { label: "Confirm select emphasis.", completed: false },
            { label: "Confirm no overflow.", completed: false },
          ],
        },
      ],
      notReviewedSurfaces: [
        {
          id: "popup-360",
          title: "Toolbar Popup",
          description: "Compact popup frame.",
          signoffStatus: "not_reviewed",
          operatorNotes: "",
          completedManualCheckCount: 0,
          totalManualCheckCount: 1,
          pendingManualChecks: ["Confirm action spacing."],
          manualChecks: [{ label: "Confirm action spacing.", completed: false }],
        },
      ],
      surfacesWithPendingChecks: [
        {
          id: "dashboard-360",
          title: "Dashboard",
          description: "Compact dashboard frame.",
          signoffStatus: "pass",
          operatorNotes: "Looks stable.",
          completedManualCheckCount: 1,
          totalManualCheckCount: 2,
          pendingManualChecks: ["Confirm density."],
          manualChecks: [
            { label: "Confirm focus visibility.", completed: true },
            { label: "Confirm density.", completed: false },
          ],
        },
        {
          id: "settings-420",
          title: "Settings",
          description: "Compact settings frame.",
          signoffStatus: "follow_up",
          operatorNotes: "Need one more compact-width pass.",
          completedManualCheckCount: 1,
          totalManualCheckCount: 3,
          pendingManualChecks: [
            "Confirm select emphasis.",
            "Confirm no overflow.",
          ],
          manualChecks: [
            { label: "Confirm diagnostics readability.", completed: true },
            { label: "Confirm select emphasis.", completed: false },
            { label: "Confirm no overflow.", completed: false },
          ],
        },
        {
          id: "popup-360",
          title: "Toolbar Popup",
          description: "Compact popup frame.",
          signoffStatus: "not_reviewed",
          operatorNotes: "",
          completedManualCheckCount: 0,
          totalManualCheckCount: 1,
          pendingManualChecks: ["Confirm action spacing."],
          manualChecks: [{ label: "Confirm action spacing.", completed: false }],
        },
      ],
    });
  });

  it("builds summary and bundle markdown linked to preset evidence", () => {
    const summary = buildInteractionAuditHandoffSummaryFromExport(SIGNOFF_EXPORT);
    const summaryMarkdown = buildInteractionAuditHandoffSummaryMarkdown(
      summary,
      SIGNOFF_EXPORT.requestContext,
    );

    expect(summaryMarkdown).toContain("Review session:");
    expect(summaryMarkdown).toContain("- Reviewer: not set");
    expect(summaryMarkdown).toContain(
      "- Request binding: 2026-04-23-first-real-operator-review-request @ 2026-04-22T23:40:08.207Z",
    );
    expect(summaryMarkdown).toContain(
      "- Request revision: sha256:c9175c1e90b3442819b91bb6c9173cd506f860835c0e32f3b95dd1a3c8ea58e1",
    );
    expect(summaryMarkdown).toContain("Ready for signoff: no");
    expect(summaryMarkdown).toContain("## Follow-up required");
    expect(summaryMarkdown).toContain("### Settings");
    expect(summaryMarkdown).toContain("## Not reviewed");
    expect(summaryMarkdown).toContain("- Toolbar Popup (1 pending checks)");

    const bundle = buildInteractionAuditHandoffBundle({
      signoffExport: SIGNOFF_EXPORT,
      evidenceReport: EVIDENCE_REPORT,
      sourceSignoffExport: "tmp/sample-signoff.json",
      sourceEvidencePack: "tmp/phase69-results.json",
      evidenceContext: {
        source: "request_snapshot",
        sourceLabel: "Request evidence snapshot",
        selectedPath: "Doc/testing/operator_review_requests/request/interaction-audit-evidence-pack.json",
        requestPath: "tmp/phase69-results.json",
        snapshotPath: "Doc/testing/operator_review_requests/request/interaction-audit-evidence-pack.json",
        evidenceItemCount: 2,
        integrityOk: true,
        integrityState: "verified",
        expectedSha256: "abc123",
        actualSha256: "abc123",
        expectedSizeBytes: 2048,
        actualSizeBytes: 2048,
      },
      generatedAt: "2026-04-23T00:00:00.000Z",
    });

    expect(bundle.summary).toEqual({
      readyForSignoff: false,
      totalSurfaceCount: 3,
      reviewedSurfaceCount: 2,
      passSurfaceCount: 1,
      followUpSurfaceCount: 1,
      notReviewedSurfaceCount: 1,
      completedManualCheckCount: 2,
      totalManualCheckCount: 6,
      pendingManualCheckCount: 4,
    });
    expect(bundle.reviewSession).toEqual({
      reviewerName: "Codex",
      sessionLabel: "Compact QA Pass",
      reviewedAt: "2026-04-23T00:00:00.000Z",
    });
    expect(bundle.requestContext).toEqual({
      requestId: "2026-04-23-first-real-operator-review-request",
      requestCreatedAt: "2026-04-22T23:40:08.207Z",
      requestRevisionSha256:
        "c9175c1e90b3442819b91bb6c9173cd506f860835c0e32f3b95dd1a3c8ea58e1",
    });
    expect(bundle.evidenceContext).toEqual({
      source: "request_snapshot",
      sourceLabel: "Request evidence snapshot",
      selectedPath:
        "Doc/testing/operator_review_requests/request/interaction-audit-evidence-pack.json",
      requestPath: "tmp/phase69-results.json",
      snapshotPath:
        "Doc/testing/operator_review_requests/request/interaction-audit-evidence-pack.json",
      evidenceItemCount: 2,
      integrityOk: true,
      integrityState: "verified",
      expectedSha256: "abc123",
      actualSha256: "abc123",
      expectedSizeBytes: 2048,
      actualSizeBytes: 2048,
    });
    expect(bundle.surfaces[0].linkedEvidence).toEqual([
      {
        label: "Focus first provider action",
        expectation: "Focus the first dashboard action.",
        screenshot: "tmp/phase69/01-dashboard.png",
        auditStatus: "Focused the first provider action button.",
      },
    ]);
    expect(bundle.surfaces[2].linkedEvidence).toEqual([]);

    const bundleMarkdown = buildInteractionAuditHandoffBundleMarkdown(bundle);

    expect(bundleMarkdown).toContain("Source signoff export: `tmp/sample-signoff.json`");
    expect(bundleMarkdown).toContain("Evidence source: Request evidence snapshot");
    expect(bundleMarkdown).toContain("Evidence items: 2");
    expect(bundleMarkdown).toContain(
      "Evidence integrity: verified sha256:abc123 (2048 bytes)",
    );
    expect(bundleMarkdown).toContain("- Reviewer: Codex");
    expect(bundleMarkdown).toContain("- Session: Compact QA Pass");
    expect(bundleMarkdown).toContain("- Reviewed at: 2026-04-23T00:00:00.000Z");
    expect(bundleMarkdown).toContain(
      "- Request binding: 2026-04-23-first-real-operator-review-request @ 2026-04-22T23:40:08.207Z",
    );
    expect(bundleMarkdown).toContain(
      "- Request revision: sha256:c9175c1e90b3442819b91bb6c9173cd506f860835c0e32f3b95dd1a3c8ea58e1",
    );
    expect(bundleMarkdown).toContain("## Current workspace handoff summary");
    expect(bundleMarkdown).toContain("## Linked preset evidence");
    expect(bundleMarkdown).toContain("### Dashboard");
    expect(bundleMarkdown).toContain("Evidence: `tmp/phase69/01-dashboard.png`");
    expect(bundleMarkdown).toContain(
      "No linked preset evidence was found for this surface.",
    );
  });
});
