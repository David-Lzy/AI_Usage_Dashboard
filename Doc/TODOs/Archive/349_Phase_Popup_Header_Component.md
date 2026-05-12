# Phase 349 - Popup Header Component

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13

## Goal

Move the toolbar popup header rendering out of `PopupApp.tsx` into one focused component.

## Scope

- Add a dedicated popup header component under `src/popup/`.
- Keep refresh, theme-toggle, dashboard-tab opening, loading state, and theme-toggle pending state owned by `PopupApp.tsx`.
- Preserve existing visible copy, button ordering, disabled states, CSS classes, ARIA/title attributes, and `data-popup-*` / `data-theme-local-surface` hooks.

## Preserved Boundaries

- No popup view-model, provider, storage, routing, theme-toggle action, refresh action, release package, or Chrome automation changes.
- No copy rewrite or CSS changes.
- No changes to quick-theme-toggle selection.

## Acceptance

- `PopupApp.tsx` renders the main popup header through the new component.
- The new component delegates refresh, theme-toggle, and dashboard-tab clicks through route-owned callbacks.
- Existing header classes, labels, hooks, disabled behavior, and conditional header detail rendering remain unchanged.

## Planned Verification

- `npm run typecheck`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion Summary

- Added `PopupHeaderSection` for the toolbar popup header and primary header actions.
- Kept refresh, theme-toggle, dashboard-tab opening, loading state, and pending state owned by `PopupApp.tsx`.
- Preserved existing visible copy, button ordering, disabled states, ARIA/title attributes, CSS classes, and header data hooks.

## Verification

- `npm run typecheck`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Follow-Up

- None. Future popup header changes should use a behavior phase if they alter refresh behavior, theme-toggle behavior, dashboard-tab routing, disabled states, or header copy.
