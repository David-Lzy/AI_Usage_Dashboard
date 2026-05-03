# Phase 262 - Special Route App Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is an App maintainability slice; it extracts special debug/operator routes without changing standard dashboard, Settings, provider detail, or sync behavior

## Goal

Continue splitting oversized `App.tsx` by moving special route parsing, special route rendering, and special-route-only theme/locale hydration into a focused module.

## Scope

- add `src/sidepanel/special-route-app.tsx`
- move `SpecialSidePanelRoute`, `getSpecialSidePanelRoute`, `SpecialRouteApp`, and stored theme/locale parsing helpers out of `App.tsx`
- keep `App.tsx` responsible for the top-level route choice and the standard app runtime
- add focused coverage for special route hash mapping and special route static rendering

## Preserved Boundaries

- do not change standard route parsing, dashboard rendering, Settings rendering, provider detail rendering, sync behavior, source-page recovery, provider truth labels, or operator route contents
- do not change special route hash strings
- do not split standard app handlers in this slice

## Completed Work

- Extracted special route ownership into `src/sidepanel/special-route-app.tsx`.
- Reduced `App.tsx` special-route ownership to importing `getSpecialSidePanelRoute` and `SpecialRouteApp`.
- Added `src/sidepanel/special-route-app.test.tsx`.
- Added `npm run phase262:review` to verify runtime markers, closeout docs, and a compact special route render pass for the interaction-audit route.

## Verification

- `npm run test -- src/sidepanel/special-route-app.test.tsx src/sidepanel/route-state.test.ts --run`
- `npm run phase262:review`
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
