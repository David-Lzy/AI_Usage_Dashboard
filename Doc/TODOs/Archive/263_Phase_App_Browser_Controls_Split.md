# Phase 263 - App Browser Controls Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is an App maintainability slice; it extracts browser capability checks, tab prioritization, and full-page route opening without changing dashboard, Settings, provider detail, sync behavior, or route semantics

## Goal

Continue splitting oversized `App.tsx` by moving Chrome/browser-control helpers into a focused sidepanel module.

## Scope

- add `src/sidepanel/app-browser-controls.ts`
- move direct-permission capability detection, tab-navigation capability detection, tab-priority sorting, and full-page route opening out of `App.tsx`
- keep `App.tsx` responsible for standard app state, route selection, provider actions, and rendering
- add focused coverage for unavailable browser controls, extension-mode detection, tab priority ordering, and full-page Chrome tab creation

## Preserved Boundaries

- do not change provider data models, sync behavior, source-page recovery, provider truth labels, route hashes, or full-page route path semantics
- do not change dashboard, Settings, provider detail, popup, or special route presentation
- do not split standard app handlers in this slice

## Completed Work

- Extracted browser-control ownership into `src/sidepanel/app-browser-controls.ts`.
- Reduced `App.tsx` browser-control ownership to importing `hasDirectPermissionControl`, `hasTabNavigationControl`, `openFullPageRoute`, and `sortTabsByPriority`.
- Added `src/sidepanel/app-browser-controls.test.ts`.
- Added `npm run phase263:review` to verify runtime markers, closeout docs, and a compact dashboard render pass after the split.

## Verification

- `npm run test -- src/sidepanel/app-browser-controls.test.ts src/sidepanel/route-state.test.ts --run`
- `npm run phase263:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- split standard app state/actions from `App.tsx`
- split standard app route rendering from `App.tsx`
- split `src/shared/localized-copy.ts`
