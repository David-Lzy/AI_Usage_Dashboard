# Phase 464 - Form Control Typography And Auto Sizing

Status: completed on 2026-05-15

## Goal

Improve select/input readability and sizing so control text no longer feels undersized relative to the control container.

## Scope

- Audit `MaterialSelect`, `EditableNumberCombobox`, `ColorChoiceDropdown`, text inputs, and compact provider controls.
- Increase control value typography where the current body size is visually too small.
- Let simple controls size to content where appropriate while keeping multi-control rows aligned.
- Preserve uniform row height for repeated rows and multi-option settings lists.
- Avoid one-off sizing rules that only fix one screenshot.

## Preserved Boundaries

- Do not change setting values, storage, locale behavior, provider data, or popup quota rendering.
- Do not break menu max-height/scroll behavior from earlier responsive Settings phases.
- Do not change component APIs unless required to make sizing consistent.

## Acceptance

- Select/input values are more legible in sidepanel and full-page Settings.
- Short numeric fields do not waste excessive horizontal space in row layouts.
- Repeated rows still align to a stable grid.
- Long localized values truncate or wrap intentionally without overlapping adjacent controls.

## Planned Verification

- `npm run test -- src/sidepanel/components/MaterialSelect.test.tsx src/sidepanel/components/EditableNumberCombobox.test.tsx src/sidepanel/components/ColorChoiceDropdown.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx --run`
- `npm run typecheck`
- Settings visual checks for `en`, `zh-CN`, `de`, and `ar` at sidepanel and full-page widths.
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If font-size changes disturb popup density, split popup-specific typography tokens into a later phase.

## Completion Notes

- Updated shared Settings form-control CSS so native text inputs, Material selects, editable number comboboxes, and color-choice dropdown triggers use explicit body-large value typography instead of inheriting smaller nested text.
- Tightened progress appearance numeric controls and remaining-color-band rows so short numeric values and color dropdowns stay compact while repeated rows keep a stable aligned grid.
- Added focused tests that guard the shared typography tokens and compact color-band sizing rules.

## Verification

- `npm run test -- src/sidepanel/components/MaterialSelect.test.tsx src/sidepanel/components/EditableNumberCombobox.test.tsx src/sidepanel/components/ColorChoiceDropdown.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/components/ProgressAppearancePreferenceControls.test.tsx --run`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `git diff --check`
