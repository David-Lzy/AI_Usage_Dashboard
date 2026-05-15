# Phase 478 - Action Badge Multi Select Dropdown Polish

Date: 2026-05-15

Status: completed

## Goal

Replace the tall action-badge multi-select checkbox stack with a compact Material-style dropdown trigger while preserving multi-select badge rotation behavior.

## Scope

- Keep action badge source selection multi-choice.
- Render the default state as one dropdown-like field with a compact selected summary.
- Move individual checkbox rows into the expanded menu instead of always-visible cards.
- Keep badge rotation interval settings unchanged.

## Preserved Boundaries

- Action badge selection storage, badge rotation alarm behavior, toolbar icon matching, provider sync, provider data, and release packaging are unchanged.
- No settings migration or package version bump in this phase.
- Existing action badge options and fallback selection semantics are unchanged.

## Acceptance

- The `Toolbar badge` / `工具栏图标标记` control no longer renders a tall always-visible checkbox-card list.
- The closed control visually matches the existing Material select/dropdown language.
- Multiple selected badge sources are summarized in one compact value line.
- Focused render tests cover the compact dropdown state and summary formatting.

## Planned Verification

- `npm run test -- src/sidepanel/components/ActionBadgeSelectionControls.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Completed Verification

- `npm run test -- src/sidepanel/components/ActionBadgeSelectionControls.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run typecheck`

## Follow-Up

- Run a Settings visual pass before the next packaged RC if more dropdown or form-control polish is batched into the same source boundary.
