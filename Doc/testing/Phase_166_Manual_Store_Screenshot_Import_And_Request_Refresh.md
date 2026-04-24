# Phase 166 - Manual Store Screenshot Import And Request Refresh

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- historical snapshot

Status note:

- completed on `2026-04-24` and archived in the numbered phase queue

## Goal

Turn the refreshed screenshot request's remaining native-toolbar popup work into one repo-backed import path so real manual popup captures can be copied back into the pending request package without hand-editing generated files.

## Why This Slice Existed

- `Phase 165` already exposed the remaining popup work through one dedicated manual handoff and archive-readiness preflight
- the repo still lacked one supported path for bringing real popup screenshots and popup-note updates back into the pending request package
- the next archive slice should use one truthful request-bound import workflow instead of ad-hoc file copying and manual JSON edits

## What Changed

- added one manual screenshot import command:
  - [import-store-screenshot-manual-captures.mjs](../../scripts/import-store-screenshot-manual-captures.mjs)
- extended the generated manual handoff bundle so it now exposes:
  - `manualImportCommand`
  - `manualImportWithNotesCommand`
  - `manualCaptureMissingCount`
  - `manualNoteIncompleteCount`
  - `manualReadyCount`
- added one repeatable review:
  - [phase166-store-screenshot-manual-import-review.mjs](../../scripts/phase166-store-screenshot-manual-import-review.mjs)
- updated the screenshot runbook and `Direction 10.3` docs so the import path is now the documented bridge between real native-toolbar popup capture and the pending request package

## Result

The refreshed pending request now supports one repo-backed import-and-refresh flow:

- popup screenshots can be copied from one external native-toolbar capture directory into the request package `captures/` folder
- an optional popup-note overlay can be merged into `capture-notes.json` at the same time
- the request README plus manual handoff refresh automatically after import, so `manualCaptureMissingCount`, `manualNoteIncompleteCount`, `manualReadyCount`, and `archiveReady` all stay generated instead of hand-maintained

Current request evidence:

- [manual-capture-handoff.md](../testing/store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/manual-capture-handoff.md)
- [manual-capture-handoff.json](../testing/store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/manual-capture-handoff.json)

## Truth Boundary

- this slice does not fabricate native-toolbar popup screenshots
- it does not fulfill or archive the refreshed request by itself
- current screenshot truth therefore still remains `1 pending request / 1 archived set`
- it only adds the supported path that the real popup-capture pass should use before archive completion

## Verification

- `npm run store:refresh-screenshot-capture-request-packages`
- `npm run phase166:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Follow-Up

- perform the real manual native-toolbar popup capture pass for slots `1` through `3`
- import those popup files and any popup-note overlay through the new manual import command
- complete and archive the refreshed screenshot request only after the generated handoff reports `archiveReady = true`
