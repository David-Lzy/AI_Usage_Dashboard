# Phase 265 - Standard App Actions Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is an App maintainability slice; it extracts standard app action handlers without changing route rendering, provider semantics, sync behavior, source-page recovery, or UI presentation

## Goal

Continue splitting oversized `App.tsx` by moving standard app action handler assembly into a focused module.

## Scope

- add `src/sidepanel/standard-app-actions.ts`
- move provider refresh, settings update, provider visibility, permission toggle, source preference, credential save/clear, page binding, session-page open/attach, full-page open, and save-preferences handlers out of `App.tsx`
- keep `App.tsx` responsible for route selection, route guards, runtime i18n creation, view-model assembly, and page rendering
- add focused coverage for empty-state no-op behavior, refresh dispatch, settings dispatch, provider visibility dispatch, localized preference toast, and extension-mode action availability flags

## Preserved Boundaries

- do not change provider data models, provider action semantics, sync behavior, source-page recovery, provider truth labels, route hashes, full-page route behavior, session-page binding behavior, or UI presentation
- do not change dashboard, Settings, provider detail, popup, or special route presentation
- do not split route rendering in this slice

## Completed Work

- Extracted standard app actions into `src/sidepanel/standard-app-actions.ts`.
- Reduced `App.tsx` action ownership to calling `createStandardAppActions` and wiring returned handlers into existing routes.
- Added `src/sidepanel/standard-app-actions.test.ts`.
- Added `npm run phase265:review` to verify runtime markers, closeout docs, and a compact dashboard render pass after the action extraction.

## Verification

- `npm run test -- src/sidepanel/standard-app-actions.test.ts src/sidepanel/app-browser-controls.test.ts --run`
- `npm run phase265:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- split standard app route rendering from `App.tsx`
- split `src/shared/localized-copy.ts`
- consider smaller source-copy bundles before adding broader runtime locale work
