# Phase 426 - Per-Surface Progress Visibility Order Settings

Status: completed

## Goal

Let users configure which quota/progress items appear for each provider on each surface and in what order.

## Scope

- Add Settings controls grouped by provider and display surface.
- Support show/hide and reorder for each progress item.
- Persist preferences in `progressItemsBySurface`.
- Use existing Material-style controls and compact labels.

## Preserved Boundaries

- Do not render filtered progress items in popup/dashboard/detail until Phase 427.
- Do not turn usage facts or raw diagnostics into progress bars.
- Do not alter provider truth claims or source availability labels.

## Acceptance

- Hidden item settings persist and normalize.
- Reordered item settings persist and normalize.
- New provider progress items append to saved preferences.
- All-hidden state remains valid and does not break later rendering.

## Planned Verification

- `npm run test -- src/sidepanel/components/SettingsPreferencesSection.test.tsx src/shared/display-preferences.test.ts src/shared/provider-progress-items.test.ts`
- `npm run typecheck`
- `git diff --check`

## Completion Summary

- Added Settings controls for per-provider quota/progress item visibility and order across popup, sidebar, and full-page tab surfaces.
- Added shared progress item preference helpers for default visible resolution, hide/show updates, move buttons, and drag/drop ordering semantics.
- Wired `progressItemsBySurface` updates through Settings and the standard route app without changing popup/dashboard/detail rendering yet.
- Preserved usage facts, raw diagnostics, provider source truth, and release boundaries.

## Verification

- `npm run test -- src/sidepanel/components/ProviderProgressItemPreferenceControls.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx src/shared/display-preferences.test.ts src/shared/provider-progress-items.test.ts src/shared/storage.test.ts`
- `npm run typecheck`

## Follow-Up

- Phase 427 consumes the configured progress item order and visibility across popup, sidebar, and full-page surfaces.
