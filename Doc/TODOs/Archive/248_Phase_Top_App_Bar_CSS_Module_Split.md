# Phase 248 - Top App Bar CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a narrow maintenance slice; it splits sidepanel-only top app bar CSS ownership and does not change runtime behavior

## Goal

Continue reducing the oversized `material-theme.css` file by moving sidepanel Top App Bar layout, sticky, title, action-row, and responsive styling into a focused sidepanel-only theme module.

## Scope

- add `src/sidepanel/theme/top-app-bar.css`
- move `top-app-bar*` CSS out of `material-theme.css`
- import `top-app-bar.css` from the side-panel entry after `access-feedback.css`
- keep the popup entry free of sidepanel-only Top App Bar CSS
- preserve existing Settings sticky top bar, section-nav bottom slot, compact action wrapping, and title overflow behavior

## Preserved Boundaries

- do not change TopBar TypeScript behavior, navigation, Settings sticky-section tracking, provider data, sync behavior, or truth labels
- do not change popup, dashboard provider cards, provider detail data rendering, operator workspaces, or store screenshot workflows in this slice
- do not split `SettingsPage.tsx`, `App.tsx`, or localization files in this slice

## Completed Work

- Extracted sidepanel-only Top App Bar CSS into `src/sidepanel/theme/top-app-bar.css`.
- Added the side-panel import after `access-feedback.css`.
- Added `npm run phase248:review` to verify import ordering, moved CSS markers, closeout documentation, and compact/wide Settings Top App Bar visual checks.

## Verification

- `npm run phase248:review`
- `npm run phase235:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- split more shared theme primitives out of `material-theme.css`
- split `SettingsPage.tsx`
- split `App.tsx`
- split `src/shared/localized-copy.ts`
