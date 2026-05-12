# Phase 309 - Quick Setup First Provider Guided Setup

## Goal

Make the first-provider setup path clearer for personal-account users who open Settings with no visible providers enabled.

## Scope

- Add a focused first-run Quick Setup flow that tells the user which provider to start with and what the next action is.
- Keep provider enablement, host access, and source-page opening inside Quick Setup.
- Preserve the existing user-level visibility matrix and Advanced container.
- Keep JetBrains out of the default personal-user happy path.

## Preserved Boundaries

- Do not change provider semantics, provider ordering rules outside Quick Setup, or sync engine behavior.
- Do not add new credentials to basic mode.
- Do not claim unavailable provider values.

## Acceptance

- With zero visible providers, Settings points the user at one clear provider setup action instead of only showing a generic `More providers` recovery path.
- Enabled providers still sort before disabled providers after setup begins.
- Disabled providers remain recoverable under `More providers`.
- Popup zero-provider guidance and Settings Quick Setup copy describe the same path.

## Planned Verification

- Focused Settings render tests for zero visible providers.
- Popup view-model tests for zero-provider setup handoff copy.
- `npm run test -- --run src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/settings-page-view-models.test.ts src/popup/view-models.test.ts`
- `npm run docs:check`
- `git diff --check`
