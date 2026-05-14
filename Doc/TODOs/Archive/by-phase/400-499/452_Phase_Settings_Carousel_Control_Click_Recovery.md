# Phase 452 - Settings Carousel Control Click Recovery

Status: completed on 2026-05-14

## Goal

Fix the Settings provider-carousel regression where active provider-card controls such as `Show on dashboard`, `Open source page`, `Use current page`, and `Disconnect page` could appear clickable but fail to trigger their existing handlers.

## Scope

- Keep provider carousel drag/swipe navigation on empty card/viewport areas.
- Exclude interactive descendants from carousel drag pointer capture:
  - links
  - buttons
  - inputs and labels
  - selects, textareas, and summary toggles
  - common interactive ARIA roles
- Preserve the existing Quick Setup and Source control handlers; this phase only fixes the carousel event boundary.
- Add focused carousel tests for the interactive-target guard.
- Update maintained current docs.

## Preserved Boundaries

- Do not change provider settings shape, page-binding data, source-page routes, host permissions, session-page attach/open/clear business logic, localized copy, package version, or manifest version.
- Do not package a new release zip; `0.1.0-rc.19` remains the current packaged follow-up candidate and current source is ahead by this UI bugfix phase.
- Do not mutate the submitted RC13 Chrome Web Store review milestone.

## Acceptance

- Clicking active carousel-card controls can reach their component handlers instead of being captured as carousel drag gestures.
- Drag/swipe still works when started from non-interactive card or viewport space.
- Inactive blurred slides remain inert and non-interactive.
- Focused carousel, Settings, and source-card tests pass.

## Planned Verification

- `npm run test -- src/sidepanel/components/ProviderCarousel.test.tsx src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/components/SettingsSourceCard.test.tsx src/sidepanel/components/SettingsSourceSection.test.tsx --run`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If future carousel sections add custom interactive widgets that are not covered by the default selector, mark their root with `data-provider-carousel-interactive`.

## Completion Notes

- `ProviderCarousel` now checks the pointerdown target before starting drag capture.
- Targets inside `a`, `button`, `input`, `label`, `select`, `summary`, `textarea`, common interactive roles, or `data-provider-carousel-interactive` are skipped by carousel drag capture.
- The guard also handles text-node style targets by checking `parentElement` when the original target has no `closest()` method.

## Verification

- `npm run test -- src/sidepanel/components/ProviderCarousel.test.tsx src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/components/SettingsSourceCard.test.tsx src/sidepanel/components/SettingsSourceSection.test.tsx --run`
- `npm run typecheck`
