# Phase 446 - Settings Overview Responsive User Level Help

Status: active

## Goal

Make the Settings overview display-level help text adapt to available width: beside the selector on wide layouts and below it on narrow layouts.

## Scope

- Update the Settings overview control layout around the display-level `MaterialSelect`.
- Use CSS grid or container-aware layout so the select has a stable usable width and the help text fills the remaining row on wide screens.
- Stack the help text below the select on narrow side-panel or compact full-page widths.
- Keep existing display-level options and localized help text unchanged.

## Preserved Boundaries

- Do not change Settings user-level semantics or which sections each level reveals.
- Do not change route focus, Settings navigation, or advanced-section open behavior.
- Do not change MaterialSelect internals unless a layout bug requires a narrowly scoped fix.
- Do not package a new release candidate in this phase.

## Acceptance

- On wide Settings layouts, display-level help appears to the right of the option control.
- On narrow Settings layouts, display-level help appears below the option control.
- The Chinese help sentence does not squeeze or overlap the selector.
- Arabic/RTL Settings keeps coherent order and no text collision.

## Planned Verification

- Settings page render or layout tests where practical.
- Playwright screenshots for wide and narrow Settings overview.
- Representative locale checks for `zh-CN` and `ar`.
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Continue to `Phase 447` for the broader Appearance & Sync responsive control grid.
