# Phase 354 - Popup Surface Roles Component

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

Move the toolbar popup surface-roles card rendering out of `PopupApp.tsx` into one focused component.

## Scope

- Add a dedicated popup surface-roles component under `src/popup/`.
- Keep surface-roles model construction and display gating owned by `PopupApp.tsx`.
- Preserve existing visible copy, CSS classes, `data-popup-surface-roles-*` hooks, and `data-theme-local-surface` hooks.

## Preserved Boundaries

- No popup view-model, provider, storage, routing, theme, release package, or Chrome automation changes.
- No copy rewrite or CSS changes.
- No behavior change to guidance cards, setup coverage, snapshot status, action cards, or featured-provider cards.

## Acceptance

- `PopupApp.tsx` renders the no-featured-provider surface-roles card through the new component.
- The new component is read-only and does not own surface-route model decisions.
- Existing surface-roles classes, labels, copy hooks, and theme hook remain unchanged.

## Planned Verification

- `npm run typecheck`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion Summary

- Added `PopupSurfaceRolesSection` for the toolbar popup surface-roles card.
- Kept surface-roles model construction and display gating owned by `PopupApp.tsx`.
- Preserved existing visible copy, CSS classes, `data-popup-surface-roles-*` hooks, and `data-theme-local-surface` hooks.

## Verification

- `npm run typecheck`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Follow-Up

- None. Future surface-roles behavior changes should use a behavior phase if they alter route-story decisions, copy, or surface ownership semantics.
