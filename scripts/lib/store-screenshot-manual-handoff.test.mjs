import { describe, expect, it } from "vitest";

import {
  buildStoreScreenshotCapturePlanDocument,
} from "./store-screenshot-capture-plan.mjs";
import {
  buildStoreScreenshotManualCaptureHandoffDocument,
} from "./store-screenshot-manual-handoff.mjs";
import {
  STORE_SCREENSHOT_CAPTURE_AUTOMATION_MODE_MANUAL_CAPTURE_REQUIRED,
  STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_APPROXIMATED_RUNTIME_STATE,
  STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_EXACT_RUNTIME_CAPTURE,
  STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED,
} from "./store-screenshot-capture-request.mjs";

describe("store screenshot manual handoff helpers", () => {
  it("summarizes unresolved manual popup slots and staged full-page entries", () => {
    const capturePlan = buildStoreScreenshotCapturePlanDocument({
      requestId: "request-1",
      requestCreatedAt: "2026-04-24T00:00:00.000Z",
      captureAutomationMode:
        STORE_SCREENSHOT_CAPTURE_AUTOMATION_MODE_MANUAL_CAPTURE_REQUIRED,
      requiredScreenshotFilenames: [
        "01-toolbar-first-quick-glance.png",
        "04-settings-and-setup-depth.png",
      ],
    });
    const handoff = buildStoreScreenshotManualCaptureHandoffDocument({
      requestId: "request-1",
      requestCreatedAt: "2026-04-24T00:00:00.000Z",
      status: "pending_operator_capture",
      capturePlanDocument: capturePlan,
      notesDocument: {
        requestId: "request-1",
        requestCreatedAt: "2026-04-24T00:00:00.000Z",
        notes: [
          {
            filename: "01-toolbar-first-quick-glance.png",
            captureTruth: STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED,
            stateSummary: "",
            operatorNote: "",
          },
          {
            filename: "04-settings-and-setup-depth.png",
            captureTruth:
              STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_APPROXIMATED_RUNTIME_STATE,
            stateSummary: "Full-page Settings is already staged.",
            operatorNote: "Seeded full-page shell state.",
          },
        ],
      },
      capturePresenceByFilename: {
        "04-settings-and-setup-depth.png": true,
      },
      capturesDirRelative: "Doc/testing/store_screenshot_capture_requests/request-1/captures",
      requestDirRelative: "Doc/testing/store_screenshot_capture_requests/request-1",
    });

    expect(handoff.summary).toEqual({
      entryCount: 2,
      manualEntryCount: 1,
      remainingManualCount: 1,
      manualCaptureMissingCount: 1,
      manualNoteIncompleteCount: 1,
      manualReadyCount: 0,
      stagedRequestBoundCount: 1,
      stagedReadyCount: 1,
      stagedPendingCount: 0,
      archiveReady: false,
    });
    expect(handoff.manualImportCommand).toContain(
      "store:import-manual-screenshot-captures",
    );
    expect(handoff.manualImportWithNotesCommand).toContain("--notes-file");
    expect(handoff.manualNotesTemplatePath).toBe(
      "Doc/testing/store_screenshot_capture_requests/request-1/manual-popup-notes-overlay.template.json",
    );
    expect(handoff.manualChecklistPath).toBe(
      "Doc/testing/store_screenshot_capture_requests/request-1/manual-popup-capture-checklist.md",
    );
    expect(handoff.remainingManualEntries[0]).toMatchObject({
      filename: "01-toolbar-first-quick-glance.png",
      storyboardClaim: "one click gives a compact, readable AI usage snapshot",
      capturePresent: false,
      noteStatus: STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED,
    });
    expect(handoff.stagedReadyEntries[0]).toMatchObject({
      filename: "04-settings-and-setup-depth.png",
      requestedSurface: "full_page_shell",
      capturePresent: true,
    });
  });

  it("marks the request archive-ready once every capture and note is complete", () => {
    const capturePlan = buildStoreScreenshotCapturePlanDocument({
      requestId: "request-1",
      requestCreatedAt: "2026-04-24T00:00:00.000Z",
      captureAutomationMode:
        STORE_SCREENSHOT_CAPTURE_AUTOMATION_MODE_MANUAL_CAPTURE_REQUIRED,
      requiredScreenshotFilenames: ["01-toolbar-first-quick-glance.png"],
    });
    const handoff = buildStoreScreenshotManualCaptureHandoffDocument({
      requestId: "request-1",
      requestCreatedAt: "2026-04-24T00:00:00.000Z",
      status: "pending_operator_capture",
      capturePlanDocument: capturePlan,
      notesDocument: {
        requestId: "request-1",
        requestCreatedAt: "2026-04-24T00:00:00.000Z",
        notes: [
          {
            filename: "01-toolbar-first-quick-glance.png",
            captureTruth: STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_EXACT_RUNTIME_CAPTURE,
            stateSummary: "Native toolbar popup shows the healthy quick-glance state.",
            operatorNote: "",
          },
        ],
      },
      capturePresenceByFilename: {
        "01-toolbar-first-quick-glance.png": true,
      },
      capturesDirRelative: "Doc/testing/store_screenshot_capture_requests/request-1/captures",
      requestDirRelative: "Doc/testing/store_screenshot_capture_requests/request-1",
    });

    expect(handoff.summary.archiveReady).toBe(true);
    expect(handoff.summary.remainingManualCount).toBe(0);
    expect(handoff.summary.manualCaptureMissingCount).toBe(0);
    expect(handoff.summary.manualNoteIncompleteCount).toBe(0);
    expect(handoff.summary.manualReadyCount).toBe(1);
    expect(handoff.archiveReadinessIssues).toEqual([]);
  });
});
