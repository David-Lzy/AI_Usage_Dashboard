# Store Screenshot Capture Archive - 2026-05-04-rc11-mixed-store-candidate-archive

Date: 2026-05-04

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
  - `2026-05-04-rc11-mixed-store-candidate-archive`
- archived at:
  - `2026-05-04T04:12:44.065Z`
- source request:
  - `2026-04-24-surface-expansion-store-screenshot-refresh-request`
- runtime source:
  - `RDP Chrome unpacked extension`
- preferred size:
  - `1280x800`
- fallback size:
  - `640x400`

## Source References

- request README:
  - `Doc/testing/store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/README.md`
- request manifest:
  - `Doc/testing/store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/capture-request.json`
- request notes:
  - `Doc/testing/store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/capture-notes.json`
- source capture dir:
  - `Doc/testing/store_screenshot_candidate_intake/2026-05-04-rc11-mixed-store-candidate/captures`
- source notes:
  - `Doc/testing/store_screenshot_candidate_intake/2026-05-04-rc11-mixed-store-candidate/capture-notes.json`
- storyboard:
  - `Doc/Store/Store_Screenshot_Storyboard.md`
- baseline pack README:
  - `Doc/testing/store_screenshot_capture_packs/2026-04-24-toolbar-storyboard-baseline/README.md`
- baseline pack plan:
  - `Doc/testing/store_screenshot_capture_packs/2026-04-24-toolbar-storyboard-baseline/capture-plan.json`

## Capture Notes

- archive notes file:
  - `Doc/testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/capture-notes.json`
- reviewed screenshots:
  - `5/5`
- truth-boundary screenshots:
  - `3`

- `01-toolbar-first-quick-glance.png`
  - capture truth: `exact_runtime_capture`
  - state summary: Native Chrome toolbar popup quick glance captured from the RDP Chrome unpacked extension, showing Codex usage-window rings and the current action badge state.
- `02-setup-guidance.png`
  - capture truth: `exact_runtime_capture`
  - state summary: Full-page dashboard overview captured from the RDP Chrome unpacked extension, showing the product promise, summary counts, and the beginning of the provider-card list.
- `03-honest-contract-or-policy-only.png`
  - capture truth: `other_truth_boundary`
  - state summary: Full-page Codex provider card captured from the RDP Chrome unpacked extension, showing live window-scoped remaining percentages and reset timing.
  - operator note: The screenshot intentionally shows Codex usage-window percentages and reset timing instead of claiming one absolute plan-wide remaining balance.
- `04-settings-and-setup-depth.png`
  - capture truth: `other_truth_boundary`
  - state summary: Full-page Settings source card captured from the RDP Chrome unpacked extension, showing the Cursor personal session-page route, availability summary, and source controls.
  - operator note: The screenshot intentionally preserves the Cursor personal contract boundary: billing-period context is visible, but no exact remaining included-request counter is claimed.
- `05-provider-or-dashboard-depth.png`
  - capture truth: `other_truth_boundary`
  - state summary: Chrome side panel provider-detail route captured from the RDP Chrome unpacked extension, showing the compact Codex source snapshot and detail hierarchy.
  - operator note: This is a real side-panel capture triggered through the shipped popup path; it uses Codex window-scoped usage semantics rather than a plan-wide absolute balance.

## Archived Screenshots

- `01-toolbar-first-quick-glance.png`
  - archive path: `Doc/testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/screenshots/01-toolbar-first-quick-glance.png`
  - source path: `Doc/testing/store_screenshot_candidate_intake/2026-05-04-rc11-mixed-store-candidate/captures/01-toolbar-first-quick-glance.png`
- `02-setup-guidance.png`
  - archive path: `Doc/testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/screenshots/02-setup-guidance.png`
  - source path: `Doc/testing/store_screenshot_candidate_intake/2026-05-04-rc11-mixed-store-candidate/captures/02-setup-guidance.png`
- `03-honest-contract-or-policy-only.png`
  - archive path: `Doc/testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/screenshots/03-honest-contract-or-policy-only.png`
  - source path: `Doc/testing/store_screenshot_candidate_intake/2026-05-04-rc11-mixed-store-candidate/captures/03-honest-contract-or-policy-only.png`
- `04-settings-and-setup-depth.png`
  - archive path: `Doc/testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/screenshots/04-settings-and-setup-depth.png`
  - source path: `Doc/testing/store_screenshot_candidate_intake/2026-05-04-rc11-mixed-store-candidate/captures/04-settings-and-setup-depth.png`
- `05-provider-or-dashboard-depth.png`
  - archive path: `Doc/testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/screenshots/05-provider-or-dashboard-depth.png`
  - source path: `Doc/testing/store_screenshot_candidate_intake/2026-05-04-rc11-mixed-store-candidate/captures/05-provider-or-dashboard-depth.png`

## Truth Note

- this archive preserves one real screenshot-capture set exactly as provided to the completion command
- it also preserves the operator truth notes that describe approximation, omission, fallback, or exact-runtime boundaries for each screenshot
- it does not claim store submission, localization completeness, or broader provider support beyond what the screenshots actually show

