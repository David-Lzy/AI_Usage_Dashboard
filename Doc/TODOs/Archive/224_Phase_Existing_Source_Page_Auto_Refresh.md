# Phase 224 - Existing Source Page Auto Refresh

Date: 2026-04-29

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-29

## Goal

Remove the extra manual refresh step when existing source-page recovery can safely reuse an already-open provider tab.

## Completed Work

- Added `shouldRefreshAfterSourcePageRecovery` as the shared policy for recovery refresh timing.
- Updated sidepanel source-page recovery to refresh immediately after a matched existing source tab is bound.
- Updated popup source-page recovery to refresh immediately after a matched existing source tab is bound.
- Preserved the manual-refresh path for newly-opened source pages.
- Added focused tests for the existing-tab versus created-tab policy.

## Preserved Boundaries

- No provider parser, content capture, host permission, credential, or source-selection behavior changed.
- Newly-opened provider pages still do not auto-refresh because the operator may need to log in or navigate first.
- Deferred session-page tracks still do not expose direct source-page recovery.
- Capture-unavailable and empty-percent display semantics from phases 219 through 223 remain unchanged.

## Verification

- `npm run test -- --run src/shared/source-page-recovery.test.ts`
- `npm run typecheck`
- `npm run phase224:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Run a real Chrome source-page recovery click pass with an existing Codex or Cursor source tab and confirm the binding plus refresh completes in one action.
