# Manual Popup Capture Checklist - 2026-05-16-public-store-readiness-request

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Document class:

- generated operational ledger

Freshness model:

- maintained current reference

Status note:

- this file is the current popup-capture checklist for one manual screenshot request
- refresh or regenerate it through the request refresh path instead of editing it by hand

## Request-Bound Paths

- notes overlay template:
  - `Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/manual-popup-notes-overlay.template.json`
- handoff:
  - `manual-capture-handoff.md`
- popup import command:
  - `npm run store:import-manual-screenshot-captures -- --request-id 2026-05-16-public-store-readiness-request --source-dir <native-toolbar-popup-capture-dir>`
- popup import with notes command:
  - `npm run store:import-manual-screenshot-captures -- --request-id 2026-05-16-public-store-readiness-request --source-dir <native-toolbar-popup-capture-dir> --notes-file Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/manual-popup-notes-overlay.template.json`
- completion command:
  - `npm run store:complete-screenshot-capture-request -- --request-id 2026-05-16-public-store-readiness-request`

## Manual Popup Slots

- `01-popup-quick-glance.png`
  - slot: 01-popup-quick-glance.png
  - claim: capture the truthful runtime state requested for this screenshot slot
  - must show: the actual extension surface needed to support the current store storyboard
  - preferred size: `n/a`
  - fallback size: `n/a`
- `02-dashboard-overview.png`
  - slot: 02-dashboard-overview.png
  - claim: capture the truthful runtime state requested for this screenshot slot
  - must show: the actual extension surface needed to support the current store storyboard
  - preferred size: `n/a`
  - fallback size: `n/a`
- `03-provider-detail-contract.png`
  - slot: 03-provider-detail-contract.png
  - claim: capture the truthful runtime state requested for this screenshot slot
  - must show: the actual extension surface needed to support the current store storyboard
  - preferred size: `n/a`
  - fallback size: `n/a`
- `04-settings-overview-and-theme.png`
  - slot: 04-settings-overview-and-theme.png
  - claim: capture the truthful runtime state requested for this screenshot slot
  - must show: the actual extension surface needed to support the current store storyboard
  - preferred size: `n/a`
  - fallback size: `n/a`
- `05-settings-quick-setup-and-appearance.png`
  - slot: 05-settings-quick-setup-and-appearance.png
  - claim: capture the truthful runtime state requested for this screenshot slot
  - must show: the actual extension surface needed to support the current store storyboard
  - preferred size: `n/a`
  - fallback size: `n/a`

## Operator Checklist

1. Capture the three native-toolbar popup screenshots using the exact filenames listed above.
2. Edit the generated popup-notes overlay template in place and replace every placeholder `not_reviewed` note with truthful popup-specific note content.
3. Run the popup import command with `--notes-file` pointing at that edited template.
4. Refresh the handoff and verify `manualCaptureMissingCount = 0`, `manualNoteIncompleteCount = 0`, and `archiveReady = yes` before completing the request.
