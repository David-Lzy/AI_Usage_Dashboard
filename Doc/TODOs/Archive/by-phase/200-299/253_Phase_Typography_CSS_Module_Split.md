# Phase 253 - Typography CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a narrow maintenance slice; it splits shared typography CSS ownership and does not change provider data or sync behavior

## Goal

Continue reducing the oversized `material-theme.css` file by moving shared text hierarchy, copy reset, list spacing, and compact headline rules into a focused CSS module imported by both sidepanel and popup surfaces.

## Scope

- add `src/sidepanel/theme/typography.css`
- move `section-label`, `display-headline`, `section-title`, `body-copy`, `supporting-copy`, `feature-list`, and `token-list` styling out of `material-theme.css`
- keep summary/dashboard layout primitives in `material-theme.css` for a later layout-focused split
- import `typography.css` from both the side-panel and popup entries after `chips.css` and before `surfaces.css`, preserving toned-surface override order
- add a focused review command that checks import order, moved CSS markers, closeout docs, and compact dashboard/settings/popup typography visuals

## Preserved Boundaries

- do not change provider data, sync behavior, source-page recovery, popup models, Settings behavior, or truth labels
- do not change provider-card-specific styling, summary-strip layout, dashboard layout primitives, or store screenshot workflows in this slice
- do not split `SettingsPage.tsx`, `App.tsx`, or localization files in this slice

## Completed Work

- Extracted shared typography and copy primitive CSS into `src/sidepanel/theme/typography.css`.
- Added side-panel and popup imports after `chips.css` and before `surfaces.css`.
- Added `npm run phase253:review` to verify package wiring, import ordering, moved CSS markers, closeout documentation, and compact dashboard/settings/popup typography visual checks.

## Verification

- `npm run phase253:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- split remaining summary/dashboard layout primitives out of `material-theme.css`
- split `SettingsPage.tsx`
- split `App.tsx`
- split `src/shared/localized-copy.ts`
