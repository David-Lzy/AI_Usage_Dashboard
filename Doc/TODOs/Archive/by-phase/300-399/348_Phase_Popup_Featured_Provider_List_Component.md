# Phase 348 - Popup Featured Provider List Component

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13

## Goal

Move the popup featured-provider card list rendering out of `PopupApp.tsx` into one focused component.

## Scope

- Add a dedicated popup featured-provider list component under `src/popup/`.
- Keep popup action execution, settings-focus selection, app-state refresh, and provider visibility changes owned by `PopupApp.tsx`.
- Preserve existing card ordering, progress rendering, status badges, button ordering, CSS classes, and `data-popup-featured*` / first-card hooks.

## Preserved Boundaries

- No popup view-model, provider, storage, routing, source-page, theme-toggle, release package, or Chrome automation changes.
- No copy rewrite or CSS changes.
- No changes to provider progress visibility rules.

## Acceptance

- `PopupApp.tsx` renders featured provider cards through the new component.
- The component delegates action clicks through the route-owned callback with the same settings-focus behavior.
- Existing featured-card classes, data hooks, action labels, and progress rendering remain unchanged.

## Planned Verification

- `npm run typecheck`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion Summary

- Added `PopupFeaturedProviderList` for featured-provider card rendering in the toolbar popup.
- Kept popup action execution, settings-focus selection, app-state refresh, and provider visibility changes owned by `PopupApp.tsx`.
- Preserved existing card ordering, progress rendering, status badges, button ordering, CSS classes, and featured-card data hooks.

## Verification

- `npm run typecheck`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Follow-Up

- None. Future featured-provider list changes should use a behavior phase if they alter action routing, settings-focus targeting, progress visibility, or provider-card semantics.
