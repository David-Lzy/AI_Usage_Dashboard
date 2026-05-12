# Phase 350 - Popup Guidance Card Component

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

Move the toolbar popup guidance-card rendering out of `PopupApp.tsx` into one focused component.

## Scope

- Add a dedicated popup guidance-card component under `src/popup/`.
- Keep guidance-card model creation, action routing, settings focus calculation, and popup load state owned by `PopupApp.tsx`.
- Preserve existing visible copy, action behavior, CSS classes, tone mapping, and `data-theme-local-surface` hooks.

## Preserved Boundaries

- No popup view-model, provider, storage, routing, theme, release package, or Chrome automation changes.
- No copy rewrite or CSS changes.
- No behavior change to setup coverage, snapshot status, action cards, or featured-provider cards.

## Acceptance

- `PopupApp.tsx` renders the no-featured-provider guidance card through the new component.
- The new component delegates the guidance action through a route-owned callback.
- Existing guidance card classes, labels, badge tone, button hooks, and focused Settings handoff remain unchanged.

## Planned Verification

- `npm run typecheck`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion Summary

- Added `PopupGuidanceCardSection` for the toolbar popup no-featured-provider guidance card.
- Kept guidance-card model construction, settings-focus selection, action routing, and load state owned by `PopupApp.tsx`.
- Preserved existing visible copy, tone mapping, `StatusBadge` rendering, button behavior, CSS classes, and `data-theme-local-surface` hooks.

## Verification

- `npm run typecheck`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Follow-Up

- None. Future guidance-card behavior changes should use a behavior phase if they alter settings-focus targeting, action routing, copy, tone selection, or button semantics.
