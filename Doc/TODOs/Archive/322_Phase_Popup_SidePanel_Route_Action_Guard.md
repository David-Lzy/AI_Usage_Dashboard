# Phase 322 - Popup SidePanel Route Action Guard

## Goal

Guard the Chrome sidePanel branch used by popup dashboard, Settings, and provider-detail handoffs.

## Scope

- Add focused tests for `openSidePanelRoute` with an active tab.
- Add focused tests for the current-window fallback when no active tab id is available.
- Keep this phase test-only unless the existing sidePanel branch is broken.

## Preserved Boundaries

- Do not change sidePanel route paths or full-page route paths.
- Do not change popup layout, copy, or provider action selection.
- Do not change Chrome `sidePanel.setOptions`, `sidePanel.open`, or popup close semantics.

## Acceptance

- Active-tab sidePanel opens set tab-scoped options and close the popup.
- Window fallback sidePanel opens set window-scoped options and close the popup.
- Existing preview and full-page popup route-action tests still pass.

## Planned Verification

- `npm run test -- --run src/popup/popup-route-actions.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-13.

Summary:

- Added Chrome sidePanel active-tab coverage for focused Settings routes.
- Added Chrome sidePanel current-window fallback coverage for dashboard routes.
- Kept the phase test-only because the existing sidePanel branch already matched the intended behavior.

Verification:

- `npm run test -- --run src/popup/popup-route-actions.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
