export const STORE_SCREENSHOT_SEED_ROUTE_HASH = "#debug-store-screenshot-seed";
export const STORE_SCREENSHOT_SEED_APPLIED_TITLE =
  "AI Usage Dashboard Screenshot Seed Applied";
export const STORE_SCREENSHOT_SEED_CLEARED_TITLE =
  "AI Usage Dashboard Screenshot Seed Cleared";

export function buildStoreScreenshotSeedRoutePath(preset) {
  return `src/sidepanel/index.html?preset=${encodeURIComponent(preset)}${STORE_SCREENSHOT_SEED_ROUTE_HASH}`;
}

export const STORE_SCREENSHOT_RUNTIME_CAPTURE_PLAN = [
  {
    filename: "01-toolbar-first-quick-glance.png",
    preset: "toolbar-first-quick-glance",
    routePath: "src/popup/index.html",
    expectedTitle: "AI Usage Dashboard Popup",
    width: 640,
    height: 400,
    captureTruth: "approximated_runtime_state",
    stateSummary:
      "Popup shows a compact quick-glance state with Cursor, Claude Code, and Codex visible in one healthy toolbar-first view.",
    operatorNote:
      "This is a real extension-mode popup capture from a request-bound seeded runtime state, not a direct live sync snapshot from the current operator session.",
  },
  {
    filename: "02-setup-guidance.png",
    preset: "setup-guidance",
    routePath: "src/popup/index.html",
    expectedTitle: "AI Usage Dashboard Popup",
    width: 640,
    height: 400,
    captureTruth: "approximated_runtime_state",
    stateSummary:
      "Popup shows mixed setup blockers with Cursor missing host access and Codex missing workspace credentials.",
    operatorNote:
      "This screenshot uses a request-bound seeded runtime state to keep the setup-guidance story stable while staying inside the real unpacked extension runtime.",
  },
  {
    filename: "03-honest-contract-or-policy-only.png",
    preset: "honest-contract-or-policy-only",
    routePath: "src/popup/index.html",
    expectedTitle: "AI Usage Dashboard Popup",
    width: 640,
    height: 400,
    captureTruth: "policy_only_fallback",
    stateSummary:
      "Popup shows Gemini as the only visible provider in a truthful policy-only contract state.",
    operatorNote:
      "This screenshot intentionally uses Gemini's shipped policy-only fallback instead of implying a live per-user usage source that the product does not currently support.",
  },
  {
    filename: "04-settings-and-setup-depth.png",
    preset: "settings-and-setup-depth",
    routePath: "src/sidepanel/index.html?surface=full-page#settings",
    expectedTitle: "AI Usage Dashboard",
    width: 1280,
    height: 800,
    captureTruth: "approximated_runtime_state",
    stateSummary:
      "Full-page Settings shows setup ownership in the deeper workspace with the same mixed blockers carried over from the popup story.",
    operatorNote:
      "This is a real full-page shell capture from a request-bound seeded state used to keep the Settings setup story consistent during refreshed store screenshot review.",
  },
  {
    filename: "05-provider-or-dashboard-depth.png",
    preset: "provider-or-dashboard-depth",
    routePath: "src/sidepanel/index.html?surface=full-page#provider-detail/codex",
    expectedTitle: "AI Usage Dashboard",
    width: 1280,
    height: 800,
    captureTruth: "approximated_runtime_state",
    stateSummary:
      "Full-page Codex provider detail shows a truthful warning-state review surface beyond the popup.",
    operatorNote:
      "This screenshot uses a request-bound seeded Codex warning state so the full-page shell can show deeper contract context without claiming it came from a current live analytics session.",
  },
];

export function getStoreScreenshotCapturePlanEntry(filename) {
  return (
    STORE_SCREENSHOT_RUNTIME_CAPTURE_PLAN.find((entry) => entry.filename === filename) ??
    null
  );
}
