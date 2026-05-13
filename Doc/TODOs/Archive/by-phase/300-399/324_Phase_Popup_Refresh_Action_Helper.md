# Phase 324 - Popup Refresh Action Helper

## Goal

Move popup refresh plus host-access request behavior out of `PopupApp.tsx` and make its user-visible error branches testable.

## Scope

- Extract refresh action behavior into a popup helper.
- Preserve optional host-access request before refresh when exactly one enabled provider needs access.
- Preserve denied-access and browser-rejection error messages.
- Add focused tests for direct refresh, denied access, thrown access request, and granted access followed by refresh.

## Preserved Boundaries

- Do not change refresh message type or sync engine behavior.
- Do not change host-access candidate selection rules.
- Do not change popup layout, copy outside the existing error messages, or provider action selection.
- Do not change Chrome permission request semantics.

## Acceptance

- `PopupApp.tsx` delegates refresh behavior to a tested helper.
- Direct refresh still sends `app:request-refresh`.
- Denied host access returns the existing reopen-and-grant message without requesting refresh.
- Browser host-access rejection returns the existing rejection/fallback error message.

## Planned Verification

- `npm run test -- --run src/popup/popup-refresh-action.test.ts src/shared/host-access-request.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion

Completed on 2026-05-13.

Summary:

- Added `src/popup/popup-refresh-action.ts` to own popup refresh orchestration, including optional host-access request, denied-access messaging, browser rejection fallback, and standard `app:request-refresh` dispatch.
- Updated `PopupApp.tsx` to delegate refresh handling to the helper while preserving load-state and refresh-pending behavior.
- Added focused tests for direct refresh, denied access, non-`Error` browser rejection fallback, `Error` message passthrough, and granted host-access refresh continuation.

Verification:

- `npm run test -- --run src/popup/popup-refresh-action.test.ts src/shared/host-access-request.test.ts`
- `npm run typecheck`
