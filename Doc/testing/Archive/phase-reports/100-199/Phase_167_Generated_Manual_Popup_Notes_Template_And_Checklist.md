# Phase 167 - Generated Manual Popup Notes Template And Checklist

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- historical snapshot

Status note:

- completed on `2026-04-24` and archived in the numbered phase queue

## Goal

Turn the refreshed screenshot request's remaining manual popup work into a fuller generated intake bundle by adding a request-bound popup-notes overlay template and popup-capture checklist.

## Why This Slice Existed

- `Phase 166` already shipped one repo-backed popup import workflow
- the remaining manual popup pass still needed one operator-facing notes scaffold instead of a handwritten overlay file
- the final archive-completion path should use generated request-bound inputs wherever possible before the real native-toolbar popup pass happens

## What Changed

- request packages with manual popup slots now also generate:
  - `manual-popup-notes-overlay.template.json`
  - `manual-popup-capture-checklist.md`
- the generated handoff bundle now exposes:
  - `manualNotesTemplatePath`
  - `manualChecklistPath`
- the `manualImportWithNotesCommand` now points at the generated request-bound notes template path instead of only one generic placeholder
- added one repeatable review:
  - [phase167-store-screenshot-manual-template-review.mjs](../../../../../scripts/phase167-store-screenshot-manual-template-review.mjs)
- updated the runbook and `Direction 10.3` docs so the real popup-capture pass now has a generated `capture -> edit template -> import -> refresh handoff -> archive` path

## Result

The refreshed pending request now ships one clearer manual popup intake bundle:

- [manual-popup-notes-overlay.template.json](../../../store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/manual-popup-notes-overlay.template.json)
- [manual-popup-capture-checklist.md](../../../store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/manual-popup-capture-checklist.md)

This keeps the popup notes scaffold request-bound and generated instead of asking the operator to invent it from scratch.

## Truth Boundary

- this slice does not fabricate popup screenshots
- it does not fulfill or archive the refreshed request by itself
- current screenshot truth still remains `1 pending request / 1 archived set`
- it only generates the remaining operator aids needed before the real popup capture pass

## Verification

- `npm run store:refresh-screenshot-capture-request-packages`
- `npm run phase167:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Follow-Up

- perform the real manual native-toolbar popup capture pass for slots `1` through `3`
- edit the generated popup-notes template with truthful popup-specific note content
- import those popup assets and notes, then archive the refreshed request once the generated handoff reports `archiveReady = true`
