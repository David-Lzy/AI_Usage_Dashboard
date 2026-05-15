# Phase 481 - Balanced Settings Grid And Label Tooltips

Date: 2026-05-15

Status: completed

## Goal

Polish dense Settings layouts so wrapped rows stay visually balanced and field help icons sit beside the field label instead of beside the input frame.

## Scope

- Add a balanced Settings grid variant for appearance/sync controls so common six-item layouts render as `3 + 3` instead of `5 + 1`.
- Add count-aware responsive rules for quick setup and source-card field grids so common four-item cards render as `2 + 2`, five-item cards as `3 + 2`, and six-item cards as `3 + 3`.
- Add optional label accessories to Material select, editable number combobox, and action badge selection controls.
- Move action badge, badge rotation, circular row count, and UI font help tooltips into their label rows.

## Preserved Boundaries

- Settings storage, provider source truth, toolbar badge/icon behavior, quota progress rendering, localization strings, and release packaging are unchanged.
- Tooltip content and semantics are unchanged; only the trigger placement changes.
- No new runtime dependency or JavaScript layout measurement is introduced.

## Acceptance

- Appearance/sync controls avoid a wide-row orphan in the default six-control layout.
- Quick setup provider cards avoid the `3 + 1` field layout at desktop card widths.
- Field-level `?` help triggers appear next to the field label rather than on the right edge of the input/control.
- Focused Settings render tests cover the balanced grid class and label-row tooltip markup.

## Planned Verification

- `npm run test -- src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/components/MaterialSelect.test.tsx src/sidepanel/components/EditableNumberCombobox.test.tsx src/sidepanel/components/ActionBadgeSelectionControls.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run typecheck`
- `npm run i18n:check`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Completed Verification

- `npm run test -- src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/components/MaterialSelect.test.tsx src/sidepanel/components/EditableNumberCombobox.test.tsx src/sidepanel/components/ActionBadgeSelectionControls.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run typecheck`

## Follow-Up

- Run visual Settings checks before the next package to confirm the balanced grid rules feel right in side panel, full-page, and dark mode widths.
