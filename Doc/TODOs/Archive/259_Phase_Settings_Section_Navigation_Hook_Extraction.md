# Phase 259 - Settings Section Navigation Hook Extraction

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a narrow SettingsPage maintainability slice; it extracts section navigation state and scroll behavior without changing Settings layout or navigation UI

## Goal

Continue splitting the oversized `SettingsPage.tsx` file by moving Settings section active-state observation and scroll helpers into a focused hook.

## Scope

- add `useSettingsSectionNavigation` in `src/sidepanel/use-settings-section-navigation.ts`
- update `SettingsPage.tsx` to consume the hook for active section state, section jumps, and return-to-top behavior
- add focused hook coverage for the default active section and scroll callback shape
- preserve sticky top-bar placement, section ids, section-jump rendering, back-to-top FAB rendering, reduced-motion scroll behavior, and IntersectionObserver thresholds

## Preserved Boundaries

- do not change Settings layout, CSS, section labels, section ordering, provider data, sync behavior, or form behavior
- do not change `SettingsNavigation.tsx` rendering in this slice
- do not split preferences, sources, `App.tsx`, or `src/shared/localized-copy.ts` in this slice

## Completed Work

- Extracted `useSettingsSectionNavigation` into `src/sidepanel/use-settings-section-navigation.ts`.
- Removed `IntersectionObserver`, section-anchor lookup, and scroll helper ownership from `SettingsPage.tsx`.
- Added `src/sidepanel/use-settings-section-navigation.test.tsx`.
- Added `npm run phase259:review` to verify runtime markers, tests/docs markers, compact Settings navigation rendering, exactly one active nav item, back-to-top FAB rendering, section anchors, and horizontal overflow.

## Verification

- `npm run test -- src/sidepanel/use-settings-section-navigation.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run phase259:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- split another self-contained `SettingsPage.tsx` section, likely preferences or source cards
- split `App.tsx`
- split `src/shared/localized-copy.ts`
