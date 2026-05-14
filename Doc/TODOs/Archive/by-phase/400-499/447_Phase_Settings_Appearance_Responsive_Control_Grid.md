# Phase 447 - Settings Appearance Responsive Control Grid

Status: completed

## Goal

Make Appearance & Sync controls adapt their column width automatically across side-panel, full-page, and narrow Settings layouts.

## Scope

- Replace the fixed two-column `.settings-grid` behavior with a responsive `auto-fit` or equivalent grid pattern.
- Apply the pattern to sync interval, warning threshold, language, theme mode, accent preset, action badge, popup progress style, sidebar progress style, full-page progress style, popup size, popup corners, popup shadow, and any progress appearance controls added in `Phase 442`.
- Preserve dropdown and combobox overlay z-index behavior so open menus are not clipped by neighboring sections.
- Keep repeated one-off width overrides out of individual controls unless a specific control cannot use the shared grid safely.

## Preserved Boundaries

- Do not change Settings preference values, validation, storage normalization, or localized option labels.
- Do not change Provider order or Quota items again after `Phase 445` except to keep bottom spacing coherent.
- Do not change popup, dashboard, or provider-detail runtime behavior.
- Do not package a new release candidate in this phase.

## Acceptance

- Appearance & Sync controls fit cleanly on side-panel width, full-page width, and narrow viewport width.
- Controls use available width without excessive empty two-column gaps on medium layouts.
- `MaterialSelect` and `EditableNumberCombobox` popovers remain visible above neighboring content.
- Existing Settings interaction tests continue to pass.

## Planned Verification

- Settings preferences section render tests.
- MaterialSelect and EditableNumberCombobox focused tests if overlay behavior changes.
- Playwright screenshots for Settings side-panel, full-page, and narrow widths.
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- No numbered phase is currently queued after `Phase 447`.
- Run a closeout QA/packaging decision phase only if a new release package is needed for post-`rc.18` source changes.

## Completion Summary

- Replaced fixed two-column Settings preference grids with responsive `auto-fit` tracks so Appearance & Sync controls use one, two, or four columns depending on available width.
- Applied the same responsive pattern to progress appearance band fields so thickness and color-band controls stop relying on fixed three-column tracks.
- Added shared maximum height and vertical scrolling to `MaterialSelect` and `EditableNumberCombobox` menus so long option lists remain visible above neighboring Settings content.

## Completed Verification

- `npm run test -- src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/components/MaterialSelect.test.tsx src/sidepanel/components/EditableNumberCombobox.test.tsx --run`
- `npm run typecheck`
- `npm run build`
- Playwright preview smoke against `http://127.0.0.1:4173/src/sidepanel/index.html#settings` and `?surface=full-page#settings` at `760px`, `1280px`, and `420px`.
- `npm run docs:check`
- `git diff --check`
