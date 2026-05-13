# Phase 249 - App Shell CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a narrow maintenance slice; it splits shared app-shell CSS ownership and does not change runtime behavior

## Goal

Continue reducing the oversized `material-theme.css` file by moving the shared sidepanel/popup app-shell layout plus shell-entry keyframes into a focused CSS module imported by both surfaces.

## Scope

- add `src/sidepanel/theme/app-shell.css`
- move `app-surface-enter`, `app-disclosure-enter`, full-page entry keyframes, `.app-shell`, full-page shell layout, reduced-motion shell handling, and compact shell padding out of `material-theme.css`
- import `app-shell.css` from both the side-panel and popup entries after `material-theme.css`
- preserve compact sidepanel, full-page dashboard, and popup shell layout behavior

## Preserved Boundaries

- do not change React routing, full-page entry state, popup data behavior, provider data, sync behavior, or truth labels
- do not change top app bar, provider cards, form controls, Settings navigation, operator workspaces, or store screenshot workflows in this slice
- do not split `SettingsPage.tsx`, `App.tsx`, or localization files in this slice

## Completed Work

- Extracted shared app-shell layout and entry keyframes into `src/sidepanel/theme/app-shell.css`.
- Added the side-panel and popup imports after `material-theme.css`.
- Added `npm run phase249:review` to verify import ordering, moved CSS markers, closeout documentation, compact sidepanel visual checks, full-page shell visual checks, and popup shell visual checks.

## Verification

- `npm run phase249:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- split remaining shared button/chip/surface primitives out of `material-theme.css`
- split `SettingsPage.tsx`
- split `App.tsx`
- split `src/shared/localized-copy.ts`
