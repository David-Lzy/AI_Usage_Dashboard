# Phase 318 - Settings Focused Deep Link Render Guard

## Goal

Lock the Settings render contract for focused deep links used by popup setup/problem actions.

## Scope

- Add Settings page render coverage for source-focused deep links.
- Add Settings page render coverage for quick-setup focused deep links.
- Keep this phase test-only unless the existing render contract is already broken.

## Preserved Boundaries

- Do not change popup routing, Settings layout, provider support claims, or source semantics.
- Do not add new Settings routes or debug links.
- Do not change user-level visibility rules except if a focused link is proven broken.

## Acceptance

- A `source-provider` focus renders the Advanced container and source card target even for default/basic settings.
- A `quick-setup-provider` focus renders the matching Quick Setup card without exposing advanced credentials.
- Existing Settings basic/debug/focused credential tests still pass.

## Planned Verification

- `npm run test -- --run src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/route-state.test.ts src/popup/settings-route-targets.test.ts`
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-13.

Summary:

- Added a Settings render regression test for `source-provider` focused deep links, proving the Advanced container and target source card render from default/basic Settings.
- Added a Settings render regression test for `quick-setup-provider` focused deep links, proving Quick Setup targets do not force advanced credentials into the basic surface.
- Kept the phase test-only because the current runtime contract already behaved correctly.

Verification:

- `npm run test -- --run src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/route-state.test.ts src/popup/settings-route-targets.test.ts`
- `npm run docs:check`
- `git diff --check`
