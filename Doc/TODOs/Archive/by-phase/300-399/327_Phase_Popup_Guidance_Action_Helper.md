# Phase 327 - Popup Guidance Action Helper

## Goal

Move popup non-hide guidance action routing out of `PopupApp.tsx` and make the action-to-route mapping testable in one focused helper.

## Scope

- Extract settings, dashboard, provider-detail, and source-page guidance action dispatch into a popup helper.
- Preserve focused Settings routing through the existing `SettingsRouteFocus` option.
- Preserve hide-provider as a no-op in this helper because provider-disable behavior is owned by Phase 326's helper.
- Add focused tests for each action kind.

## Preserved Boundaries

- Do not change popup action labels, card rendering, or provider selection.
- Do not change popup route helpers or source-page action semantics.
- Do not change hide-provider enable/disable behavior.

## Acceptance

- `PopupApp.tsx` delegates non-hide guidance routing to a tested helper.
- Settings actions preserve optional focus.
- Dashboard, provider-detail, and source-page actions still call the same underlying helpers.
- Hide-provider actions remain ignored by the guidance router.

## Planned Verification

- `npm run test -- --run src/popup/popup-guidance-action.test.ts src/popup/popup-route-actions.test.ts src/popup/popup-source-page-actions.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion

Completed on 2026-05-13.

Summary:

- Added `src/popup/popup-guidance-action.ts` to own non-hide popup guidance routing.
- Updated `PopupApp.tsx` to delegate settings, dashboard, provider-detail, and source-page actions while leaving hide-provider behavior on the dedicated provider-disable helper.
- Added focused tests for settings focus, dashboard, provider-detail, source-page, and hide-provider no-op branches.

Verification:

- `npm run test -- --run src/popup/popup-guidance-action.test.ts src/popup/popup-route-actions.test.ts src/popup/popup-source-page-actions.test.ts`
- `npm run typecheck`
