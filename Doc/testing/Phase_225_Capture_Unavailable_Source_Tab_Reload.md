# Phase 225 - Capture Unavailable Source Tab Reload

Date: 2026-04-29

Document class:

- closed evidence

## Goal

Make source-page recovery handle `capture_unavailable` by reloading the already-open source tab before binding and refreshing the provider.

## Why This Phase Exists

Phase 224 removed the extra manual refresh step when source-page recovery found an existing provider tab. The `capture_unavailable` state still had one avoidable operator step: the UI told the operator to reload the source page, but the recovery action did not do that reload itself.

## What Changed

- Added a shared reload policy for existing-tab recovery in the `capture_unavailable` state.
- Added a tab reload helper that waits for the reloaded source tab to finish before the provider refresh is requested.
- Updated dashboard and provider-detail source-page recovery to reload unreadable existing source tabs, then save the binding and refresh.
- Updated popup source-page recovery to carry the source-state kind, reload unreadable existing source tabs, save the binding, refresh, and only then focus the provider tab.
- Preserved the no-reload path for logged-out pages, open-page-required pages, and newly-opened source pages.

## Verification

- `npm run test -- --run src/shared/source-page-recovery.test.ts src/popup/view-models.test.ts src/sidepanel/components/ProviderCard.test.tsx src/sidepanel/routes/ProviderDetailPage.test.tsx`
- `npm run typecheck`
- `npm run phase225:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Use the next RDP Chrome source-page recovery pass with a real `capture_unavailable` Codex or Cursor tab to confirm the action reloads the source tab and refreshes without requiring a separate manual reload.
