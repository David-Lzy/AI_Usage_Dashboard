# Phase 245 - Popup Theme CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a narrow maintenance slice; it splits popup-only CSS ownership and does not change runtime behavior

## Goal

Continue reducing the oversized `material-theme.css` file by moving popup-only page, shell, provider-card, popup progress, and responsive styling into a focused popup entry module.

## Scope

- add `src/popup/popup-theme.css`
- move popup page sizing, popup shell, popup provider-card, popup progress-ring, and popup responsive CSS out of `material-theme.css`
- import `popup-theme.css` from the popup entry after the shared Material theme and shared usage-progress CSS
- keep the sidepanel entry free of popup-only CSS
- preserve the existing popup width, corner, shadow, provider-card, and quota-progress semantics

## Preserved Boundaries

- do not change popup TypeScript behavior, source-page recovery behavior, provider data, sync behavior, or truth labels
- do not change dashboard, sidepanel Settings, provider-detail, operator workspaces, or store screenshot workflows in this slice
- do not split `SettingsPage.tsx`, `App.tsx`, or localization files in this slice

## Completed Work

- Extracted popup-only CSS into `src/popup/popup-theme.css`.
- Added the popup entry import after `usage-progress.css` so popup-specific progress/card overrides remain last.
- Added `npm run phase245:review` to verify import ordering, moved CSS markers, closeout documentation, balanced popup visual checks, and narrow popup visual checks.

## Verification

- `npm run phase245:review`
- `npm run phase244:review`
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
