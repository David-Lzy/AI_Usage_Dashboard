# Phase 304 - Settings IA Simplification With User Levels

## Goal

Simplify Settings for personal-account users by moving enterprise/API controls behind an explicit user-level model and reorganizing the page around task-oriented setup.

## Scope

- Add persisted Settings user levels: `basic`, `advanced`, `developer`, and `debug`.
- Default fresh installs and legacy upgrades to `basic`.
- Rebuild Settings into `Overview`, `Quick Setup`, `Appearance & Sync`, and one collapsible `Advanced` container.
- Move enterprise/API credential cards and source controls behind `Advanced`.
- Gate preference controls, source context, and diagnostics through one centralized visibility matrix.
- Add focused render, summary, migration, and quick-setup behavior tests.

## Preserved Boundaries

- Do not change provider sync-engine semantics.
- Do not change release packaging or version boundaries.
- Do not expose special debug routes or new mutating debug tools from Settings.
- Do not change dashboard or provider-detail route structure.

## Acceptance

- `basic` mode shows Overview, Quick Setup, and a reduced Appearance & Sync surface only.
- `advanced` exposes the Advanced container with enterprise/API credentials plus source preference and page controls.
- `developer` adds read-only source context without full debug diagnostic groups.
- `debug` adds the full read-only diagnostic disclosure.
- Quick Setup uses plain-language next steps for personal-user tasks instead of leading with system-oriented source semantics.

## Planned Verification

- `npm run typecheck`
- `npm run test -- --run src/shared/storage.test.ts src/sidepanel/settings-page-view-models.test.ts src/sidepanel/settings-view-models.test.ts src/sidepanel/components/SettingsNavigation.test.tsx src/sidepanel/use-settings-section-navigation.test.tsx src/sidepanel/components/SettingsSections.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/components/SettingsSourceCard.test.tsx src/sidepanel/components/SettingsSourceSection.test.tsx src/sidepanel/components/SettingsCredentialsSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/standard-app-settings-actions.test.ts`
- `npm run build`
- `git diff --check`

## Completion

Status: completed on 2026-05-11.

Summary:

- Added persisted Settings user levels with storage normalization back to `basic` for legacy states.
- Replaced the old five-way Settings surface split with Overview, Quick Setup, Appearance & Sync, and one collapsible Advanced container.
- Moved enterprise/API credentials and source/page controls behind Advanced, while keeping the normal personal-user path in Quick Setup.
- Added one centralized Settings visibility matrix so preference controls, source context, and debug diagnostics reveal progressively by level.
- Simplified the normal Settings source presentation and added task-oriented Quick Setup action mapping for missing host access, open-page-required, logged-out, and retry-page states.

Verification:

- `npm run typecheck`
- `npm run test -- --run src/shared/storage.test.ts src/sidepanel/settings-page-view-models.test.ts src/sidepanel/settings-view-models.test.ts src/sidepanel/components/SettingsNavigation.test.tsx src/sidepanel/use-settings-section-navigation.test.tsx src/sidepanel/components/SettingsSections.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/components/SettingsSourceCard.test.tsx src/sidepanel/components/SettingsSourceSection.test.tsx src/sidepanel/components/SettingsCredentialsSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/standard-app-settings-actions.test.ts`
- `npm run build`
