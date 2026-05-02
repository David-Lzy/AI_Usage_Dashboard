# Phase 246 - Settings Navigation CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a narrow maintenance slice; it splits Settings navigation CSS ownership and does not change runtime behavior

## Goal

Continue reducing the oversized `material-theme.css` file by moving Settings page layout, sticky section navigation, section scroll-offset, and back-to-top FAB styling into a focused sidepanel-only theme module.

## Scope

- add `src/sidepanel/theme/settings-navigation.css`
- move `settings-grid`, `settings-list`, `settings-overview`, `settings-section-anchor`, `settings-section-nav`, `settings-nav-chip`, and `settings-back-to-top-fab` CSS out of `material-theme.css`
- import `settings-navigation.css` from the side-panel entry after `form-controls.css` and before Settings source-card modules
- keep the popup entry free of Settings navigation CSS
- preserve the existing Settings sticky navigation, active-chip, responsive grid, and back-to-top behavior

## Preserved Boundaries

- do not change Settings TypeScript behavior, section tracking, scroll behavior, source selection, provider data, sync behavior, or truth labels
- do not change popup, dashboard provider cards, provider detail, operator workspaces, or store screenshot workflows in this slice
- do not split `SettingsPage.tsx`, `App.tsx`, or localization files in this slice

## Completed Work

- Extracted Settings navigation CSS into `src/sidepanel/theme/settings-navigation.css`.
- Added the side-panel import after `form-controls.css`.
- Added `npm run phase246:review` to verify import ordering, moved CSS markers, closeout documentation, compact Settings navigation visual checks, and wide Settings navigation visual checks.

## Verification

- `npm run phase246:review`
- `npm run phase235:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- split more theme areas out of `material-theme.css`
- split `SettingsPage.tsx`
- split `App.tsx`
- split `src/shared/localized-copy.ts`
