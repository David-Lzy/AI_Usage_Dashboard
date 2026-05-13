# Phase 242 - Detail Surfaces CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a narrow maintenance slice; it splits shared sidepanel detail-field and detail-note CSS ownership and does not change runtime behavior

## Goal

Continue reducing the oversized `material-theme.css` file by moving shared detail field and detail note supporting-surface styles into a focused sidepanel-only theme module.

## Scope

- add `src/sidepanel/theme/detail-surfaces.css`
- move `detail-grid`, `detail-field`, and `detail-note` CSS out of `material-theme.css`
- import `detail-surfaces.css` from the side-panel entry after `material-theme.css` and before operator-workspace modules that compose with detail-note classes
- keep the popup entry free of sidepanel-only detail-surface CSS
- preserve the existing provider-detail and Settings diagnostic surface semantics

## Preserved Boundaries

- do not change provider detail, Settings diagnostics, interaction-audit, or theme-recovery TypeScript behavior
- do not change provider data, sync behavior, source-selection order, or truth labels
- do not change dashboard provider-card, popup progress, Settings appearance, or store screenshot behavior
- do not split `SettingsPage.tsx`, `App.tsx`, popup, or localization files in this slice

## Completed Work

- Extracted shared sidepanel detail-surface CSS into `src/sidepanel/theme/detail-surfaces.css`.
- Added the side-panel import after `material-theme.css`.
- Added `npm run phase242:review` to verify import ordering, moved CSS markers, closeout documentation, provider-detail visual checks, and Settings diagnostic detail-note checks.

## Verification

- `npm run phase242:review`
- `npm run phase241:review`
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
