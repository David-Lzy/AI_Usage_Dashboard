# Phase 225 - Capture Unavailable Source Tab Reload

Date: 2026-04-29

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-29

## Goal

Turn the `capture_unavailable` recovery guidance into a direct source-tab reload plus provider refresh action.

This is the capture-unavailable source-tab reload slice for shipped session-page recovery.

## Completed Work

- Added `shouldReloadBeforeSourcePageRecoveryRefresh` for existing-tab capture-unavailable recovery.
- Added `reloadSourcePageTabBeforeRefresh` to request a source-tab reload and wait for completion.
- Updated sidepanel source-page recovery so dashboard and provider detail reload unreadable existing source tabs before binding and refreshing.
- Updated popup source-page recovery so source-state kind is carried through the action model.
- Updated popup recovery order so binding and refresh complete before the popup focuses the provider tab.
- Added focused coverage for the reload policy and popup source-state action metadata.

## Preserved Boundaries

- No provider parser, source-selection, diagnostic classification, host-permission, credential, or page-binding lifecycle behavior changed.
- Logged-out source pages do not auto-reload because reload does not solve authentication.
- Newly-opened source pages still wait for the operator to finish login or navigation before manual refresh.
- Deferred session-page tracks still do not expose direct source-page recovery.

## Verification

- `npm run test -- --run src/shared/source-page-recovery.test.ts src/popup/view-models.test.ts src/sidepanel/components/ProviderCard.test.tsx src/sidepanel/routes/ProviderDetailPage.test.tsx`
- `npm run typecheck`
- `npm run phase225:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Run a real Chrome click pass against a Codex or Cursor `capture_unavailable` tab and confirm source-page recovery performs the tab reload and provider refresh in one operator action.
