# Phase 445 - Settings Control Order And Localization Polish QA

Date: 2026-05-14

## Summary

Phase 445 moved Provider order and Quota items to the bottom of the expanded Appearance & Sync section and moved Provider order text into the same structured Settings localization path as the quota and progress appearance controls.

## Checks

- Provider order now renders localized section labels, titles, helper text, surface labels, count chips, row aria labels, and move-button text.
- Settings renders the expanded Appearance & Sync controls in this order: progress style controls, progress appearance controls, popup appearance preview, theme customization, Provider order, then Quota items.
- Quota items English surface labels now render `Popup`, `Sidebar`, and `Full-page tab`.
- Japanese and Korean quota-item surface labels were realigned to their own locales at the same boundary.

## Preserved Boundaries

- No provider order storage changed.
- No per-surface quota item storage changed.
- No drag/drop, keyboard reorder, provider visibility, provider enabled state, permissions, credentials, source preferences, raw diagnostics, or release package changed.

## Verification

- `npm run test -- src/shared/settings-localized-copy.test.ts src/sidepanel/components/ProviderOrderPreferenceControls.test.tsx src/sidepanel/components/ProviderProgressItemPreferenceControls.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx --run`
- `npm run typecheck`
- `npm run i18n:check`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Notes

This phase intentionally keeps Provider order and Quota items inside the Appearance & Sync details block. Broader Settings information architecture remains outside this slice. The production build still emits the known sidepanel chunk-size warning.
