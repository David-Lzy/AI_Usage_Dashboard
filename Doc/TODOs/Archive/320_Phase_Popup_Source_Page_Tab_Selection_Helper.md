# Phase 320 - Popup Source-Page Tab Selection Helper

## Goal

Make popup source-page recovery tab selection explicit and testable.

## Scope

- Extract the existing preferred source-page tab selection logic from `PopupApp.tsx`.
- Preserve exact-route precedence, active-tab priority, recent-tab fallback, and invalid-tab filtering.
- Add focused tests for the pure helper.

## Preserved Boundaries

- Do not change source-page route hints, page-binding payloads, reload rules, or refresh semantics.
- Do not change popup UI copy or provider support claims.
- Do not change Chrome tab query/update/create behavior.

## Acceptance

- `PopupApp.tsx` delegates source-page tab selection to a tested helper.
- Exact preferred-route tabs continue to win over broader route-hint matches.
- Active tabs win over inactive tabs, then newest `lastAccessed` wins.
- Tabs without numeric ids are not selected for binding/update.

## Planned Verification

- `npm run test -- --run src/popup/source-page-tab-selection.test.ts src/popup/settings-route-targets.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-13.

Summary:

- Added `src/popup/source-page-tab-selection.ts` for the popup source-page recovery tab-selection contract.
- Added tests for exact-route precedence, active-tab priority, recency fallback, and ignoring tabs without numeric ids.
- Replaced the inline `PopupApp.tsx` selection block with the shared helper while preserving binding/update/create behavior.

Verification:

- `npm run test -- --run src/popup/source-page-tab-selection.test.ts src/popup/settings-route-targets.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
