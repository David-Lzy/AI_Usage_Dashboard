# Phase 278 - Settings Page View Model And Seed Hook

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a Settings route maintainability slice; it extracts route-local derived models and custom seed draft behavior without changing Settings UI behavior or dispatch semantics

## Goal

Continue the remaining Settings route split by moving Settings page derived view models and custom theme seed draft behavior out of `src/sidepanel/routes/SettingsPage.tsx`.

## Scope

- add `src/sidepanel/settings-page-view-models.ts`
- add `src/sidepanel/use-settings-theme-custom-seed-draft.ts`
- move credential provider section assembly, Codex provider lookup, Settings summary item assembly, and sticky Settings section nav item assembly into the new view-model helper
- move theme custom seed draft state, save handler, reset handler, and saved-setting synchronization into the new hook
- keep `SettingsPage` responsible for route composition, section ordering, callback wiring, i18n/runtime creation, and section navigation composition

## Preserved Boundaries

- do not change Settings visual layout, sticky section navigation behavior, theme custom seed validation, credential dispatch semantics, Settings section prop contracts, provider data models, source truth labels, or runtime locale behavior
- do not change provider settings, page-binding behavior, sync behavior, popup behavior, or route hashes
- do not split Settings source card rendering in this slice

## Completed Work

- Added `src/sidepanel/settings-page-view-models.ts`.
- Added `src/sidepanel/use-settings-theme-custom-seed-draft.ts`.
- Added `src/sidepanel/settings-page-view-models.test.ts`.
- Reduced `src/sidepanel/routes/SettingsPage.tsx` from `413` lines to `321` lines.
- Added `npm run phase278:review` to verify runtime markers, closeout docs, and split-boundary preservation.

## Verification

- `npm run test -- src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/settings-page-view-models.test.ts src/sidepanel/components/SettingsPreferencesSection.test.tsx --run`
- `npm run phase278:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the remaining file-splitting queue with additional narrow phases:

- reassess `SettingsSourceSection.tsx` and `SettingsSections.tsx`, which are now larger than the Settings route container
- reassess `App.tsx` and the standard action modules after the Settings component queue is below the current largest-file threshold
- avoid mixing Settings route splitting with provider behavior changes or visual redesign work
