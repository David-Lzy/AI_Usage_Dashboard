# Phase 474 - Configuration Backup And Chrome Sync

Date: 2026-05-15

Status: completed

## Goal

Add a Settings entry point for portable configuration backup, manual JSON export/import, and Chrome account-backed configuration sync without introducing a separate Google OAuth login flow.

## Scope

- Add a versioned configuration backup document for portable app settings plus provider enable/source preferences.
- Add JSON export and import actions in Settings.
- Add Chrome Sync save and restore actions backed by `chrome.storage.sync`.
- Chunk Chrome Sync payloads so the synced backup stays below per-item storage limits.
- Add 14-locale Settings UI copy, Material-style action controls, and focused tests.
- Preserve local-only provider runtime evidence while applying imported portable preferences.

## Preserved Boundaries

- No Google OAuth, `identity` permission, or external account service was added; Chrome Sync uses the browser account already managed by Chrome.
- Provider API keys, cookies, auth headers, page bindings, permission grants, runtime snapshots, raw diagnostic bodies, and source evidence are not exported as portable provider backup fields.
- Manual JSON export may include the local custom toolbar image data URL because it is a direct user file export; Chrome Sync excludes that large local image payload and falls back to the default toolbar icon if the synced settings were custom-image only.
- Provider source truth, adapter behavior, warning thresholds, badge behavior, and release packaging are unchanged.
- No package version bump or release zip refresh in this phase.

## Acceptance

- Settings exposes export, import, save-to-Chrome-Sync, and restore-from-Chrome-Sync actions.
- The new Settings backup section has localized labels and helper text for the shipped 14 runtime locales.
- Exported JSON carries a stable format id, schema version, export timestamp, settings, and portable provider settings.
- Import validates the backup before applying it, rejects malformed JSON, and preserves current local-only provider page bindings and credential state.
- Chrome Sync save/restore uses a sync-safe backup payload and returns user-facing notices through the existing background message channel.
- Focused tests cover backup schema behavior, sync-safe image exclusion, import local-state preservation, and Settings rendering.

## Planned Verification

- `npm run test -- src/shared/configuration-backup.test.ts src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Completed Verification

- `npm run test -- src/shared/configuration-backup.test.ts src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Follow-Up

- Before shipping this source in a release package, run an unpacked-extension Chrome pass with a signed-in profile to validate cross-profile Chrome Sync restore behavior.
- If users need sync for large custom toolbar images later, add an explicit small-icon compression or separate local-only restore flow instead of putting raw large data URLs into `chrome.storage.sync`.
