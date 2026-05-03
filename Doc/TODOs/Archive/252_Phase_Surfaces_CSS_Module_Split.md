# Phase 252 - Surfaces CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a narrow maintenance slice; it splits shared surface CSS ownership and does not change runtime behavior

## Goal

Continue reducing the oversized `material-theme.css` file by moving shared hero-card and status-card surface styles into a focused CSS module imported by both sidepanel and popup surfaces.

## Scope

- add `src/sidepanel/theme/surfaces.css`
- move `hero-card`, `status-card*`, `status-card__header`, toned status-card text treatment, and compact surface padding out of `material-theme.css`
- import `surfaces.css` from both the side-panel and popup entries after `chips.css`
- preserve dashboard hero surfaces, Settings status-card surfaces, popup status-card surfaces, toned warning/error surfaces, and compact responsive card padding

## Preserved Boundaries

- do not change provider data, sync behavior, source-page recovery, popup models, Settings behavior, or truth labels
- do not change provider-card-specific surfaces, detail-field surfaces, operator workspaces, or store screenshot workflows in this slice
- do not split `SettingsPage.tsx`, `App.tsx`, or localization files in this slice

## Completed Work

- Extracted shared hero-card and status-card CSS into `src/sidepanel/theme/surfaces.css`.
- Added side-panel and popup imports after `chips.css`.
- Added `npm run phase252:review` to verify import ordering, moved CSS markers, closeout documentation, and compact dashboard/settings/popup surface visual checks.

## Verification

- `npm run phase252:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- split remaining shared typography and summary/dashboard layout primitives out of `material-theme.css`
- split `SettingsPage.tsx`
- split `App.tsx`
- split `src/shared/localized-copy.ts`
