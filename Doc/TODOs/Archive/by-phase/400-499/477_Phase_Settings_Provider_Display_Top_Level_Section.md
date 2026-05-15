# Phase 477 - Settings Provider Display Top Level Section

Date: 2026-05-15

Status: completed

## Goal

Promote `Provider display settings` out of the Appearance & Sync block into a standalone Settings section that sits beside Overview, Quick Setup, Appearance & Sync, and Advanced.

## Scope

- Add a dedicated Settings section id and navigation chip for Provider display settings.
- Move Provider order and Quota items rendering into a focused `SettingsProviderDisplaySection`.
- Keep Appearance & Sync focused on global visual/sync controls, backup, popup appearance, and progress appearance.
- Keep localized provider-display copy and section navigation aligned.

## Preserved Boundaries

- Provider order storage, quota item visibility/order storage, provider enabled state, credentials, permissions, source preferences, and release packaging are unchanged.
- No settings migration or package version bump in this phase.
- Existing Provider order and Quota items components keep their data hooks and behavior.

## Acceptance

- Settings navigation includes Provider display settings as a peer of Quick Setup and Appearance & Sync.
- Provider order and Quota items are no longer descendants of `SettingsPreferencesSection`.
- Provider display settings renders as a top-level `status-card` section.
- Focused Settings tests cover the new section and the removed Appearance & Sync ownership.

## Planned Verification

- `npm run test -- src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/components/SettingsProviderDisplaySection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/settings-page-view-models.test.ts src/shared/settings-localized-copy.test.ts --run`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Completed Verification

- `npm run test -- src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/components/SettingsProviderDisplaySection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/settings-page-view-models.test.ts src/shared/settings-localized-copy.test.ts --run`
- `npm run typecheck`
- `npm run i18n:check`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Follow-Up

- Run a visual Settings pass before the next packaged RC if more Settings information-architecture changes are batched into the same source boundary.
