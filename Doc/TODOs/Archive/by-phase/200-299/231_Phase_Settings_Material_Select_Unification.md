# Phase 231 - Settings Material Select Unification

Date: 2026-04-30

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-30

## Goal

Make every user-facing fixed option dropdown in Settings use the same Material-style popup control language as the numeric preference fields.

## Completed Work

- Added a reusable `MaterialSelect` select-only combobox component with:
  - listbox popup
  - selected-state row styling
  - keyboard navigation
  - outside-click close behavior
  - hidden-label support for already-labeled source-card fields
- Replaced all native selects in `SettingsPage`.
- Covered the Source Connections preference selector, including `Auto`, `Official API`, and `Session page`.
- Updated Interaction Audit preset selectors that focused the old source-preference select.
- Added component tests and a Phase 231 review script.

## Preserved Boundaries

- Numeric settings still use `EditableNumberCombobox` because they accept typed custom values.
- Fixed enum settings still accept only known preset values.
- Internal Interaction Audit form selects were not migrated in this phase.
- No provider adapter, parser, sync, permission, popup runtime, or storage semantics changed.

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

Run a visual settings pass in RDP Chrome after reloading the unpacked extension if native-runtime menu screenshots are needed for the next operator review.
