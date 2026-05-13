# Phase 355 - Popup Featured Section Component

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

Move the toolbar popup no-featured-provider featured-section and empty-state rendering out of `PopupApp.tsx` into one focused component.

## Scope

- Add a dedicated popup featured-section component under `src/popup/`.
- Keep featured-section model construction and display gating owned by `PopupApp.tsx`.
- Preserve existing visible copy, CSS classes, heading levels, and `data-theme-local-surface` hooks.

## Preserved Boundaries

- No popup view-model, provider, storage, routing, theme, release package, or Chrome automation changes.
- No copy rewrite or CSS changes.
- No behavior change to featured-provider cards, guidance cards, setup coverage, snapshot status, action cards, or surface roles.

## Acceptance

- `PopupApp.tsx` renders the no-featured-provider featured section through the new component.
- The new component is read-only and does not own featured-section model decisions.
- Existing section classes, empty-state classes, labels, heading levels, and theme hooks remain unchanged.

## Planned Verification

- `npm run typecheck`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion Summary

- Added `PopupFeaturedSection` for the toolbar popup no-featured-provider featured section and empty-state card.
- Kept featured-section model construction and display gating owned by `PopupApp.tsx`.
- Preserved existing visible copy, CSS classes, heading levels, and `data-theme-local-surface` hooks.

## Verification

- `npm run typecheck`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Follow-Up

- None. Future featured-section behavior changes should use a behavior phase if they alter empty-state decisions, copy, ordering, or featured-provider semantics.
