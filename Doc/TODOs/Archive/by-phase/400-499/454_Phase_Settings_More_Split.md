# Phase 454 - Settings More Split

Status: completed on 2026-05-14

## Goal

Split the single Settings `More` disclosure into one UI-focused disclosure and one provider-display disclosure so visual preferences no longer sit in the same group as provider order and quota item visibility.

## Scope

- Keep the always-visible Appearance & Sync controls unchanged.
- Add a `More UI controls` disclosure for popup shape, progress style, progress appearance, and popup preview.
- Add a `Provider display controls` disclosure for Provider order and Quota items.
- Preserve existing provider order and quota item storage behavior.

## Preserved Boundaries

- Do not change provider truth, quota math, source-page actions, storage shape, package version, or manifest version.
- Do not change the submitted RC13 Chrome Web Store review boundary.

## Acceptance

- Settings renders two separate bottom disclosures.
- Provider order and quota item controls remain after UI appearance controls.
- Focused Settings render tests cover the new order.

## Planned Verification

- `npm run test -- src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run typecheck`

## Follow-Up

- None.

## Completion Notes

- `SettingsPreferencesSection` now tracks separate `uiMoreOpen` and `providerDisplayOpen` states.
- The UI disclosure opens automatically when the saved theme preset is custom, matching the previous custom-color discoverability behavior.
- The provider display controls remain at the bottom of the Appearance & Sync section.

## Verification

- Covered by the Phase 457 focused test run and typecheck.
