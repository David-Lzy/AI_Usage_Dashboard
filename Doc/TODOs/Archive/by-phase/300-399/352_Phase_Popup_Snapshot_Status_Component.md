# Phase 352 - Popup Snapshot Status Component

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

Move the toolbar popup snapshot-status card rendering out of `PopupApp.tsx` into one focused component.

## Scope

- Add a dedicated popup snapshot-status component under `src/popup/`.
- Keep snapshot-status model construction and display gating owned by `PopupApp.tsx`.
- Preserve existing visible copy, tone mapping, `StatusBadge` rendering, CSS classes, and `data-theme-local-surface` hooks.

## Preserved Boundaries

- No popup view-model, provider, storage, routing, theme, release package, or Chrome automation changes.
- No copy rewrite or CSS changes.
- No behavior change to guidance cards, setup coverage, action cards, or featured-provider cards.

## Acceptance

- `PopupApp.tsx` renders the no-featured-provider snapshot-status card through the new component.
- The new component is read-only and does not own snapshot-status gating or mutation behavior.
- Existing snapshot-status classes, labels, badge tone, and hooks remain unchanged.

## Planned Verification

- `npm run typecheck`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion Summary

- Added `PopupSnapshotStatusSection` for the toolbar popup snapshot-status card.
- Kept snapshot-status model construction and display gating owned by `PopupApp.tsx`.
- Preserved existing visible copy, tone mapping, `StatusBadge` rendering, CSS classes, and `data-theme-local-surface` hooks.

## Verification

- `npm run typecheck`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Follow-Up

- None. Future snapshot-status behavior changes should use a behavior phase if they alter display gating, copy, tone selection, or freshness/sync semantics.
