import { describe, expect, it } from "vitest";

import { buildInteractionAuditExportFilename } from "./interaction-audit-export-files";

describe("interaction audit export filenames", () => {
  it("builds metadata-aware filenames for downloadable audit artifacts", () => {
    const metadata = {
      reviewerName: "Codex QA",
      sessionLabel: "Operator Compact Interaction Pass",
      reviewedAt: "2026-04-23T10:20:30.000Z",
    };

    expect(buildInteractionAuditExportFilename("signoff-draft", metadata)).toBe(
      "interaction-audit-signoff-draft-2026-04-23-operator-compact-interaction-pass.md",
    );
    expect(buildInteractionAuditExportFilename("signoff-json", metadata)).toBe(
      "interaction-audit-signoff-export-2026-04-23-operator-compact-interaction-pass.json",
    );
    expect(
      buildInteractionAuditExportFilename("handoff-summary", metadata),
    ).toBe(
      "interaction-audit-handoff-summary-2026-04-23-operator-compact-interaction-pass.md",
    );
  });

  it("includes the bound request id in filenames when request context exists", () => {
    const metadata = {
      reviewerName: "Codex QA",
      sessionLabel: "Operator Compact Interaction Pass",
      reviewedAt: "2026-04-23T10:20:30.000Z",
    };
    const requestContext = {
      requestId: "2026-04-23-first-real-operator-review-request",
      requestCreatedAt: "2026-04-23T00:00:00.000Z",
      requestRevisionSha256:
        "c9175c1e90b3442819b91bb6c9173cd506f860835c0e32f3b95dd1a3c8ea58e1",
    };

    expect(
      buildInteractionAuditExportFilename(
        "signoff-json",
        metadata,
        requestContext,
      ),
    ).toBe(
      "interaction-audit-signoff-export-2026-04-23-2026-04-23-first-real-operator-review-request-rev-c9175c1e90b3-operator-compact-interaction-pass.json",
    );
  });

  it("falls back to honest placeholder filename segments when metadata is empty", () => {
    expect(
      buildInteractionAuditExportFilename("signoff-json", {
        reviewerName: "",
        sessionLabel: "",
        reviewedAt: "",
      }),
    ).toBe("interaction-audit-signoff-export-undated-review-session.json");
  });
});
