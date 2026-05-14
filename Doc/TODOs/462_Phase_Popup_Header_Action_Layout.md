# Phase 462 - Popup Header Action Layout

Status: queued

## Goal

Rework popup header actions so refresh and Settings are easier to find while keeping the popup compact.

## Scope

- Move refresh to the right side of the popup title row next to `Toolbar popup` / `Quick overview`.
- Add a Settings action to the popup header.
- Place theme mode, full-page tab, and Settings actions on one compact action row where width allows.
- Preserve the existing refresh, theme-toggle, full-page tab, and Settings handoff action handlers.
- Preserve accessible button labels and localized copy.

## Preserved Boundaries

- Do not change popup route ownership, provider cards, guidance actions, source-page actions, or sidepanel/full-page route contracts.
- Do not change action badge behavior or provider sync logic.
- Do not change package or manifest versions.

## Acceptance

- Popup compact, balanced, and wide sizes show the header controls without overlap.
- Refresh is visible beside the popup title area.
- Settings action opens the existing Settings route.
- Night/theme, tab, and Settings controls align on one row when width permits and wrap cleanly when not.

## Planned Verification

- `npm run test -- src/popup/PopupApp.test.tsx src/popup/components/PopupHeader.test.tsx src/popup/popup-actions.test.ts --run`
- `npm run i18n:check`
- `npm run typecheck`
- Popup visual check for compact, balanced, and wide presets.
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If adding Settings makes the header too busy, evaluate icon-only buttons with tooltips in a later phase.
