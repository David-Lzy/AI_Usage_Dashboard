# Phase 351 - Popup Setup Coverage Component

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

Move the toolbar popup setup-coverage card rendering out of `PopupApp.tsx` into one focused component.

## Scope

- Add a dedicated popup setup-coverage component under `src/popup/`.
- Keep setup-coverage model construction, settings focus calculation, action routing, and popup load state owned by `PopupApp.tsx`.
- Preserve existing visible copy, action behavior, `StatusBadge` fallback, summary strip rendering, CSS classes, ARIA labels, and `data-popup-*` / `data-theme-local-surface` hooks.

## Preserved Boundaries

- No popup view-model, provider, storage, routing, theme, release package, or Chrome automation changes.
- No copy rewrite or CSS changes.
- No behavior change to guidance cards, snapshot status, action cards, or featured-provider cards.

## Acceptance

- `PopupApp.tsx` renders the no-featured-provider setup-coverage card through the new component.
- The new component delegates setup-coverage actions through a route-owned callback.
- Existing setup-coverage classes, labels, action-chip behavior, `StatusBadge` fallback, summary grid, and focused Settings handoff remain unchanged.

## Planned Verification

- `npm run typecheck`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion Summary

- Added `PopupSetupCoverageSection` for the toolbar popup setup-coverage card.
- Kept setup-coverage model construction, settings-focus selection, action routing, and load state owned by `PopupApp.tsx`.
- Preserved existing visible copy, action-chip behavior, `StatusBadge` fallback, summary strip rendering, CSS classes, ARIA labels, and `data-popup-*` / `data-theme-local-surface` hooks.

## Verification

- `npm run typecheck`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Follow-Up

- None. Future setup-coverage behavior changes should use a behavior phase if they alter action-chip semantics, settings-focus targeting, summary values, copy, or tone selection.
