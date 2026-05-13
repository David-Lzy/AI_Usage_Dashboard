# Phase 326 - Popup Hide Provider Action Helper

## Goal

Move popup "hide provider" action dispatch out of `PopupApp.tsx` and make the provider-disable success and failure branches testable.

## Scope

- Extract the popup hide-provider message dispatch into a popup helper.
- Preserve the existing `app:set-provider-enabled` message shape with `enabled: false`.
- Keep routing and non-hide guidance actions unchanged.
- Add focused tests for success and message-bus failure.

## Preserved Boundaries

- Do not change provider visibility semantics or Settings enable/disable behavior.
- Do not change popup copy, action labels, or card rendering.
- Do not change app message schemas.

## Acceptance

- `PopupApp.tsx` delegates hide-provider behavior to a tested helper.
- Hide-provider success returns the updated `AppState`.
- Hide-provider failure returns the existing message-bus error.
- Non-hide guidance action routing remains owned by the existing popup route/source helpers.

## Planned Verification

- `npm run test -- --run src/popup/popup-hide-provider-action.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion

Completed on 2026-05-13.

Summary:

- Added `src/popup/popup-hide-provider-action.ts` to own popup provider-disable dispatch.
- Updated `PopupApp.tsx` to delegate hide-provider behavior while leaving non-hide routing unchanged.
- Added focused tests for successful provider disable and message-bus failure handling.

Verification:

- `npm run test -- --run src/popup/popup-hide-provider-action.test.ts`
- `npm run typecheck`
