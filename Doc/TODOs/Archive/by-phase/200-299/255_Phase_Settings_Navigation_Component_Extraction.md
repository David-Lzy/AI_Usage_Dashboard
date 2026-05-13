# Phase 255 - Settings Navigation Component Extraction

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a narrow SettingsPage maintainability slice; it extracts sticky navigation rendering without changing Settings behavior

## Goal

Start splitting the oversized `SettingsPage.tsx` file by extracting the sticky section navigation and back-to-top floating action button into focused reusable components while preserving the Phase 235 Settings navigation contract.

## Scope

- add `src/sidepanel/settings-section-ids.ts`
- add `src/sidepanel/components/SettingsNavigation.tsx`
- add focused component tests for section chips and the back-to-top action
- update `SettingsPage.tsx` to consume the extracted ids and components
- preserve active-section tracking, section scrolling, TopBar bottom-content placement, and localized labels

## Preserved Boundaries

- do not change Settings preferences, source cards, credential forms, permission behavior, provider data, sync behavior, or truth labels
- do not change Settings navigation CSS or TopBar CSS in this slice
- do not split `App.tsx` or `src/shared/localized-copy.ts` in this slice

## Completed Work

- Moved Settings section ids into `src/sidepanel/settings-section-ids.ts`.
- Extracted `SettingsSectionNavigation` and `SettingsBackToTopButton` into `src/sidepanel/components/SettingsNavigation.tsx`.
- Added `src/sidepanel/components/SettingsNavigation.test.tsx`.
- Added `npm run phase255:review` to verify runtime markers, tests/docs markers, compact Settings visual behavior, nav placement, FAB visibility, and horizontal overflow.

## Verification

- `npm run test -- src/sidepanel/components/SettingsNavigation.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run phase255:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- split another self-contained `SettingsPage.tsx` section or helper group
- split `App.tsx`
- split `src/shared/localized-copy.ts`
