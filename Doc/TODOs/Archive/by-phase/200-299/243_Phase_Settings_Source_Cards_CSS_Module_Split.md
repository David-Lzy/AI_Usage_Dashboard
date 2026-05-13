# Phase 243 - Settings Source Cards CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a narrow maintenance slice; it splits Settings source-card CSS ownership and does not change runtime behavior

## Goal

Continue reducing the oversized `material-theme.css` file by moving Settings source-card, source-session, disclosure, and diagnostic-row styling into a focused sidepanel-only theme module.

## Scope

- add `src/sidepanel/theme/settings-source-cards.css`
- move `source-card` visual, disclosure, diagnostic, reduced-motion, and compact responsive CSS out of `material-theme.css`
- import `settings-source-cards.css` from the side-panel entry after `detail-surfaces.css` and before later operator/Settings modules
- keep the popup entry free of Settings source-card CSS
- preserve the existing Source Connections Settings UI and diagnostic disclosure semantics

## Preserved Boundaries

- do not change Settings TypeScript behavior, source selection, source ordering, provider data, sync behavior, or truth labels
- do not change popup appearance, dashboard provider cards, usage progress, detail surfaces, or operator workspaces in this slice
- do not split `SettingsPage.tsx`, `App.tsx`, popup, or localization files in this slice

## Completed Work

- Extracted Settings source-card CSS into `src/sidepanel/theme/settings-source-cards.css`.
- Added the side-panel import after `detail-surfaces.css`.
- Added `npm run phase243:review` to verify import ordering, moved CSS markers, closeout documentation, compact Settings source-card visual checks, and wide Settings source-card visual checks.

## Verification

- `npm run phase243:review`
- `npm run phase242:review`
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
