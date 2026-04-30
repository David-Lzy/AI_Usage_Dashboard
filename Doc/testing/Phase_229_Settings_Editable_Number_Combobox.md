# Phase 229 - Settings Editable Number Combobox

Date: 2026-04-30

Document class:

- closed evidence

## Goal

Replace the native browser dropdowns for Settings numeric preferences with a Material-aligned editable numeric combobox.

## Why This Phase Exists

The default `<select>` popup uses browser chrome styling that clashes with the Material 3 Settings surface. It also limits `Default sync interval` and `Warning threshold` to a few presets even though both settings can safely accept a broader validated integer range.

Material guidance points this shape toward an editable exposed dropdown: a text-field anchor with a temporary menu of suggested values. The WAI-ARIA combobox pattern also fits this case because the input value can be either a typed arbitrary value or a selected suggestion.

## What Changed

- Replaced the two numeric preference `<select>` controls with `EditableNumberCombobox`.
- Kept presets for quick selection:
  - sync interval: 15, 30, 60 minutes
  - warning threshold: 70%, 80%, 90%
- Added direct numeric entry with validation:
  - sync interval: 15-240 minutes
  - warning threshold: 50-99%
- Added combobox/listbox ARIA semantics, keyboard open/select handling, selected-state styling, error text, and a Material-style menu surface.
- Added storage normalization so out-of-range persisted numeric preferences fall back to shipped defaults.
- Left fixed enum preferences, such as locale and theme mode, on native select controls because they do not need arbitrary values.

## Verification

- `npm run phase229:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
- Playwright full-page Settings screenshot with the sync-interval combobox menu open:
  - `tmp/phase229-settings-editable-number-combobox-review/playwright-settings-sync-menu.png`
- Playwright full-page Settings screenshot after entering a custom 45-minute sync interval:
  - `tmp/phase229-settings-editable-number-combobox-review/playwright-settings-custom-sync-value.png`
- RDP Chrome reload was not completed in this pass because `DISPLAY=:10` was on the system lock screen during capture.

## Follow-Up

If more settings need user-authored numeric values, reuse the same editable numeric combobox rather than adding another native select with an `Other` option.
