# Phase 223 - Popup Empty Percent Progress Suppression

Date: 2026-04-29

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-29

## Goal

Suppress popup empty percent progress for unavailable measurements.

## Completed Work

- Added `shouldShowPopupProviderProgress`.
- Updated popup featured-provider progress rendering to hide top-level percent progress when both `used` and `remaining` are unavailable.
- Kept structured usage-window progress visible.
- Kept documented non-percent totals visible as indeterminate context.
- Added focused popup progress visibility tests.

## Preserved Boundaries

- No provider parser, adapter, source-selection, popup action, credential, host-permission, or page-binding behavior changed.
- Structured Codex/Cursor usage-window progress remains visible when a real window measurement exists.
- The Phase 222 popup source-page recovery action remains unchanged.

## Verification

- `npm run test -- --run src/popup/progress-visibility.test.ts src/popup/view-models.test.ts src/sidepanel/usage-progress-visibility.test.ts`
- `npm run typecheck`
- `npm run phase223:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Refresh the RDP Chrome popup after post-push build and verify a Codex capture-unavailable card no longer displays an `Unknown` percent circle.
