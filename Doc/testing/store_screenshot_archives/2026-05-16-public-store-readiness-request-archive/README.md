# Store Screenshot Capture Archive - 2026-05-16-public-store-readiness-request-archive

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this package README records one archived screenshot capture set and should not be silently edited after archival except to correct factual mistakes
- the screenshots listed below are the durable archived evidence for this capture pass

## Archive Scope

- archive id:
  - `2026-05-16-public-store-readiness-request-archive`
- archived at:
  - `2026-05-16T06:32:32.545Z`
- source request:
  - `2026-05-16-public-store-readiness-request`
- runtime source:
  - `RDP Chrome unpacked extension, post-Phase 490 source build`
- preferred size:
  - `1280x800`
- fallback size:
  - `640x400`

## Source References

- request README:
  - `Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/README.md`
- request manifest:
  - `Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/capture-request.json`
- request notes:
  - `Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/capture-notes.json`
- source capture dir:
  - `Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/captures`
- source notes:
  - `Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/capture-notes.json`
- storyboard:
  - `Doc/Store/Store_Screenshot_Storyboard.md`
- baseline pack README:
  - `Doc/testing/store_screenshot_capture_packs/2026-04-24-toolbar-storyboard-baseline/README.md`
- baseline pack plan:
  - `Doc/testing/store_screenshot_capture_packs/2026-04-24-toolbar-storyboard-baseline/capture-plan.json`

## Capture Notes

- archive notes file:
  - `Doc/testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/capture-notes.json`
- reviewed screenshots:
  - `5/5`
- truth-boundary screenshots:
  - `5`

- `01-popup-quick-glance.png`
  - capture truth: `other_truth_boundary`
  - state summary: Toolbar popup app-window shows the current dark-mode quick-glance layout with provider cards, quota rings, and the settings/tab actions visible.
  - operator note: Captured from the real unpacked extension runtime in the RDP Chrome profile, then resized/cropped to the Chrome Web Store 1280x800 screenshot size without changing provider values or UI text.
- `02-dashboard-overview.png`
  - capture truth: `other_truth_boundary`
  - state summary: Full-page dashboard shows the current dark-mode provider overview with multiple providers, status cards, and quota progress visualization.
  - operator note: Captured from the real unpacked extension runtime in the RDP Chrome profile, then resized/cropped to 1280x800. Live quota/account values were not edited.
- `03-provider-detail-contract.png`
  - capture truth: `other_truth_boundary`
  - state summary: Codex provider detail shows the current contract-style quota rows, diagnostic sections, and source-truth boundaries in dark mode.
  - operator note: Captured from the real unpacked extension runtime in the RDP Chrome profile, then resized/cropped to 1280x800. Diagnostic/raw provider evidence remains product runtime content.
- `04-settings-overview-and-theme.png`
  - capture truth: `other_truth_boundary`
  - state summary: Full-page Settings shows overview, language/theme/sync controls, appearance controls, and current Material dark-mode styling.
  - operator note: Captured from the real unpacked extension runtime in the RDP Chrome profile, then resized/cropped to 1280x800. This is a dark-mode screenshot, not a fabricated light/dark split.
- `05-settings-quick-setup-and-appearance.png`
  - capture truth: `other_truth_boundary`
  - state summary: Settings quick-setup and appearance area shows the provider carousel, display actions, sync controls, toolbar badge/icon controls, and theme affordances.
  - operator note: Captured from the real unpacked extension runtime in the RDP Chrome profile, then resized/cropped to 1280x800. The page position is the operator's current settings scroll state.

## Archived Screenshots

- `01-popup-quick-glance.png`
  - archive path: `Doc/testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/screenshots/01-popup-quick-glance.png`
  - source path: `Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/captures/01-popup-quick-glance.png`
- `02-dashboard-overview.png`
  - archive path: `Doc/testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/screenshots/02-dashboard-overview.png`
  - source path: `Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/captures/02-dashboard-overview.png`
- `03-provider-detail-contract.png`
  - archive path: `Doc/testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/screenshots/03-provider-detail-contract.png`
  - source path: `Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/captures/03-provider-detail-contract.png`
- `04-settings-overview-and-theme.png`
  - archive path: `Doc/testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/screenshots/04-settings-overview-and-theme.png`
  - source path: `Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/captures/04-settings-overview-and-theme.png`
- `05-settings-quick-setup-and-appearance.png`
  - archive path: `Doc/testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/screenshots/05-settings-quick-setup-and-appearance.png`
  - source path: `Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/captures/05-settings-quick-setup-and-appearance.png`

## Truth Note

- this archive preserves one real screenshot-capture set exactly as provided to the completion command
- it also preserves the operator truth notes that describe approximation, omission, fallback, or exact-runtime boundaries for each screenshot
- it does not claim store submission, localization completeness, or broader provider support beyond what the screenshots actually show
