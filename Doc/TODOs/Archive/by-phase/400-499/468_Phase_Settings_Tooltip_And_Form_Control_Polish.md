# Phase 468 - Settings Tooltip And Form Control Polish

Status: completed

## Goal

Polish the Settings help-tooltip and form-control visuals after the RC20 packaging boundary without changing provider behavior or stored settings semantics.

## Scope

- Make hidden help `?` triggers visually subtle by default and clear on hover or keyboard focus.
- Keep help tooltip content opaque, Material-style, and positioned against the viewport so details borders and overflow containers do not clip it.
- Widen the progress-thickness numeric input so current and localized values are readable.
- Raise shared form-field labels to a more readable typography level for Settings selects and editable inputs.

## Preserved Boundaries

- Do not change provider support claims, source selection, quota parsing, warning thresholds, progress values, or stored preference keys.
- Do not create a new release package in this phase; `0.1.0-rc.20` remains the current packaged follow-up candidate.
- Do not add a new tooltip library or external UI dependency.
- Keep existing localized strings; this phase changes presentation only.

## Acceptance

- Help triggers are quieter at rest and become clear on hover/focus.
- Tooltip content appears as an opaque surface and is no longer clipped by Settings disclosure/card borders.
- The progress-thickness number input can show multi-digit values without crowding.
- Settings select/input labels such as popup quota style, row count, sidebar/tab quota style, and popup size use consistent readable label sizing.

## Planned Verification

- `npm run test -- src/sidepanel/components/MaterialInfoTooltip.test.tsx src/sidepanel/components/MaterialSelect.test.tsx src/sidepanel/components/ProgressAppearancePreferenceControls.test.tsx --run`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- Built-preview Playwright smoke for zh-CN Settings at 420px: opened UI settings, hovered a help tooltip, verified viewport-bounded opaque tooltip content, widened progress-thickness input, and readable field-label sizing.
- `git diff --check`

## Completed

- Converted `MaterialInfoTooltip` to a viewport-positioned fixed tooltip with clamp logic for screen edges.
- Updated tooltip CSS for a subdued blurred trigger, opaque surface, stronger stacking, and visible-on-open data states.
- Widened the progress-thickness number column and input minimum width.
- Promoted shared form-field labels from label-medium to label-large typography.
- Added focused component/CSS tests for the tooltip, field-label typography, and thickness input width.

## Verification Notes

- `npm run test -- src/sidepanel/components/MaterialInfoTooltip.test.tsx src/sidepanel/components/MaterialSelect.test.tsx src/sidepanel/components/ProgressAppearancePreferenceControls.test.tsx --run`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Follow-Up

- If another visual pass requests it, verify the fixed tooltip behavior in RDP Chrome across narrow sidepanel and full-page Settings widths before packaging a future RC.
