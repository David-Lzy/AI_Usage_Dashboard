import { describe, expect, it } from "vitest";

import {
  buildStoreScreenshotCapturePlanDocument,
  STORE_SCREENSHOT_CAPTURE_PLAN_MODE_MANUAL_OPERATOR_CAPTURE,
  STORE_SCREENSHOT_CAPTURE_PLAN_MODE_REQUEST_BOUND_RDP_RUNNER,
  STORE_SCREENSHOT_CAPTURE_PLAN_SURFACE_FULL_PAGE_SHELL,
  STORE_SCREENSHOT_CAPTURE_PLAN_SURFACE_NATIVE_TOOLBAR_POPUP,
} from "./store-screenshot-capture-plan.mjs";

import {
  buildStoreScreenshotCaptureNotesDocument,
  buildStoreScreenshotCaptureNotesSummary,
  STORE_SCREENSHOT_CAPTURE_AUTOMATION_MODE_MANUAL_CAPTURE_REQUIRED,
  STORE_SCREENSHOT_CAPTURE_AUTOMATION_MODE_REQUEST_BOUND_RDP_RUNNER,
  STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_APPROXIMATED_RUNTIME_STATE,
  STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_EXACT_RUNTIME_CAPTURE,
  STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED,
  validateStoreScreenshotCaptureNotesDocument,
} from "./store-screenshot-capture-request.mjs";

describe("store screenshot capture request helpers", () => {
  it("builds one placeholder note per required screenshot", () => {
    const notes = buildStoreScreenshotCaptureNotesDocument({
      requestId: "request-1",
      requestCreatedAt: "2026-04-24T00:00:00.000Z",
      requiredScreenshotFilenames: ["01.png", "02.png"],
    });

    expect(notes.requestId).toBe("request-1");
    expect(notes.notes).toEqual([
      {
        filename: "01.png",
        captureTruth: STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED,
        stateSummary: "",
        operatorNote: "",
      },
      {
        filename: "02.png",
        captureTruth: STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED,
        stateSummary: "",
        operatorNote: "",
      },
    ]);
  });

  it("summarizes reviewed and truth-boundary note counts", () => {
    expect(
      buildStoreScreenshotCaptureNotesSummary({
        requestId: "request-1",
        requestCreatedAt: "2026-04-24T00:00:00.000Z",
        notes: [
          {
            filename: "01.png",
            captureTruth: STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_EXACT_RUNTIME_CAPTURE,
            stateSummary: "Healthy popup quick glance.",
            operatorNote: "",
          },
          {
            filename: "02.png",
            captureTruth:
              STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_APPROXIMATED_RUNTIME_STATE,
            stateSummary: "Settings recreated with seeded host access.",
            operatorNote: "Native prompt could not be shown in one still image.",
          },
          {
            filename: "03.png",
            captureTruth: STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED,
            stateSummary: "",
            operatorNote: "",
          },
        ],
      }),
    ).toEqual({
      noteCount: 3,
      reviewedScreenshotCount: 2,
      pendingReviewCount: 1,
      truthBoundaryCount: 1,
    });
  });

  it("builds one hybrid capture plan for manual popup plus request-bound full-page slots", () => {
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

    expect(capturePlan.summary).toEqual({
      entryCount: 2,
      requestBoundRunnerCount: 1,
      manualOperatorCount: 1,
    });
    expect(capturePlan.entries).toEqual([
      {
        filename: "01-toolbar-first-quick-glance.png",
        captureMode: STORE_SCREENSHOT_CAPTURE_PLAN_MODE_MANUAL_OPERATOR_CAPTURE,
        requestedSurface: STORE_SCREENSHOT_CAPTURE_PLAN_SURFACE_NATIVE_TOOLBAR_POPUP,
        preferredSize: "640x400",
        fallbackSize: "640x400",
        manualReason:
          "This refreshed store slot must be captured from the native Chrome toolbar action bubble instead of the popup app-window helper.",
      },
      {
        filename: "04-settings-and-setup-depth.png",
        captureMode: STORE_SCREENSHOT_CAPTURE_PLAN_MODE_REQUEST_BOUND_RDP_RUNNER,
        requestedSurface: STORE_SCREENSHOT_CAPTURE_PLAN_SURFACE_FULL_PAGE_SHELL,
        preset: "settings-and-setup-depth",
        routePath: "src/sidepanel/index.html?surface=full-page#settings",
        expectedTitle: "AI Usage Dashboard",
        width: 1280,
        height: 800,
        captureTruth: STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_APPROXIMATED_RUNTIME_STATE,
        stateSummary:
          "Full-page Settings shows setup ownership in the deeper workspace with the same mixed blockers carried over from the popup story.",
        operatorNote:
          "This is a real full-page shell capture from a request-bound seeded state used to keep the Settings setup story consistent during refreshed store screenshot review.",
      },
    ]);
  });

  it("keeps popup slots request-bound when the whole request is fully automatable", () => {
    const capturePlan = buildStoreScreenshotCapturePlanDocument({
      requestId: "request-1",
      requestCreatedAt: "2026-04-24T00:00:00.000Z",
      captureAutomationMode:
        STORE_SCREENSHOT_CAPTURE_AUTOMATION_MODE_REQUEST_BOUND_RDP_RUNNER,
      requiredScreenshotFilenames: ["01-toolbar-first-quick-glance.png"],
    });

    expect(capturePlan.entries).toEqual([
      {
        filename: "01-toolbar-first-quick-glance.png",
        captureMode: STORE_SCREENSHOT_CAPTURE_PLAN_MODE_REQUEST_BOUND_RDP_RUNNER,
        requestedSurface: "extension_popup_window",
        preset: "toolbar-first-quick-glance",
        routePath: "src/popup/index.html",
        expectedTitle: "AI Usage Dashboard Popup",
        width: 640,
        height: 400,
        captureTruth: STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_APPROXIMATED_RUNTIME_STATE,
        stateSummary:
          "Popup shows a compact quick-glance state with Cursor, Claude Code, and Codex visible in one healthy toolbar-first view.",
        operatorNote:
          "This is a real extension-mode popup capture from a request-bound seeded runtime state, not a direct live sync snapshot from the current operator session.",
      },
    ]);
  });

  it("rejects incomplete reviewed notes", () => {
    const validation = validateStoreScreenshotCaptureNotesDocument({
      requestId: "request-1",
      requestCreatedAt: "2026-04-24T00:00:00.000Z",
      requiredScreenshotFilenames: ["01.png", "02.png"],
      notesDocument: {
        requestId: "request-1",
        requestCreatedAt: "2026-04-24T00:00:00.000Z",
        notes: [
          {
            filename: "01.png",
            captureTruth: STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_NOT_REVIEWED,
            stateSummary: "",
            operatorNote: "",
          },
          {
            filename: "02.png",
            captureTruth:
              STORE_SCREENSHOT_CAPTURE_NOTE_STATUS_APPROXIMATED_RUNTIME_STATE,
            stateSummary: "Policy-only fallback screenshot.",
            operatorNote: "",
          },
        ],
      },
    });

    expect(validation.issues).toEqual([
      "Capture notes for `01.png` were still `not_reviewed`.",
      "Capture notes for `01.png` were missing `stateSummary`.",
      "Capture notes for `02.png` need `operatorNote` when `captureTruth` is `approximated_runtime_state`.",
    ]);
  });
});
