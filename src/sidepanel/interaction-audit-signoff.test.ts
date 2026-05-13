import { describe, expect, it } from "vitest";

import {
  buildInitialInteractionAuditSignoffState,
  buildInitialInteractionAuditSignoffMetadata,
  buildInitialInteractionAuditSignoffRequestContext,
  buildInteractionAuditSignoffDraft,
  buildInteractionAuditSignoffExport,
  buildInteractionAuditSignoffHandoffDraft,
  buildInteractionAuditSignoffHandoffSummary,
  buildInteractionAuditSignoffSummary,
  formatInteractionAuditSignoffRequestBinding,
  formatInteractionAuditSignoffRequestRevision,
  normalizeInteractionAuditSignoffMetadata,
  normalizeInteractionAuditSignoffRequestContext,
  normalizeInteractionAuditSignoffState,
  parseInteractionAuditSignoffImport,
} from "./interaction-audit-signoff";

const TEST_SURFACES = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Compact overview audit surface.",
    manualChecks: ["Confirm focus visibility.", "Confirm density remains readable."],
  },
  {
    id: "popup",
    title: "Popup",
    description: "Compact popup audit surface.",
    manualChecks: ["Confirm spacing rhythm."],
  },
];

describe("interaction audit signoff helpers", () => {
  it("builds an empty signoff state that matches the visible manual-check counts", () => {
    const state = buildInitialInteractionAuditSignoffState(TEST_SURFACES);

    expect(state).toEqual({
      dashboard: {
        manualCheckStates: [false, false],
        operatorNotes: "",
        signoffStatus: "not_reviewed",
      },
      popup: {
        manualCheckStates: [false],
        operatorNotes: "",
        signoffStatus: "not_reviewed",
      },
    });
  });

  it("builds and normalizes empty review-session metadata", () => {
    expect(buildInitialInteractionAuditSignoffMetadata()).toEqual({
      reviewerName: "",
      sessionLabel: "",
      reviewedAt: "",
    });
    expect(buildInitialInteractionAuditSignoffRequestContext()).toEqual({
      requestId: "",
      requestCreatedAt: "",
      requestRevisionSha256: "",
    });

    expect(
      normalizeInteractionAuditSignoffMetadata({
        reviewerName: 42,
        sessionLabel: "Compact QA",
        reviewedAt: null,
      }),
    ).toEqual({
      reviewerName: "",
      sessionLabel: "Compact QA",
      reviewedAt: "",
    });
    expect(
      normalizeInteractionAuditSignoffRequestContext({
        requestId: 42,
        requestCreatedAt: "2026-04-23T00:00:00.000Z",
        requestRevisionSha256: 42,
      }),
    ).toEqual({
      requestId: "",
      requestCreatedAt: "2026-04-23T00:00:00.000Z",
      requestRevisionSha256: "",
    });
    expect(
      formatInteractionAuditSignoffRequestBinding({
        requestId: "2026-04-23-first-real-operator-review-request",
        requestCreatedAt: "2026-04-23T00:00:00.000Z",
        requestRevisionSha256:
          "c9175c1e90b3442819b91bb6c9173cd506f860835c0e32f3b95dd1a3c8ea58e1",
      }),
    ).toBe(
      "2026-04-23-first-real-operator-review-request @ 2026-04-23T00:00:00.000Z",
    );
    expect(
      formatInteractionAuditSignoffRequestRevision({
        requestId: "2026-04-23-first-real-operator-review-request",
        requestCreatedAt: "2026-04-23T00:00:00.000Z",
        requestRevisionSha256:
          "c9175c1e90b3442819b91bb6c9173cd506f860835c0e32f3b95dd1a3c8ea58e1",
      }),
    ).toBe(
      "sha256:c9175c1e90b3442819b91bb6c9173cd506f860835c0e32f3b95dd1a3c8ea58e1",
    );
  });

  it("normalizes malformed stored state back onto the current surface definitions", () => {
    const state = normalizeInteractionAuditSignoffState(
      {
        dashboard: {
          manualCheckStates: [true, "bad", true],
          operatorNotes: 42,
          signoffStatus: "invalid",
        },
        extra: {
          manualCheckStates: [true],
          operatorNotes: "ignore me",
          signoffStatus: "pass",
        },
      },
      TEST_SURFACES,
    );

    expect(state).toEqual({
      dashboard: {
        manualCheckStates: [true, true],
        operatorNotes: "",
        signoffStatus: "not_reviewed",
      },
      popup: {
        manualCheckStates: [false],
        operatorNotes: "",
        signoffStatus: "not_reviewed",
      },
    });
  });

  it("builds summary counts, export data, and a draft from the current workspace state", () => {
    const state = normalizeInteractionAuditSignoffState(
      {
        dashboard: {
          manualCheckStates: [true, false],
          operatorNotes: "Focus remained coherent.",
          signoffStatus: "pass",
        },
        popup: {
          manualCheckStates: [true],
          operatorNotes: "Need a quick mouse pass.",
          signoffStatus: "follow_up",
        },
      },
      TEST_SURFACES,
    );
    const metadata = {
      reviewerName: "Codex QA",
      sessionLabel: "Compact QA Pass",
      reviewedAt: "2026-04-23T00:00:00.000Z",
    };
    const requestContext = {
      requestId: "2026-04-23-first-real-operator-review-request",
      requestCreatedAt: "2026-04-23T00:00:00.000Z",
      requestRevisionSha256:
        "c9175c1e90b3442819b91bb6c9173cd506f860835c0e32f3b95dd1a3c8ea58e1",
    };

    expect(buildInteractionAuditSignoffSummary(TEST_SURFACES, state)).toEqual({
      reviewedSurfaceCount: 2,
      passSurfaceCount: 1,
      followUpSurfaceCount: 1,
      completedManualCheckCount: 2,
      totalManualCheckCount: 3,
    });

    expect(buildInteractionAuditSignoffExport(TEST_SURFACES, state, metadata, requestContext)).toEqual({
      metadata,
      requestContext,
      summary: {
        reviewedSurfaceCount: 2,
        passSurfaceCount: 1,
        followUpSurfaceCount: 1,
        completedManualCheckCount: 2,
        totalManualCheckCount: 3,
      },
      surfaces: [
        {
          id: "dashboard",
          title: "Dashboard",
          description: "Compact overview audit surface.",
          signoffStatus: "pass",
          operatorNotes: "Focus remained coherent.",
          manualChecks: [
            { label: "Confirm focus visibility.", completed: true },
            { label: "Confirm density remains readable.", completed: false },
          ],
        },
        {
          id: "popup",
          title: "Popup",
          description: "Compact popup audit surface.",
          signoffStatus: "follow_up",
          operatorNotes: "Need a quick mouse pass.",
          manualChecks: [{ label: "Confirm spacing rhythm.", completed: true }],
        },
      ],
    });

    const draft = buildInteractionAuditSignoffDraft(
      TEST_SURFACES,
      state,
      metadata,
      requestContext,
    );

    expect(draft).toContain("Review session:");
    expect(draft).toContain("- Reviewer: Codex QA");
    expect(draft).toContain("- Session: Compact QA Pass");
    expect(draft).toContain("- Reviewed at: 2026-04-23T00:00:00.000Z");
    expect(draft).toContain(
      "- Request binding: 2026-04-23-first-real-operator-review-request @ 2026-04-23T00:00:00.000Z",
    );
    expect(draft).toContain(
      "- Request revision: sha256:c9175c1e90b3442819b91bb6c9173cd506f860835c0e32f3b95dd1a3c8ea58e1",
    );
    expect(draft).toContain("Reviewed surfaces: 2 / 2");
    expect(draft).toContain("- [x] Confirm focus visibility.");
    expect(draft).toContain("- [ ] Confirm density remains readable.");
    expect(draft).toContain("- Focus remained coherent.");
    expect(draft).toContain("- [x] Pass");
    expect(draft).toContain("- [x] Follow-up required");
  });

  it("builds a handoff summary and draft that focus on remaining review work", () => {
    const state = normalizeInteractionAuditSignoffState(
      {
        dashboard: {
          manualCheckStates: [true, false],
          operatorNotes: "Focus remained coherent.",
          signoffStatus: "pass",
        },
        popup: {
          manualCheckStates: [true],
          operatorNotes: "Need a quick mouse pass.",
          signoffStatus: "follow_up",
        },
      },
      TEST_SURFACES,
    );
    const metadata = {
      reviewerName: "Codex QA",
      sessionLabel: "Follow-up Pass",
      reviewedAt: "2026-04-23T00:00:00.000Z",
    };
    const requestContext = {
      requestId: "2026-04-23-first-real-operator-review-request",
      requestCreatedAt: "2026-04-23T00:00:00.000Z",
      requestRevisionSha256:
        "c9175c1e90b3442819b91bb6c9173cd506f860835c0e32f3b95dd1a3c8ea58e1",
    };

    expect(buildInteractionAuditSignoffHandoffSummary(TEST_SURFACES, state)).toEqual({
      totalSurfaceCount: 2,
      reviewedSurfaceCount: 2,
      passSurfaceCount: 1,
      followUpSurfaceCount: 1,
      notReviewedSurfaceCount: 0,
      completedManualCheckCount: 2,
      totalManualCheckCount: 3,
      pendingManualCheckCount: 1,
      readyForSignoff: false,
      surfaces: [
        {
          id: "dashboard",
          title: "Dashboard",
          description: "Compact overview audit surface.",
          signoffStatus: "pass",
          operatorNotes: "Focus remained coherent.",
          completedManualCheckCount: 1,
          totalManualCheckCount: 2,
          pendingManualChecks: ["Confirm density remains readable."],
        },
        {
          id: "popup",
          title: "Popup",
          description: "Compact popup audit surface.",
          signoffStatus: "follow_up",
          operatorNotes: "Need a quick mouse pass.",
          completedManualCheckCount: 1,
          totalManualCheckCount: 1,
          pendingManualChecks: [],
        },
      ],
      followUpSurfaces: [
        {
          id: "popup",
          title: "Popup",
          description: "Compact popup audit surface.",
          signoffStatus: "follow_up",
          operatorNotes: "Need a quick mouse pass.",
          completedManualCheckCount: 1,
          totalManualCheckCount: 1,
          pendingManualChecks: [],
        },
      ],
      notReviewedSurfaces: [],
      surfacesWithPendingChecks: [
        {
          id: "dashboard",
          title: "Dashboard",
          description: "Compact overview audit surface.",
          signoffStatus: "pass",
          operatorNotes: "Focus remained coherent.",
          completedManualCheckCount: 1,
          totalManualCheckCount: 2,
          pendingManualChecks: ["Confirm density remains readable."],
        },
      ],
    });

    const draft = buildInteractionAuditSignoffHandoffDraft(
      TEST_SURFACES,
      state,
      metadata,
      requestContext,
    );

    expect(draft).toContain("Review session:");
    expect(draft).toContain("- Reviewer: Codex QA");
    expect(draft).toContain("- Session: Follow-up Pass");
    expect(draft).toContain(
      "- Request binding: 2026-04-23-first-real-operator-review-request @ 2026-04-23T00:00:00.000Z",
    );
    expect(draft).toContain(
      "- Request revision: sha256:c9175c1e90b3442819b91bb6c9173cd506f860835c0e32f3b95dd1a3c8ea58e1",
    );
    expect(draft).toContain("Ready for signoff: no");
    expect(draft).toContain("Follow-up required: 1");
    expect(draft).toContain("Pending checks: 1 / 3");
    expect(draft).toContain("## Follow-up required");
    expect(draft).toContain("### Popup");
    expect(draft).toContain("- Notes: Need a quick mouse pass.");
    expect(draft).toContain("## Pending manual checks");
    expect(draft).toContain("### Dashboard");
    expect(draft).toContain("- Confirm density remains readable.");
  });

  it("parses exported signoff JSON back into workspace state", () => {
    const result = parseInteractionAuditSignoffImport(
      JSON.stringify({
        metadata: {
          reviewerName: "Codex",
          sessionLabel: "Compact QA",
          reviewedAt: "2026-04-23T00:00:00.000Z",
        },
        requestContext: {
          requestId: "2026-04-23-first-real-operator-review-request",
          requestCreatedAt: "2026-04-23T00:00:00.000Z",
          requestRevisionSha256: "sha256-request-revision",
        },
        surfaces: [
          {
            id: "dashboard",
            signoffStatus: "pass",
            operatorNotes: "Looks good.",
            manualChecks: [{ completed: true }, { completed: false }],
          },
          {
            id: "popup",
            signoffStatus: "follow_up",
            operatorNotes: "Need another pass.",
            manualChecks: [{ completed: true }],
          },
        ],
      }),
      TEST_SURFACES,
    );

    expect(result).toEqual({
      ok: true,
      state: {
        dashboard: {
          manualCheckStates: [true, false],
          operatorNotes: "Looks good.",
          signoffStatus: "pass",
        },
        popup: {
          manualCheckStates: [true],
          operatorNotes: "Need another pass.",
          signoffStatus: "follow_up",
        },
      },
      metadata: {
        reviewerName: "Codex",
        sessionLabel: "Compact QA",
        reviewedAt: "2026-04-23T00:00:00.000Z",
      },
      requestContext: {
        requestId: "2026-04-23-first-real-operator-review-request",
        requestCreatedAt: "2026-04-23T00:00:00.000Z",
        requestRevisionSha256: "sha256-request-revision",
      },
    });
  });

  it("falls back to empty metadata when importing workspace-only JSON", () => {
    const result = parseInteractionAuditSignoffImport(
      JSON.stringify({
        dashboard: {
          manualCheckStates: [true, false],
          operatorNotes: "Imported dashboard note.",
          signoffStatus: "pass",
        },
      }),
      TEST_SURFACES,
    );

    expect(result).toEqual({
      ok: true,
      state: {
        dashboard: {
          manualCheckStates: [true, false],
          operatorNotes: "Imported dashboard note.",
          signoffStatus: "pass",
        },
        popup: {
          manualCheckStates: [false],
          operatorNotes: "",
          signoffStatus: "not_reviewed",
        },
      },
      metadata: {
        reviewerName: "",
        sessionLabel: "",
        reviewedAt: "",
      },
      requestContext: {
        requestId: "",
        requestCreatedAt: "",
        requestRevisionSha256: "",
      },
    });
  });

  it("rejects invalid import text with an honest error", () => {
    expect(parseInteractionAuditSignoffImport("", TEST_SURFACES)).toEqual({
      ok: false,
      code: "empty_input",
      error: "Paste exported signoff JSON before importing.",
    });

    expect(
      parseInteractionAuditSignoffImport("{bad json", TEST_SURFACES),
    ).toEqual({
      ok: false,
      code: "invalid_json",
      error: "Signoff import JSON could not be parsed.",
    });

    expect(parseInteractionAuditSignoffImport("42", TEST_SURFACES)).toEqual({
      ok: false,
      code: "unsupported_shape",
      error:
        "Signoff import JSON did not match the expected workspace or export shape.",
    });
  });
});
