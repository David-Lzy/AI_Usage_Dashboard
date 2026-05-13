# Phase 224 - Existing Source Page Auto Refresh

Date: 2026-04-29

Document class:

- closed evidence

## Goal

Refresh a shipped session-page provider immediately when source-page recovery reuses an already-open matching provider tab.

## Why This Phase Exists

Phase 221 and Phase 222 added direct source-page recovery actions across dashboard, provider detail, and popup. When the recovery action found an already-open logged-in tab, it saved the binding but still required a separate manual refresh. That left an unnecessary extra step in the common recovery path.

## What Changed

- Added a shared source-page recovery policy for existing-tab versus newly-opened-tab recovery.
- Updated dashboard/provider-detail recovery so a matched existing source tab is bound and then refreshed immediately.
- Updated popup recovery so a matched existing source tab is bound and then refreshed before the popup closes.
- Kept newly-opened source pages on the existing manual-refresh path, because they may still need login or navigation before capture.
- Added focused policy coverage for the refresh/no-refresh split.

## Verification

- `npm run test -- --run src/shared/source-page-recovery.test.ts`
- `npm run typecheck`
- `npm run phase224:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Use the next real Chrome recovery pass to click `Open source page` while a matching Codex or Cursor source page is already open, and confirm the provider refresh completes without a second manual action.
