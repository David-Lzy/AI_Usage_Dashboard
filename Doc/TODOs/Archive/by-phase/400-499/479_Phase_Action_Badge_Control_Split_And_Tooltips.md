# Phase 479 - Action Badge Control Split And Tooltips

Date: 2026-05-15

Status: completed

## Goal

Split the toolbar badge selector and badge rotation interval into separate Settings grid controls, with helper copy hidden behind Material-style info tooltips.

## Scope

- Keep the toolbar badge source selector as a compact dropdown-style multi-select.
- Move the badge rotation interval out of the selector component into its own Settings grid item.
- Add tooltip helper copy for both the badge source selector and the rotation interval.
- Keep the same storage, rotation alarm, and toolbar icon matching behavior.

## Preserved Boundaries

- Action badge selection storage, rotation interval storage, alarm behavior, toolbar icon matching, provider sync, provider data, and release packaging are unchanged.
- No settings migration or package version bump in this phase.
- Existing multi-select fallback behavior remains intact.

## Acceptance

- `Toolbar badge` / `工具栏图标标记` and `Badge rotation interval` / `标记轮转间隔` render as two separate Settings grid controls.
- Badge helper details are not always-visible body copy; they live behind `?` tooltips like other dense Settings helpers.
- Focused render tests still cover the compact badge selector and Settings preference layout.

## Planned Verification

- `npm run test -- src/sidepanel/components/ActionBadgeSelectionControls.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run typecheck`
- `npm run i18n:check`
- `npm run docs:check`
- `npm run build`
- `git diff --check`
- `npm run i18n:check`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Completed Verification

- `npm run test -- src/sidepanel/components/ActionBadgeSelectionControls.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run typecheck`

## Follow-Up

- Run a full Settings visual pass before packaging if more dense form-control layout changes are added to the same source boundary.
