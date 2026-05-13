# Phase 281 - Standard App Settings Actions Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a standard app maintainability slice; it extracts Settings, credential, source-preference, and page-binding action handlers without changing dispatch messages or route wiring

## Goal

Continue the standard-app action split by moving Settings-owned action handlers out of `src/sidepanel/standard-app-actions.ts`.

## Scope

- add `src/sidepanel/standard-app-settings-actions.ts`
- move Settings update dispatch, source preference dispatch, page-binding clear dispatch, provider credential save/clear dispatch, Codex workspace config save/clear dispatch, and preferences-saved toast into the new factory
- keep `createStandardAppActions` as the top-level aggregator for refresh, provider visibility, permission control, full-page opening, Settings actions, and session-page actions
- add focused tests for the extracted Settings action factory

## Preserved Boundaries

- do not change message bus payloads, toast copy, provider/source semantics, credential storage behavior, page-binding behavior, session-page behavior, full-page route behavior, or Settings page prop wiring
- do not move permission-request behavior in this slice

## Completed Work

- Added `src/sidepanel/standard-app-settings-actions.ts`.
- Added `src/sidepanel/standard-app-settings-actions.test.ts`.
- Reduced `src/sidepanel/standard-app-actions.ts` from `330` lines to `235` lines.
- Added `npm run phase281:review` to verify Settings action payloads no longer live inline in the standard app aggregator.

## Verification

- `npm run test -- src/sidepanel/standard-app-settings-actions.test.ts src/sidepanel/standard-app-actions.test.ts --run`
- `npm run phase281:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the remaining split queue with narrow phases:

- reassess `src/sidepanel/App.tsx`, which still owns standard route rendering and location-hash observation
- reassess `standard-app-actions.ts` only if another cohesive action group becomes obvious
- keep Settings action splitting separate from Chrome permission behavior changes
