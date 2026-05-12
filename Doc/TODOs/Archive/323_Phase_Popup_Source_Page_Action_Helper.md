# Phase 323 - Popup Source-Page Action Helper

## Goal

Move popup source-page recovery action behavior out of `PopupApp.tsx` and make the core branches testable.

## Scope

- Extract provider source-page opening, tab reuse, page binding, and existing-tab refresh behavior into a popup helper.
- Preserve fallback to provider detail for unsupported or non-shipped session-page plans.
- Preserve no-tab-control fallback to direct `window.open`.
- Add focused tests for unsupported provider fallback, direct window open, existing-tab binding plus refresh, and created-tab binding.

## Preserved Boundaries

- Do not change provider source contracts, route hints, or source-page rollout stages.
- Do not change page-binding payload semantics.
- Do not change reload-on-capture-unavailable rules.
- Do not change popup UI copy, card selection, Settings focus routing, or hide-provider behavior.

## Acceptance

- `PopupApp.tsx` imports source-page action behavior instead of defining it inline.
- Existing matched tabs still bind, refresh, activate, and close the popup.
- Created tabs still bind without immediate refresh and close the popup.
- Providers without shipped session-page plans still fall back to provider detail.

## Planned Verification

- `npm run test -- --run src/popup/popup-source-page-actions.test.ts src/popup/source-page-tab-selection.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-13.

Summary:

- Added `src/popup/popup-source-page-actions.ts` for popup source-page recovery routing, page binding, existing-tab refresh, and created-tab binding.
- Added focused tests for unsupported provider fallback, direct window open, existing-tab binding plus refresh, and created-tab binding.
- Removed source-page recovery implementation details from `PopupApp.tsx` while preserving popup action behavior.

Verification:

- `npm run test -- --run src/popup/popup-source-page-actions.test.ts src/popup/source-page-tab-selection.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
