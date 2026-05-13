# Phase 251 - Chips CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a narrow maintenance slice; it splits shared chip CSS ownership and does not change runtime behavior

## Goal

Continue reducing the oversized `material-theme.css` file by moving shared token, status, and meta chip styles into a focused CSS module imported by both sidepanel and popup surfaces.

## Scope

- add `src/sidepanel/theme/chips.css`
- move `token-chip`, `status-chip*`, and `meta-chip*` CSS out of `material-theme.css`
- import `chips.css` from both the side-panel and popup entries after `buttons.css`
- preserve dashboard hero chip, provider status chips, provider metadata chips, Settings source metadata chips, and popup metadata chips

## Preserved Boundaries

- do not change provider data, source labels, sync behavior, popup models, Settings disclosure behavior, or truth labels
- do not change chip text, chip tone mapping, provider cards, popup layout, operator workspaces, or store screenshot workflows in this slice
- do not split `SettingsPage.tsx`, `App.tsx`, or localization files in this slice

## Completed Work

- Extracted shared token, status, and meta chip CSS into `src/sidepanel/theme/chips.css`.
- Added side-panel and popup imports after `buttons.css`.
- Added `npm run phase251:review` to verify import ordering, moved CSS markers, closeout documentation, and compact dashboard/popup chip visual checks.

## Verification

- `npm run phase251:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- split remaining shared surface and typography primitives out of `material-theme.css`
- split `SettingsPage.tsx`
- split `App.tsx`
- split `src/shared/localized-copy.ts`
