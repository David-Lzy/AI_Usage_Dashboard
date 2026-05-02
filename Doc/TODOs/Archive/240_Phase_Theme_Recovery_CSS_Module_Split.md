# Phase 240 - Theme Recovery CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a narrow maintenance slice; it splits sidepanel-only theme-recovery workspace CSS ownership and does not change runtime behavior

## Goal

Continue reducing the oversized `material-theme.css` file by moving theme-recovery workspace styles into a focused sidepanel-only theme module.

## Scope

- add `src/sidepanel/theme/theme-recovery.css`
- move `theme-recovery` shell, provider-list, link-group, copy-action, checklist, and export-grid CSS out of `material-theme.css`
- import `theme-recovery.css` from the side-panel entry after `interaction-audit.css`
- keep the popup entry free of theme-recovery CSS
- keep shared app shell, top bar, card, text-button, form, detail, Settings, popup, interaction-audit, usage-progress, and provider-card CSS in their existing modules

## Preserved Boundaries

- do not change theme-recovery TypeScript behavior, export schemas, request packages, or archive workflows
- do not change provider data, sync behavior, source-selection order, or truth labels
- do not change dashboard provider-card, popup progress, Settings, interaction-audit, or store screenshot behavior
- do not split Settings, App, popup, or localization files in this slice

## Completed Work

- Extracted theme-recovery workspace CSS into `src/sidepanel/theme/theme-recovery.css`.
- Added the side-panel import after `interaction-audit.css`, preserving the shared action-row base class used by the theme-recovery copy actions.
- Added `npm run phase240:review` to verify import ordering, moved CSS markers, closeout documentation, and the live debug theme-recovery route.

## Verification

- `npm run phase240:review`
- `npm run phase239:review`
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
