# Store Screenshot Capture Archive - 2026-04-24-first-real-store-screenshot-capture-request-archive

Date: 2026-04-23

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
  - `2026-04-24-first-real-store-screenshot-capture-request-archive`
- archived at:
  - `2026-04-23T20:00:18.890Z`
- source request:
  - `2026-04-24-first-real-store-screenshot-capture-request`
- runtime source:
  - `RDP Chrome unpacked extension`
- preferred size:
  - `1280x800`
- fallback size:
  - `640x400`

## Source References

- request README:
  - `Doc/testing/store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/README.md`
- request manifest:
  - `Doc/testing/store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/capture-request.json`
- request notes:
  - `Doc/testing/store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/capture-notes.json`
- source capture dir:
  - `Doc/testing/store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/captures`
- source notes:
  - `Doc/testing/store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/capture-notes.json`
- storyboard:
  - `Doc/Store/Store_Screenshot_Storyboard.md`
- baseline pack README:
  - `Doc/testing/store_screenshot_capture_packs/2026-04-24-toolbar-storyboard-baseline/README.md`
- baseline pack plan:
  - `Doc/testing/store_screenshot_capture_packs/2026-04-24-toolbar-storyboard-baseline/capture-plan.json`

## Capture Notes

- archive notes file:
  - `Doc/testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/capture-notes.json`
- reviewed screenshots:
  - `5/5`
- truth-boundary screenshots:
  - `5`

- `01-toolbar-first-quick-glance.png`
  - capture truth: `approximated_runtime_state`
  - state summary: Popup shows a compact quick-glance state with Cursor, Claude Code, and Codex visible in one healthy toolbar-first view.
  - operator note: This is a real extension-mode popup capture from a request-bound seeded runtime state, not a direct live sync snapshot from the current operator session.
- `02-setup-guidance.png`
  - capture truth: `approximated_runtime_state`
  - state summary: Popup shows mixed setup blockers with Cursor missing host access and Codex missing workspace credentials.
  - operator note: This screenshot uses a request-bound seeded runtime state to keep the setup-guidance story stable while staying inside the real unpacked extension runtime.
- `03-honest-contract-or-policy-only.png`
  - capture truth: `policy_only_fallback`
  - state summary: Popup shows Gemini as the only visible provider in a truthful policy-only contract state.
  - operator note: This screenshot intentionally uses Gemini's shipped policy-only fallback instead of implying a live per-user usage source that the product does not currently support.
- `04-settings-and-setup-depth.png`
  - capture truth: `approximated_runtime_state`
  - state summary: Settings shows setup ownership in the deeper workspace with the same mixed blockers carried over from the popup story.
  - operator note: This is a real side-panel runtime capture from a request-bound seeded state used to keep the Settings setup story consistent during store screenshot review.
- `05-provider-or-dashboard-depth.png`
  - capture truth: `approximated_runtime_state`
  - state summary: Codex provider detail shows a truthful warning-state review surface beyond the popup.
  - operator note: This screenshot uses a request-bound seeded Codex warning state so the side panel can show deeper contract context without claiming it came from a current live analytics session.

## Archived Screenshots

- `01-toolbar-first-quick-glance.png`
  - archive path: `Doc/testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/screenshots/01-toolbar-first-quick-glance.png`
  - source path: `Doc/testing/store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/captures/01-toolbar-first-quick-glance.png`
- `02-setup-guidance.png`
  - archive path: `Doc/testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/screenshots/02-setup-guidance.png`
  - source path: `Doc/testing/store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/captures/02-setup-guidance.png`
- `03-honest-contract-or-policy-only.png`
  - archive path: `Doc/testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/screenshots/03-honest-contract-or-policy-only.png`
  - source path: `Doc/testing/store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/captures/03-honest-contract-or-policy-only.png`
- `04-settings-and-setup-depth.png`
  - archive path: `Doc/testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/screenshots/04-settings-and-setup-depth.png`
  - source path: `Doc/testing/store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/captures/04-settings-and-setup-depth.png`
- `05-provider-or-dashboard-depth.png`
  - archive path: `Doc/testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/screenshots/05-provider-or-dashboard-depth.png`
  - source path: `Doc/testing/store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/captures/05-provider-or-dashboard-depth.png`

## Truth Note

- this archive preserves one real screenshot-capture set exactly as provided to the completion command
- it also preserves the operator truth notes that describe approximation, omission, fallback, or exact-runtime boundaries for each screenshot
- it does not claim store submission, localization completeness, or broader provider support beyond what the screenshots actually show

