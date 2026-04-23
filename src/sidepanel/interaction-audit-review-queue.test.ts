import { describe, expect, it } from "vitest";

import { normalizeInteractionAuditSignoffState } from "./interaction-audit-signoff";
import { buildInteractionAuditReviewQueue } from "./interaction-audit-review-queue";

const TEST_SURFACES = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Compact overview audit surface.",
    manualChecks: ["Confirm focus visibility.", "Confirm density remains readable."],
  },
  {
    id: "settings",
    title: "Settings",
    description: "Compact settings audit surface.",
    manualChecks: ["Confirm disclosure readability."],
  },
  {
    id: "popup",
    title: "Popup",
    description: "Compact popup audit surface.",
    manualChecks: ["Confirm quick-action spacing."],
  },
];

describe("interaction audit review queue", () => {
  it("builds queue status and next-target guidance from the current signoff state", () => {
    const state = normalizeInteractionAuditSignoffState(
      {
        dashboard: {
          manualCheckStates: [true, false],
          operatorNotes: "Looks stable.",
          signoffStatus: "pass",
        },
        settings: {
          manualCheckStates: [false],
          operatorNotes: "Need one more compact-width pass.",
          signoffStatus: "follow_up",
        },
        popup: {
          manualCheckStates: [false],
          operatorNotes: "",
          signoffStatus: "not_reviewed",
        },
      },
      TEST_SURFACES,
    );

    expect(buildInteractionAuditReviewQueue(TEST_SURFACES, state)).toEqual({
      nextTargetId: "settings",
      followUpCount: 1,
      notReviewedCount: 1,
      pendingCheckSurfaceCount: 1,
      readyCount: 0,
      items: [
        {
          id: "settings",
          title: "Settings",
          queueStatus: "follow_up",
          queueLabel: "Follow-up required",
          signoffLabel: "Follow-up required",
          completedManualCheckCount: 0,
          totalManualCheckCount: 1,
          pendingManualCheckCount: 1,
        },
        {
          id: "popup",
          title: "Popup",
          queueStatus: "not_reviewed",
          queueLabel: "Not reviewed",
          signoffLabel: "Not reviewed",
          completedManualCheckCount: 0,
          totalManualCheckCount: 1,
          pendingManualCheckCount: 1,
        },
        {
          id: "dashboard",
          title: "Dashboard",
          queueStatus: "pending_checks",
          queueLabel: "Pending checks",
          signoffLabel: "Pass",
          completedManualCheckCount: 1,
          totalManualCheckCount: 2,
          pendingManualCheckCount: 1,
        },
      ],
    });
  });

  it("falls back to no next target after every surface is ready", () => {
    const state = normalizeInteractionAuditSignoffState(
      {
        dashboard: {
          manualCheckStates: [true, true],
          operatorNotes: "",
          signoffStatus: "pass",
        },
        settings: {
          manualCheckStates: [true],
          operatorNotes: "",
          signoffStatus: "pass",
        },
        popup: {
          manualCheckStates: [true],
          operatorNotes: "",
          signoffStatus: "pass",
        },
      },
      TEST_SURFACES,
    );

    expect(buildInteractionAuditReviewQueue(TEST_SURFACES, state)).toEqual({
      nextTargetId: null,
      followUpCount: 0,
      notReviewedCount: 0,
      pendingCheckSurfaceCount: 0,
      readyCount: 3,
      items: [
        {
          id: "dashboard",
          title: "Dashboard",
          queueStatus: "ready",
          queueLabel: "Ready",
          signoffLabel: "Pass",
          completedManualCheckCount: 2,
          totalManualCheckCount: 2,
          pendingManualCheckCount: 0,
        },
        {
          id: "popup",
          title: "Popup",
          queueStatus: "ready",
          queueLabel: "Ready",
          signoffLabel: "Pass",
          completedManualCheckCount: 1,
          totalManualCheckCount: 1,
          pendingManualCheckCount: 0,
        },
        {
          id: "settings",
          title: "Settings",
          queueStatus: "ready",
          queueLabel: "Ready",
          signoffLabel: "Pass",
          completedManualCheckCount: 1,
          totalManualCheckCount: 1,
          pendingManualCheckCount: 0,
        },
      ],
    });
  });
});
