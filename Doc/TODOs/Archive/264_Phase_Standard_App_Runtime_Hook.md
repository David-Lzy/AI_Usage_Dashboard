# Phase 264 - Standard App Runtime Hook

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is an App maintainability slice; it extracts standard app initialization, theme sync, message application, and retry ownership without changing route guards, provider actions, rendering, sync behavior, or source-page recovery

## Goal

Continue splitting oversized `App.tsx` by moving standard app runtime state and side-effect glue into a focused hook.

## Scope

- add `src/sidepanel/use-standard-app-runtime.ts`
- move standard app bootstrap message selection, app initialization, theme sync, shared message application, toast state, loading state, load-error state, and retry initialization out of `App.tsx`
- keep `App.tsx` responsible for route guards, provider action handlers, dashboard rendering, Settings rendering, provider detail rendering, and top-level route selection
- add focused coverage for initial hook state, callback exposure, normal bootstrap selection, and store screenshot seed lock bootstrap selection

## Preserved Boundaries

- do not change provider data models, provider action semantics, sync behavior, source-page recovery, provider truth labels, route hashes, full-page route behavior, or UI presentation
- do not change dashboard, Settings, provider detail, popup, or special route presentation
- do not split provider action handlers in this slice

## Completed Work

- Extracted standard app runtime ownership into `src/sidepanel/use-standard-app-runtime.ts`.
- Reduced `App.tsx` runtime ownership to calling `useStandardAppRuntime`.
- Added `src/sidepanel/use-standard-app-runtime.test.tsx`.
- Added `npm run phase264:review` to verify runtime markers, closeout docs, and a compact dashboard render pass after the hook extraction.

## Verification

- `npm run test -- src/sidepanel/use-standard-app-runtime.test.tsx src/sidepanel/app-browser-controls.test.ts --run`
- `npm run phase264:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- split standard app provider action handlers from `App.tsx`
- split standard app route rendering from `App.tsx`
- split `src/shared/localized-copy.ts`
