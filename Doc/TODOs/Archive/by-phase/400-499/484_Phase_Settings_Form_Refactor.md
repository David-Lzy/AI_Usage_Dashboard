# Phase 484 - Settings Form Refactor

Date: 2026-05-15

Status: completed

## Goal

Consolidate repeated Settings/Form label-plus-accessory markup into one small shared component without changing behavior, storage, text, accessibility wiring, or visual output.

## Scope

- Add `FormFieldLabel` as the shared label/accessory renderer for form controls.
- Update `MaterialSelect`, `EditableNumberCombobox`, and `ActionBadgeSelectionControls` to use the shared component.
- Preserve the existing label ids, `htmlFor` wiring, `form-field__label-row` wrapper, hidden-label class, and `aria-labelledby` behavior.

## Preserved Boundaries

- No Settings preference model, provider state, toolbar badge/icon behavior, quota progress rendering, localization string, route, storage schema, or release package change.
- No DOM semantics change beyond sharing the component that emits the same label structure.
- No CSS redesign or new dependency.

## Acceptance

- Focused component tests for Material select, editable number combobox, action badge selector, and Settings preferences continue to pass.
- TypeScript proves the shared component keeps the existing label/accessory contracts.
- Current docs acknowledge that source has advanced through `Phase 484` while `rc.21` remains the latest package.

## Planned Verification

- `npm run test -- src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/components/MaterialSelect.test.tsx src/sidepanel/components/EditableNumberCombobox.test.tsx src/sidepanel/components/ActionBadgeSelectionControls.test.tsx --run`
- `npm run typecheck`
- `npm run docs:check`
- `npm run i18n:check`
- `npm run build`
- `git diff --check`

## Completed Verification

- `npm run test -- src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/components/MaterialSelect.test.tsx src/sidepanel/components/EditableNumberCombobox.test.tsx src/sidepanel/components/ActionBadgeSelectionControls.test.tsx --run`
- `npm run typecheck`
- `npm run docs:check`
- `npm run i18n:check`
- `npm run build`
- `git diff --check`

## Follow-Up

- Continue with Phase 485 bundle split to address the remaining large sidepanel chunk warning.
