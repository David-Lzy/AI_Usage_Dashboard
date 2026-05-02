# Phase 244 - Form Controls CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a narrow maintenance slice; it splits sidepanel form-control CSS ownership and does not change runtime behavior

## Goal

Continue reducing the oversized `material-theme.css` file by moving shared sidepanel form-field, Material select, editable number combobox, and switch-row styling into a focused sidepanel-only theme module.

## Scope

- add `src/sidepanel/theme/form-controls.css`
- move `form-field`, `material-select`, `editable-number-combobox`, and `switch-row` CSS out of `material-theme.css`
- import `form-controls.css` from the side-panel entry after `detail-surfaces.css` and before Settings/source-card/operator modules that use those controls
- keep the popup entry free of sidepanel-only form-control CSS
- preserve the existing Settings and operator-workspace form-control semantics

## Preserved Boundaries

- do not change Settings, interaction-audit, theme-recovery, MaterialSelect, or EditableNumberCombobox TypeScript behavior
- do not change provider data, sync behavior, source-selection order, page-binding behavior, or truth labels
- do not change popup, dashboard provider cards, usage progress, detail surfaces, or source-card styling in this slice
- do not split `SettingsPage.tsx`, `App.tsx`, popup, or localization files in this slice

## Completed Work

- Extracted shared sidepanel form-control CSS into `src/sidepanel/theme/form-controls.css`.
- Added the side-panel import after `detail-surfaces.css`.
- Added `npm run phase244:review` to verify import ordering, moved CSS markers, closeout documentation, compact Settings form-control visual checks, and wide Settings form-control visual checks.

## Verification

- `npm run phase244:review`
- `npm run phase243:review`
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
