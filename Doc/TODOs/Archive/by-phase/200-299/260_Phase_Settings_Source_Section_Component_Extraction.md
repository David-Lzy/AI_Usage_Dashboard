# Phase 260 - Settings Source Section Component Extraction

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a SettingsPage maintainability slice; it extracts source-card rendering without changing source selection, diagnostics, page-binding behavior, or provider truth labels

## Goal

Continue splitting the oversized `SettingsPage.tsx` file by moving the Settings Source Connections section into a focused component.

## Scope

- add `SettingsSourceSection` in `src/sidepanel/components/SettingsSourceSection.tsx`
- update `SettingsPage.tsx` to consume the extracted source section while retaining page-level state and action dispatch
- add focused source-section coverage for stable card, provider, Material select, and disclosure hooks
- preserve source-card copy, diagnostic presentation, source preference controls, session-page actions, page-binding clear actions, and provider source truth labels

## Preserved Boundaries

- do not change source selection rules, source fallback semantics, diagnostics, sync behavior, page-binding lifecycle, provider data, or provider truth labels
- do not change Settings source-card CSS in this slice
- do not split preferences, `App.tsx`, or `src/shared/localized-copy.ts` in this slice

## Completed Work

- Extracted `SettingsSourceSection` into `src/sidepanel/components/SettingsSourceSection.tsx`.
- Moved source-display/model assembly out of `SettingsPage.tsx` while keeping the page responsible for localized shell copy and dispatch handlers.
- Added `src/sidepanel/components/SettingsSourceSection.test.tsx`.
- Added `npm run phase260:review` to verify runtime markers, tests/docs markers, compact Settings source-card rendering, Material source preference controls, disclosure toggles, and horizontal overflow.

## Verification

- `npm run test -- src/sidepanel/components/SettingsSourceSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run phase260:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- split the Settings preferences section or its popup/theme preview subcomponents
- split `App.tsx`
- split `src/shared/localized-copy.ts`
