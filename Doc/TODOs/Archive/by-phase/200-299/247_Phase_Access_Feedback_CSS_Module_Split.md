# Phase 247 - Access Feedback CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a narrow maintenance slice; it splits sidepanel-only access and feedback CSS ownership and does not change runtime behavior

## Goal

Continue reducing the oversized `material-theme.css` file by moving permission prompt, credential state/action, and toast feedback styling into a focused sidepanel-only theme module.

## Scope

- add `src/sidepanel/theme/access-feedback.css`
- move `app-toast-enter`, `permission-prompt`, `credential-*`, and `toast` CSS out of `material-theme.css`
- import `access-feedback.css` from the side-panel entry after `material-theme.css`
- keep the popup entry free of sidepanel-only access-feedback CSS
- preserve existing Settings credential card layout, credential action wrapping, and save-toast behavior

## Preserved Boundaries

- do not change Settings TypeScript behavior, saved preferences, credential storage, permissions, provider data, sync behavior, or truth labels
- do not change popup, dashboard provider cards, provider detail, operator workspaces, or store screenshot workflows in this slice
- do not split `SettingsPage.tsx`, `App.tsx`, or localization files in this slice

## Completed Work

- Extracted sidepanel-only permission, credential, and toast CSS into `src/sidepanel/theme/access-feedback.css`.
- Added the side-panel import after `material-theme.css`.
- Added `npm run phase247:review` to verify import ordering, moved CSS markers, closeout documentation, and compact/wide Settings access-feedback visual checks.

## Verification

- `npm run phase247:review`
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
