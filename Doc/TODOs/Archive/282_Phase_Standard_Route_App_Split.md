# Phase 282 - Standard Route App Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a sidepanel app maintainability slice; it extracts standard route rendering from the top-level app entry without changing route hashes, special routes, or runtime initialization

## Goal

Finish the currently planned `App.tsx` split by moving dashboard, settings, and provider-detail route rendering out of `src/sidepanel/App.tsx`.

## Scope

- add `src/sidepanel/standard-route-app.tsx`
- move standard route parsing, standard app runtime usage, locale sync, view-model assembly, quick theme toggle wiring, and dashboard/settings/provider-detail rendering into the new component
- keep `App.tsx` responsible for location hash observation, special route detection, special route rendering, and standard route handoff

## Preserved Boundaries

- do not change route hashes, special debug/operator route behavior, standard app runtime initialization, dashboard/settings/provider-detail props, full-page surface detection, theme toggle behavior, locale behavior, provider sync behavior, or toast placement
- do not split standard route rendering into per-route containers in this slice

## Completed Work

- Added `src/sidepanel/standard-route-app.tsx`.
- Reduced `src/sidepanel/App.tsx` from `365` lines to `37` lines.
- Preserved the existing `SpecialRouteApp` handoff and moved only the standard route container into the new file.
- Added `npm run phase282:review` to verify the top-level app entry no longer owns standard route rendering.

## Verification

- `npm run test -- src/sidepanel/route-state.test.ts src/sidepanel/special-route-app.test.tsx src/sidepanel/use-standard-app-runtime.test.tsx --run`
- `npm run phase282:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

The originally queued local-safe split targets are now closed enough to return to normal priority selection:

- Settings route, Settings section aggregators, standard app action aggregator, and top-level app entry are all below the previous oversized-file threshold
- further file splitting should be justified by a concrete maintenance issue, not by the old Phase 236-era queue alone
- remaining large files are mostly historical/operator workspaces, provider parsers/adapters, popup view models, and broad shared constants or i18n modules
