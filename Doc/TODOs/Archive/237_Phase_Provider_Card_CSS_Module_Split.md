# Phase 237 - Provider Card CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is the first narrow maintenance slice after Phase 236; it splits CSS ownership only and does not change runtime behavior

## Goal

Start reducing the oversized `material-theme.css` file by moving the freshly stabilized dashboard provider-card visual contract into a focused theme module.

## Scope

- add `src/sidepanel/theme/provider-card.css`
- move provider shell/card layout, state, summary, progress-surface, metadata, and footer-action CSS from `material-theme.css`
- import `provider-card.css` after `material-theme.css` from the side-panel entry so provider-card action overrides keep their cascade order
- keep popup-specific provider card CSS in `material-theme.css`
- keep shared chip, progress, button, top bar, Settings, and popup CSS in `material-theme.css`

## Preserved Boundaries

- do not change `ProviderCard` TypeScript behavior
- do not change provider data, sync behavior, source-selection order, or truth labels
- do not redesign the Phase 236 provider-card visuals
- do not split Settings, App, popup, or localization files in this slice

## Completed Work

- Extracted provider-card CSS into `src/sidepanel/theme/provider-card.css`.
- Added the side-panel import after `material-theme.css` to preserve the existing cascade for primary provider-card actions.
- Added `npm run phase237:review` to verify import ordering, moved CSS markers, and closeout documentation.
- Re-ran the Phase 236 visual review after the split to prove dashboard provider cards still render correctly at compact and full-page widths.

## Verification

- `npm run phase237:review`
- `npm run phase236:review`
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
