# Phase 325 - Popup Theme Toggle Action Helper

## Goal

Move popup quick theme-toggle update behavior out of `PopupApp.tsx` and make the update-settings success and failure branches testable.

## Scope

- Extract the popup theme-toggle message dispatch into a popup helper.
- Preserve `buildQuickThemeToggle` as the source of the next theme mode.
- Preserve the existing `app:update-settings` message shape.
- Add focused tests for light-to-dark, dark-to-light/system-resolved behavior, and update failure handling.

## Preserved Boundaries

- Do not change theme resolution semantics, labels, or Settings behavior.
- Do not change popup layout, button copy, or pending-state timing.
- Do not change storage or app message schemas.

## Acceptance

- `PopupApp.tsx` delegates quick theme-toggle updates to a tested helper.
- The helper sends only `{ themeMode: nextMode }` through `app:update-settings`.
- Update success returns the new `AppState`.
- Update failure returns the existing message-bus error.

## Planned Verification

- `npm run test -- --run src/popup/popup-theme-toggle-action.test.ts src/shared/theme.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion

Completed on 2026-05-13.

Summary:

- Added `src/popup/popup-theme-toggle-action.ts` to own popup quick theme-toggle update dispatch.
- Updated `PopupApp.tsx` to delegate theme update behavior while preserving the existing pending-state and error-state transitions.
- Added focused tests for light-to-dark, dark-to-light, system-resolved-dark-to-light, and update failure branches.

Verification:

- `npm run test -- --run src/popup/popup-theme-toggle-action.test.ts src/shared/theme.test.ts`
- `npm run typecheck`
