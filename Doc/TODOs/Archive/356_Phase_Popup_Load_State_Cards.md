# Phase 356 - Popup Load State Cards

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

Move the toolbar popup loading and error-state card rendering out of `PopupApp.tsx` into focused components.

## Scope

- Add dedicated popup loading and error card components under `src/popup/`.
- Keep state loading, retry behavior, dashboard/settings route actions, and message-bus reads owned by `PopupApp.tsx`.
- Preserve existing visible copy, button ordering, CSS classes, and shell/card structure.

## Preserved Boundaries

- No popup view-model, provider, storage, routing, theme, release package, or Chrome automation changes.
- No copy rewrite or CSS changes.
- No behavior change to ready-state popup cards.

## Acceptance

- `PopupApp.tsx` renders loading and error states through the new components.
- The error card delegates retry, dashboard open, and settings open actions through route-owned callbacks.
- Existing loading/error classes, labels, button ordering, and shell structure remain unchanged.

## Planned Verification

- `npm run typecheck`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion Summary

- Added `PopupLoadingCard` and `PopupErrorCard` for toolbar popup load-state rendering.
- Kept state loading, retry behavior, dashboard/settings route actions, and message-bus reads owned by `PopupApp.tsx`.
- Preserved existing visible copy, button ordering, CSS classes, and shell/card structure.

## Verification

- `npm run typecheck`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Follow-Up

- None. Future load-state behavior changes should use a behavior phase if they alter retry behavior, route actions, copy, or loading/error state semantics.
