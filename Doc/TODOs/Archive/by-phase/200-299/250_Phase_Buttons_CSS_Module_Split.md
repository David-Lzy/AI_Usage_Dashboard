# Phase 250 - Buttons CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a narrow maintenance slice; it splits shared button CSS ownership and does not change runtime behavior

## Goal

Continue reducing the oversized `material-theme.css` file by moving shared icon-button and text-button styles into a focused CSS module imported by both sidepanel and popup surfaces.

## Scope

- add `src/sidepanel/theme/buttons.css`
- move `icon-button*`, `text-button*`, and `a.text-button` CSS out of `material-theme.css`
- import `buttons.css` from both the side-panel and popup entries after `app-shell.css`
- preserve sidepanel top-bar action buttons, sidepanel text actions, popup icon actions, popup text actions, and focus-visible treatment

## Preserved Boundaries

- do not change React action handlers, navigation, provider data, sync behavior, source-page recovery, or truth labels
- do not change top app bar layout, access-feedback overrides, popup layout, provider cards, operator workspaces, or store screenshot workflows in this slice
- do not split `SettingsPage.tsx`, `App.tsx`, or localization files in this slice

## Completed Work

- Extracted shared icon-button and text-button CSS into `src/sidepanel/theme/buttons.css`.
- Added side-panel and popup imports after `app-shell.css`.
- Added `npm run phase250:review` to verify import ordering, moved CSS markers, closeout documentation, and compact sidepanel/popup button visual checks.

## Verification

- `npm run phase250:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- split remaining shared chip and surface primitives out of `material-theme.css`
- split `SettingsPage.tsx`
- split `App.tsx`
- split `src/shared/localized-copy.ts`
