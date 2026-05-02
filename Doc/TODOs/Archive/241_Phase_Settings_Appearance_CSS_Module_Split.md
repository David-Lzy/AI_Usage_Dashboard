# Phase 241 - Settings Appearance CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a narrow maintenance slice; it splits Settings appearance-preview CSS ownership and does not change runtime behavior

## Goal

Continue reducing the oversized `material-theme.css` file by moving Settings theme-customization and popup-appearance preview styles into a focused sidepanel-only theme module.

## Scope

- add `src/sidepanel/theme/settings-appearance.css`
- move `theme-customization`, `theme-preview`, and `popup-appearance-preview` CSS out of `material-theme.css`
- import `settings-appearance.css` from the side-panel entry after `interaction-audit.css`
- keep the popup entry free of Settings-only appearance CSS
- update the older Phase 212 review gate so it follows the new CSS ownership boundary

## Preserved Boundaries

- do not change Settings TypeScript behavior, popup appearance preference persistence, theme settings, or preview copy
- do not change provider data, sync behavior, source-selection order, or truth labels
- do not change dashboard provider-card, popup progress, interaction-audit, theme-recovery, or store screenshot behavior
- do not split `SettingsPage.tsx`, `App.tsx`, popup, or localization files in this slice

## Completed Work

- Extracted Settings appearance CSS into `src/sidepanel/theme/settings-appearance.css`.
- Added the side-panel import after `interaction-audit.css` and before `theme-recovery.css`.
- Updated `npm run phase212:review` to verify the popup appearance preview CSS markers in the new module instead of the shared Material theme file.
- Added `npm run phase241:review` to verify import ordering, moved CSS markers, closeout documentation, and the live Settings appearance preview section.

## Verification

- `npm run phase241:review`
- `npm run phase212:review`
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
