import { describe, expect, it } from "vitest";

import { buildInteractionAuditReviewRequestPreflight } from "./interaction-audit-review-request-preflight.mjs";
import { buildInteractionAuditReviewExpectedShape } from "./interaction-audit-review-request.mjs";

const TEMPLATE = {
  surfaces: [
    {
      id: "dashboard-360",
      title: "Dashboard",
      description: "Compact dashboard frame.",
      manualChecks: [{ label: "Confirm focus visibility." }],
    },
    {
      id: "settings-420",
      title: "Settings",
      description: "Compact Settings frame.",
      manualChecks: [{ label: "Confirm diagnostics readability." }],
    },
  ],
};

function buildExport() {
  return {
    metadata: {
      reviewerName: "Operator Example",
      sessionLabel: "compact pass",
      reviewedAt: "2026-04-24T13:00:00.000Z",
    },
    requestContext: {
      requestId: "2026-04-24-request",
      requestCreatedAt: "2026-04-24T12:00:00.000Z",
      requestRevisionSha256: "sha256-current-request-revision",
    },
    summary: {
      reviewedSurfaceCount: 2,
      passSurfaceCount: 2,
      followUpSurfaceCount: 0,
      completedManualCheckCount: 2,
      totalManualCheckCount: 2,
    },
    surfaces: [
      {
        id: "dashboard-360",
        title: "Dashboard",
        description: "Compact dashboard frame.",
        signoffStatus: "pass",
        operatorNotes: "",
        manualChecks: [{ label: "Confirm focus visibility.", completed: true }],
      },
      {
        id: "settings-420",
        title: "Settings",
        description: "Compact Settings frame.",
        signoffStatus: "pass",
        operatorNotes: "",
        manualChecks: [
          { label: "Confirm diagnostics readability.", completed: true },
        ],
      },
    ],
  };
}

describe("interaction audit review request preflight helpers", () => {
  it("accepts an aligned bound export", () => {
    const report = buildInteractionAuditReviewRequestPreflight({
      requestManifest: {
        requestId: "2026-04-24-request",
        createdAt: "2026-04-24T12:00:00.000Z",
        status: "pending_operator_review",
        requestRevisionSha256: "sha256-current-request-revision",
        expectedShape: buildInteractionAuditReviewExpectedShape(TEMPLATE),
      },
      requestTemplate: TEMPLATE,
      signoffExport: buildExport(),
      currentSourceTemplate: TEMPLATE,
      sourceTemplatePath:
        "fixtures/interaction-audit/operator-review-request-template.fixture.json",
      sourceEvidencePack: {
        ok: true,
        source: "request_manifest",
        sourceLabel: "Request source evidence pack",
        selectedPath: "tmp/request-evidence.json",
        evidenceItemCount: 3,
      },
    });

    expect(report.ok).toBe(true);
    expect(report.failures).toEqual([]);
    expect(report.signoffSummary.readyForSignoff).toBe(true);
    expect(
      report.checks.find((check) => check.id === "source-evidence-pack")?.ok,
    ).toBe(true);
  });

  it("rejects wrong request binding and drifted source template", () => {
    const mismatchedExport = buildExport();
    mismatchedExport.requestContext.requestId = "2026-04-24-other-request";
    const driftedTemplate = {
      surfaces: [
        {
          id: "dashboard-360",
          manualChecks: [{ label: "Confirm refreshed focus visibility." }],
        },
        {
          id: "settings-420",
          manualChecks: [{ label: "Confirm diagnostics readability." }],
        },
      ],
    };

    const report = buildInteractionAuditReviewRequestPreflight({
      requestManifest: {
        requestId: "2026-04-24-request",
        createdAt: "2026-04-24T12:00:00.000Z",
        status: "pending_operator_review",
        requestRevisionSha256: "sha256-current-request-revision",
        expectedShape: buildInteractionAuditReviewExpectedShape(TEMPLATE),
      },
      requestTemplate: TEMPLATE,
      signoffExport: mismatchedExport,
      currentSourceTemplate: driftedTemplate,
      sourceTemplatePath:
        "fixtures/interaction-audit/operator-review-request-template.fixture.json",
      sourceEvidencePack: {
        ok: false,
        source: "request_manifest",
        sourceLabel: "Request source evidence pack",
        selectedPath: "tmp/request-evidence.json",
        evidenceItemCount: 0,
        error:
          "Request source evidence pack `tmp/request-evidence.json` could not be read.",
      },
    });

    expect(report.ok).toBe(false);
    expect(
      report.checks.find((check) => check.id === "request-binding")?.ok,
    ).toBe(false);
    expect(
      report.checks.find((check) => check.id === "request-revision")?.ok,
    ).toBe(true);
    expect(
      report.checks.find((check) => check.id === "source-evidence-pack")?.ok,
    ).toBe(false);
    expect(
      report.checks.find((check) => check.id === "template-drift")?.ok,
    ).toBe(false);
  });

  it("rejects an export that is bound to an outdated request revision", () => {
    const outdatedExport = buildExport();
    outdatedExport.requestContext.requestRevisionSha256 =
      "sha256-older-request-revision";

    const report = buildInteractionAuditReviewRequestPreflight({
      requestManifest: {
        requestId: "2026-04-24-request",
        createdAt: "2026-04-24T12:00:00.000Z",
        status: "pending_operator_review",
        requestRevisionSha256: "sha256-current-request-revision",
        expectedShape: buildInteractionAuditReviewExpectedShape(TEMPLATE),
      },
      requestTemplate: TEMPLATE,
      signoffExport: outdatedExport,
      currentSourceTemplate: TEMPLATE,
      sourceTemplatePath:
        "fixtures/interaction-audit/operator-review-request-template.fixture.json",
      sourceEvidencePack: {
        ok: true,
        source: "request_manifest",
        sourceLabel: "Request source evidence pack",
        selectedPath: "tmp/request-evidence.json",
        evidenceItemCount: 1,
      },
    });

    expect(report.ok).toBe(false);
    expect(
      report.checks.find((check) => check.id === "request-binding")?.ok,
    ).toBe(true);
    expect(
      report.checks.find((check) => check.id === "request-revision")?.ok,
    ).toBe(false);
  });
});
