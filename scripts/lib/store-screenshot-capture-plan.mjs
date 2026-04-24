import { getStoreScreenshotCapturePlanEntry } from "./store-screenshot-rdp-capture.mjs";

export const STORE_SCREENSHOT_CAPTURE_PLAN_SCHEMA_VERSION = 1;
export const STORE_SCREENSHOT_CAPTURE_PLAN_MODE_MANUAL_OPERATOR_CAPTURE =
  "manual_operator_capture";
export const STORE_SCREENSHOT_CAPTURE_PLAN_MODE_REQUEST_BOUND_RDP_RUNNER =
  "request_bound_rdp_runner";
export const STORE_SCREENSHOT_CAPTURE_PLAN_SURFACE_NATIVE_TOOLBAR_POPUP =
  "native_toolbar_popup";
export const STORE_SCREENSHOT_CAPTURE_PLAN_SURFACE_EXTENSION_POPUP_WINDOW =
  "extension_popup_window";
export const STORE_SCREENSHOT_CAPTURE_PLAN_SURFACE_FULL_PAGE_SHELL =
  "full_page_shell";
export const STORE_SCREENSHOT_CAPTURE_PLAN_SURFACE_SIDEPANEL = "sidepanel";
export const STORE_SCREENSHOT_CAPTURE_PLAN_SURFACE_UNKNOWN = "unknown";

const MANUAL_CAPTURE_REQUIRED = "manual_capture_required";

function normalizeStringArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string" && item.trim().length > 0)
    : [];
}

function inferRequestedSurface(runtimePlan) {
  if (!runtimePlan || typeof runtimePlan.routePath !== "string") {
    return STORE_SCREENSHOT_CAPTURE_PLAN_SURFACE_UNKNOWN;
  }

  if (runtimePlan.routePath === "src/popup/index.html") {
    return STORE_SCREENSHOT_CAPTURE_PLAN_SURFACE_EXTENSION_POPUP_WINDOW;
  }

  if (runtimePlan.routePath.includes("?surface=full-page")) {
    return STORE_SCREENSHOT_CAPTURE_PLAN_SURFACE_FULL_PAGE_SHELL;
  }

  return STORE_SCREENSHOT_CAPTURE_PLAN_SURFACE_SIDEPANEL;
}

function isManualNativeToolbarPopupSlot({ captureAutomationMode, runtimePlan }) {
  return (
    captureAutomationMode === MANUAL_CAPTURE_REQUIRED &&
    runtimePlan &&
    runtimePlan.routePath === "src/popup/index.html"
  );
}

function buildRequestCapturePlanEntry({ captureAutomationMode, filename }) {
  const runtimePlan = getStoreScreenshotCapturePlanEntry(filename);

  if (isManualNativeToolbarPopupSlot({ captureAutomationMode, runtimePlan })) {
    return {
      filename,
      captureMode: STORE_SCREENSHOT_CAPTURE_PLAN_MODE_MANUAL_OPERATOR_CAPTURE,
      requestedSurface: STORE_SCREENSHOT_CAPTURE_PLAN_SURFACE_NATIVE_TOOLBAR_POPUP,
      preferredSize: "640x400",
      fallbackSize: "640x400",
      manualReason:
        "This refreshed store slot must be captured from the native Chrome toolbar action bubble instead of the popup app-window helper.",
    };
  }

  if (runtimePlan) {
    return {
      filename,
      captureMode: STORE_SCREENSHOT_CAPTURE_PLAN_MODE_REQUEST_BOUND_RDP_RUNNER,
      requestedSurface: inferRequestedSurface(runtimePlan),
      preset: runtimePlan.preset,
      routePath: runtimePlan.routePath,
      expectedTitle: runtimePlan.expectedTitle,
      width: runtimePlan.width,
      height: runtimePlan.height,
      captureTruth: runtimePlan.captureTruth,
      stateSummary: runtimePlan.stateSummary,
      operatorNote: runtimePlan.operatorNote,
    };
  }

  return {
    filename,
    captureMode: STORE_SCREENSHOT_CAPTURE_PLAN_MODE_MANUAL_OPERATOR_CAPTURE,
    requestedSurface: STORE_SCREENSHOT_CAPTURE_PLAN_SURFACE_UNKNOWN,
    manualReason:
      "No request-bound RDP capture plan entry exists for this screenshot slot, so it remains manual until one truthful automation path is defined.",
  };
}

export function buildStoreScreenshotCapturePlanEntries({
  captureAutomationMode,
  requiredScreenshotFilenames,
}) {
  return normalizeStringArray(requiredScreenshotFilenames).map((filename) =>
    buildRequestCapturePlanEntry({ captureAutomationMode, filename }),
  );
}

export function buildStoreScreenshotCapturePlanDocument({
  requestId,
  requestCreatedAt,
  captureAutomationMode,
  requiredScreenshotFilenames,
}) {
  const entries = buildStoreScreenshotCapturePlanEntries({
    captureAutomationMode,
    requiredScreenshotFilenames,
  });

  return {
    requestId,
    requestCreatedAt,
    capturePlanSchemaVersion: STORE_SCREENSHOT_CAPTURE_PLAN_SCHEMA_VERSION,
    summary: {
      entryCount: entries.length,
      requestBoundRunnerCount: entries.filter(
        (entry) =>
          entry.captureMode ===
          STORE_SCREENSHOT_CAPTURE_PLAN_MODE_REQUEST_BOUND_RDP_RUNNER,
      ).length,
      manualOperatorCount: entries.filter(
        (entry) =>
          entry.captureMode ===
          STORE_SCREENSHOT_CAPTURE_PLAN_MODE_MANUAL_OPERATOR_CAPTURE,
      ).length,
    },
    entries,
  };
}
