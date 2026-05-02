# Phase 239 - Interaction Audit CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a narrow maintenance slice; it splits sidepanel-only operator workspace CSS ownership and does not change runtime behavior

## Goal

Continue reducing the oversized `material-theme.css` file by moving interaction-audit workspace styles into a focused sidepanel-only theme module.

## Scope

- add `src/sidepanel/theme/interaction-audit.css`
- move `interaction-audit`, audit frame, audit queue, handoff, signoff, and `capture-pre` CSS out of `material-theme.css`
- import `interaction-audit.css` from the side-panel entry after `material-theme.css`
- keep the popup entry free of interaction-audit CSS
- keep shared app shell, top bar, card, text-button, form, detail, Settings, popup, and provider-card CSS in their existing modules

## Preserved Boundaries

- do not change interaction-audit TypeScript behavior, export schemas, request packages, or archive workflows
- do not change provider data, sync behavior, source-selection order, or truth labels
- do not change dashboard provider-card, popup progress, Settings, or store screenshot behavior
- do not split Settings, App, popup, or localization files in this slice

## Completed Work

- Extracted interaction-audit workspace CSS into `src/sidepanel/theme/interaction-audit.css`.
- Added the side-panel import after `material-theme.css` while keeping shared progress and provider-card module order intact.
- Added `npm run phase239:review` to verify import ordering, moved CSS markers, closeout documentation, and the live debug interaction-audit route.

## Verification

- `npm run phase239:review`
- `npm run phase238:review`
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
