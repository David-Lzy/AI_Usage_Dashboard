# Phase 219 - Capture Unavailable Source State

Date: 2026-04-29

Document class:

- closed evidence

## Goal

Surface `page_session.capture_unavailable` as its own provider source display state instead of folding it into the generic sync-error bucket.

## Why This Phase Exists

Phase 217 made unreadable open Codex or Cursor usage tabs a distinct adapter/session-page result. The UI still collapsed that diagnostic into `sync_error`, which made the operator lose the difference between a provider sync failure and an open page that Chrome extension scripting could not read.

## What Changed

- Added `capture_unavailable` to the shared provider source-state model.
- Added English and zh-CN source-state labels and fallback details.
- Mapped typed `page_session.capture_unavailable` diagnostics to the new source state.
- Showed the state chip on dashboard provider cards.
- Carried the state through sidepanel, popup, and theme-recovery review view models.
- Updated localized diagnostic copy to say the page could not be read by the extension, not that parser output drifted.

## Verification

- `npm run test -- --run src/shared/provider-sources.test.ts src/shared/i18n.test.ts src/popup/view-models.test.ts src/sidepanel/view-models.test.ts`
- `npm run typecheck`
- `npm run phase219:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

The next real RDP Chrome operator pass should include an authenticated Codex or Cursor usage tab that is deliberately unreadable or extension-blocked, then confirm the visible card says page capture is unavailable rather than showing a generic sync problem.
