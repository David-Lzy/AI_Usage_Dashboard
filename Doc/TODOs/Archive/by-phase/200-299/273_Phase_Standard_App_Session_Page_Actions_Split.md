# Phase 273 - Standard App Session Page Actions Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a runtime maintainability slice; it extracts session-page action handlers without changing source-page recovery behavior or the `createStandardAppActions` return contract

## Goal

Continue the oversized-file maintenance queue by moving standard app session-page actions into a focused sidepanel module.

## Scope

- add `src/sidepanel/standard-app-session-page-actions.ts`
- move session-page open, attach, Chrome tab discovery, page-binding, reload-before-refresh, and active-tab attach behavior out of `src/sidepanel/standard-app-actions.ts`
- keep `createStandardAppActions` as the stable caller-facing action aggregator
- add focused coverage for session-page controls outside extension mode, helper unavailability, and full-page active attach disablement

## Preserved Boundaries

- do not change route rendering, provider refresh behavior, source-page recovery semantics, page-binding payloads, Chrome tab behavior, Settings rendering, popup behavior, provider data models, or source truth labels
- do not change `App.tsx` call sites in this slice
- do not split permission, provider visibility, credential, or full-page actions in this slice

## Completed Work

- Extracted session-page action handlers into `src/sidepanel/standard-app-session-page-actions.ts`.
- Reduced `src/sidepanel/standard-app-actions.ts` to the remaining provider, Settings, permission, credential, preference, and full-page action aggregation.
- Added `src/sidepanel/standard-app-session-page-actions.test.ts`.
- Added `npm run phase273:review` to verify runtime markers, closeout docs, and split-boundary preservation.

## Verification

- `npm run test -- src/sidepanel/standard-app-actions.test.ts src/sidepanel/standard-app-session-page-actions.test.ts src/sidepanel/app-browser-controls.test.ts --run`
- `npm run phase273:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- reassess whether remaining provider/settings/credential actions in `src/sidepanel/standard-app-actions.ts` need one more split
- reassess `src/sidepanel/routes/SettingsPage.tsx`
- avoid mixing runtime action splitting with UI visual changes
