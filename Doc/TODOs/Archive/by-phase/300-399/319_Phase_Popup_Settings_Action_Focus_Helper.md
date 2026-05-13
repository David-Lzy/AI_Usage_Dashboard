# Phase 319 - Popup Settings Action Focus Helper

## Goal

Centralize the popup guidance-action to Settings focus mapping used by setup/problem actions.

## Scope

- Move the popup `settings` action focus bridge out of `PopupApp.tsx`.
- Add focused tests for null, non-settings, provider-specific, and visible-provider-derived Settings targets.
- Preserve the existing popup button behavior.

## Preserved Boundaries

- Do not change popup copy, card selection, action hierarchy, or provider support claims.
- Do not change Settings route hash syntax.
- Do not change source-page recovery, host-access, or hide-provider behavior.

## Acceptance

- `PopupApp.tsx` delegates Settings focus selection to `settings-route-targets.ts`.
- Settings actions with an explicit provider id still target the matching Quick Setup provider card.
- Settings actions without a provider id still derive the first relevant visible-provider setup/problem target.

## Planned Verification

- `npm run test -- --run src/popup/settings-route-targets.test.ts src/sidepanel/routes/SettingsPage.test.tsx`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-13.

Summary:

- Moved popup `settings` action focus mapping into `src/popup/settings-route-targets.ts`.
- Added tests for missing actions, non-settings actions, explicit provider Quick Setup targeting, and generic action visible-provider targeting.
- Kept popup action rendering and source-page / hide-provider behavior unchanged.

Verification:

- `npm run test -- --run src/popup/settings-route-targets.test.ts src/sidepanel/routes/SettingsPage.test.tsx`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
