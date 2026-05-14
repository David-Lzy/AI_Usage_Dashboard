# Phase 445 - Settings Control Order And Localization Polish

Status: completed

## Goal

Move Provider order and Quota items to the bottom of the Settings appearance section and finish localization for remaining hard-coded Settings preference copy.

## Scope

- Move `ProviderOrderPreferenceControls` and `ProviderProgressItemPreferenceControls` below the popup appearance preview, theme customization card, and progress appearance controls.
- Keep both controls inside the Appearance & Sync section unless a later Settings information-architecture phase explicitly moves them elsewhere.
- Localize Provider order heading, helper copy, surface labels, row aria labels, move-up/move-down aria labels, and button labels across the 14 runtime locales.
- Fix the current Quota items English surface-label drift so English does not render Japanese labels.
- Keep Quota items localized copy and Provider order localized copy in the same Settings structured-copy family.

## Preserved Boundaries

- Do not change provider order storage, per-surface progress item storage, drag/drop semantics, or keyboard reorder semantics.
- Do not change provider visibility, provider enabled state, permissions, credentials, or source preferences.
- Do not broaden runtime translation scope into raw provider evidence or diagnostic raw bodies.
- Do not package a new release candidate in this phase.

## Acceptance

- Settings renders Provider order and Quota items after the visual appearance controls and theme customization card.
- Provider order contains no hard-coded user-facing English in runtime surfaces.
- Quota items English renders `Popup`, `Sidebar`, and `Full-page tab` rather than Japanese strings.
- All 14 locales have complete copy for the moved/finished controls.
- Existing Provider order and Quota items tests still prove reorder/hide/show behavior.

## Planned Verification

- `npm run i18n:check`
- Settings localized-copy tests.
- Provider order preference controls tests.
- Provider progress item preference controls tests.
- Settings preferences section render tests confirming control order.
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Continue to `Phase 446` for responsive Settings overview layout.

## Completion Summary

Phase 445 moved the Provider order and Quota items controls to the bottom of the Appearance & Sync advanced section and finished the missing localization boundary for Provider order.

- `ProviderOrderPreferenceControls` now receives structured Settings copy instead of embedding user-facing English strings.
- Provider order copy covers section labels, helper text, surface labels, provider-count chips, row aria labels, and move buttons for all 14 runtime locales.
- Quota items English surface labels now render `Popup`, `Sidebar`, and `Full-page tab` instead of Japanese labels; the adjacent Japanese and Korean surface-label drift was corrected at the same boundary.
- Settings now renders progress-style controls, progress appearance controls, popup preview, theme customization, Provider order, and Quota items in that order inside the expanded Appearance & Sync block.

## Verification

- `npm run test -- src/shared/settings-localized-copy.test.ts src/sidepanel/components/ProviderOrderPreferenceControls.test.tsx src/sidepanel/components/ProviderProgressItemPreferenceControls.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx --run`
- `npm run typecheck`
- `npm run i18n:check`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Closeout Notes

- No provider order storage, quota item storage, drag/drop semantics, keyboard reorder semantics, provider visibility, permissions, credentials, source preferences, raw diagnostics, or release package changed.
