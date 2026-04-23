import { describe, expect, it } from "vitest";

import {
  buildStoreScreenshotCaptureNotesDocument,
  buildStoreScreenshotCaptureNotesSummary,
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
