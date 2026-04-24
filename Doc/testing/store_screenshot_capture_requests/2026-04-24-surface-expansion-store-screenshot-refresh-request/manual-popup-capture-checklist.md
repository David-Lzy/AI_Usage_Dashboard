# Manual Popup Capture Checklist - 2026-04-24-surface-expansion-store-screenshot-refresh-request

Date: 2026-04-24

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
  - `Doc/testing/store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/manual-popup-notes-overlay.template.json`
- handoff:
  - `manual-capture-handoff.md`
- popup import command:
  - `npm run store:import-manual-screenshot-captures -- --request-id 2026-04-24-surface-expansion-store-screenshot-refresh-request --source-dir <native-toolbar-popup-capture-dir>`
- popup import with notes command:
  - `npm run store:import-manual-screenshot-captures -- --request-id 2026-04-24-surface-expansion-store-screenshot-refresh-request --source-dir <native-toolbar-popup-capture-dir> --notes-file Doc/testing/store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/manual-popup-notes-overlay.template.json`
- completion command:
  - `npm run store:complete-screenshot-capture-request -- --request-id 2026-04-24-surface-expansion-store-screenshot-refresh-request`

## Manual Popup Slots

- `01-toolbar-first-quick-glance.png`
  - slot: Toolbar-first quick glance
  - claim: one click gives a compact, readable AI usage snapshot
  - must show: popup header, top summary, setup coverage, featured provider, and badge-compatible quick-glance framing
  - preferred size: `640x400`
  - fallback size: `640x400`
- `02-setup-guidance.png`
  - slot: Setup guidance
  - claim: the product tells the user what to do next instead of only showing raw usage cards
  - must show: guidance card, setup stage, and stateful CTA
  - preferred size: `640x400`
  - fallback size: `640x400`
- `03-honest-contract-or-policy-only.png`
  - slot: Honest contract-only or policy-only state
  - claim: the extension is honest about provider coverage and does not fake live precision
  - must show: setup or contract story without pretending unsupported live data exists
  - preferred size: `640x400`
  - fallback size: `640x400`

## Operator Checklist

1. Capture the three native-toolbar popup screenshots using the exact filenames listed above.
2. Edit the generated popup-notes overlay template in place and replace every placeholder `not_reviewed` note with truthful popup-specific note content.
3. Run the popup import command with `--notes-file` pointing at that edited template.
4. Refresh the handoff and verify `manualCaptureMissingCount = 0`, `manualNoteIncompleteCount = 0`, and `archiveReady = yes` before completing the request.
