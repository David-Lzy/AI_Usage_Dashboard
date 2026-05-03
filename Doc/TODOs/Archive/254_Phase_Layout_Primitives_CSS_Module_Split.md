# Phase 254 - Layout Primitives CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a narrow maintenance slice; it moves shared summary and dashboard layout primitives out of the base Material theme file

## Goal

Finish the safe CSS ownership split for the remaining non-base selectors in `material-theme.css` by moving shared layout primitives into a focused module imported by both sidepanel and popup surfaces.

## Scope

- add `src/sidepanel/theme/layout-primitives.css`
- move `token-panel`, `summary-strip`, `summary-pill*`, `dashboard-section`, `dashboard-section__header`, and narrow-width layout rules out of `material-theme.css`
- import `layout-primitives.css` from both the side-panel and popup entries after `surfaces.css`
- preserve popup-specific summary overrides by keeping `popup-theme.css` after the shared layout module
- preserve provider-card-specific responsive overrides by keeping `provider-card.css` after the shared layout module

## Preserved Boundaries

- do not change provider data, sync behavior, source-page recovery, popup models, Settings behavior, or truth labels
- do not change provider-card CSS ownership beyond preserving its existing post-layout override order
- do not split `SettingsPage.tsx`, `App.tsx`, or localization files in this slice

## Completed Work

- Extracted shared summary, token-panel, dashboard-section, and compact layout primitive CSS into `src/sidepanel/theme/layout-primitives.css`.
- Added side-panel and popup imports after `surfaces.css`.
- Added `npm run phase254:review` to verify package wiring, import ordering, moved CSS markers, closeout documentation, and compact dashboard/settings/popup layout visual checks.

## Verification

- `npm run phase254:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- split `SettingsPage.tsx`
- split `App.tsx`
- split `src/shared/localized-copy.ts`
