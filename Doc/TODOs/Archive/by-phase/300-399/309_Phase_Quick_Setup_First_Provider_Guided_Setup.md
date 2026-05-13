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

## Completion

Status: completed on 2026-05-13.

Summary:

- Added one shared first-provider recommendation helper that prioritizes the personal-user path (`Codex`, then `Cursor`, then `Claude Code`, then `Gemini`) and keeps JetBrains out of the default first-run recommendation when another provider is available.
- Added a zero-enabled Quick Setup starter card that deep links as `data-quick-setup-provider-id`, recommends one provider, and keeps the existing `More providers` recovery list intact.
- Updated popup zero-provider guidance and setup coverage so the primary action opens focused Quick Setup for the recommended provider instead of a generic Settings page.
- Localized the new first-provider setup path in English and zh-CN without changing provider semantics or sync behavior.

Verification:

- `npm run test -- --run src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/settings-page-view-models.test.ts src/popup/view-models.test.ts src/shared/first-provider-setup.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
