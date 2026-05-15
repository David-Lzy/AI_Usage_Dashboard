# Phase 476 - Action Badge Multi Select Rotation

Date: 2026-05-15

Status: completed

## Goal

Allow toolbar badge sources to be selected as a multi-choice set, rotate the active badge on a configurable interval, and make `Match toolbar badge` toolbar icons follow the same active rotated badge.

## Scope

- Add multi-select action badge settings while preserving the legacy single-selection field for compatibility.
- Add an action badge rotation interval setting in seconds.
- Add a dedicated Chrome alarm for badge/icon rotation without triggering provider refresh.
- Keep the minimum rotation interval at 30 seconds, matching Chrome alarm behavior.
- Make `toolbarIconMode: "match-badge"` resolve the provider from the active rotated badge source.
- Default fresh toolbar icon mode to `match-badge`.
- When a provider is enabled, append its available quota badge candidates to the selected badge set by default.
- Add Settings UI controls for badge multi-select plus rotation interval.

## Preserved Boundaries

- Provider sync, source truth, provider ordering, quota item visibility, warning threshold semantics, and release packaging are unchanged.
- Existing stored single badge selection remains a migration source.
- The rotation alarm only updates the action badge and toolbar icon; it does not fetch provider data.
- No package version bump or release zip refresh in this phase.

## Acceptance

- Multiple badge sources can be checked in Settings.
- The active badge rotates on the configured interval.
- `Match toolbar badge` resolves the toolbar icon provider from the same rotated badge source.
- Enabling a provider includes its available quota badge candidates in the selected badge set.
- Fresh settings default the toolbar icon mode to `match-badge`.
- Existing one-selection behavior still works.

## Planned Verification

- `npm run test -- src/shared/action-badge-preferences.test.ts src/background/action-badge.test.ts src/background/action-icon.test.ts src/background/alarms.test.ts src/shared/storage.test.ts src/sidepanel/settings-preference-options.test.ts src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `git diff --check`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Completed Verification

- `npm run test -- src/shared/action-badge-preferences.test.ts src/background/action-badge.test.ts src/background/action-icon.test.ts src/background/alarms.test.ts src/shared/storage.test.ts src/sidepanel/settings-preference-options.test.ts src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run i18n:check`

## Follow-Up

- Run an unpacked-extension Chrome visual pass if exact badge rotation timing needs confirmation in a signed-in profile; Chrome can delay alarms beyond the configured period.
