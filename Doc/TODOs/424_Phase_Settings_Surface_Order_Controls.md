# Phase 424 - Settings Surface Order Controls

Status: queued

## Goal

Add Settings controls for editing provider order independently for popup, sidebar, and full-page tab surfaces.

## Scope

- Add one Provider Order Settings section.
- Provide one compact reorder list per surface.
- Support up/down buttons, keyboard move shortcuts, and pointer drag reorder.
- Persist changes through existing `app:update-settings`.

## Preserved Boundaries

- Do not edit provider enabled, permission, credential, or source preference behavior.
- Do not add popup-local editing controls.
- Do not introduce a drag-and-drop dependency.

## Acceptance

- Users can reorder provider labels for each surface independently.
- Keyboard and button controls work without pointer drag.
- Drag reorder does not leave duplicate or missing providers.
- Settings remains usable in `ar` RTL and compact widths.

## Planned Verification

- `npm run test -- src/sidepanel/components/SettingsPreferencesSection.test.tsx src/shared/display-preferences.test.ts`
- `npm run typecheck`
- `git diff --check`

## Follow-Up

- Phase 425 introduces quota/progress item inventory so provider-internal progress rows can also become configurable.
