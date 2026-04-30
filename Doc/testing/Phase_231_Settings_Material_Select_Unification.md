# Phase 231 - Settings Material Select Unification

Date: 2026-04-30

Document class:

- closed evidence

## Goal

Replace the remaining native browser dropdowns on the user-facing Settings surface with one Material-style select-only combobox.

## Why This Phase Exists

Phase 229 fixed only the two numeric Settings preferences because those fields needed arbitrary user-authored values. The rest of the fixed enum settings still used native `<select>`, so opening menus produced the browser default dropdown and broke the Material visual language. Source Connections also still exposed the provider source preference as a native select.

## What Changed

- Added `MaterialSelect` for fixed option sets.
- Replaced the Settings native selects for:
  - app locale
  - theme mode
  - accent preset
  - popup, sidebar, and full-page progress style
  - popup size, corner, and shadow
  - provider source preference under Source Connections
- Kept `EditableNumberCombobox` for sync interval and warning threshold because those fields still support custom numeric values.
- Updated Interaction Audit Settings selectors so its focus preset targets the new source-preference material select.

## Verification

- `npm run phase231:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
- Playwright Settings screenshot with a global preference Material select open:
  - `tmp/phase231-settings-material-select-unification-review/playwright-settings-popup-size-material-select.png`
- Playwright Settings screenshot with a Source Connections preference Material select open:
  - `tmp/phase231-settings-material-select-unification-review/playwright-settings-source-preference-material-select.png`

## Follow-Up

If internal operator tools need the same visual polish later, migrate their native selects separately so this user-facing Settings pass stays scoped.
