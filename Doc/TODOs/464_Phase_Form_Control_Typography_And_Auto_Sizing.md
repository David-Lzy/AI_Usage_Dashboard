# Phase 464 - Form Control Typography And Auto Sizing

Status: queued

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
