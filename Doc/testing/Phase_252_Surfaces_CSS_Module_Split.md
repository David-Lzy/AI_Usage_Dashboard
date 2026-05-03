# Phase 252 - Surfaces CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 252 shared surface CSS ownership split and regression checks

## Scope

Phase 252 moved shared hero-card and status-card styling from the oversized shared theme file into:

- `src/sidepanel/theme/surfaces.css`

Both the side-panel and popup entries import that file after `chips.css`.

## Review Coverage

- `npm run phase252:review`
  - verifies `phase252:review` package script wiring
  - verifies sidepanel import order is `material-theme.css`, `app-shell.css`, `buttons.css`, `chips.css`, `surfaces.css`, `access-feedback.css`, `top-app-bar.css`, `detail-surfaces.css`, `form-controls.css`, `settings-navigation.css`, `settings-source-cards.css`, `interaction-audit.css`, `settings-appearance.css`, `theme-recovery.css`, `usage-progress.css`, then `provider-card.css`
  - verifies popup import order is `material-theme.css`, `app-shell.css`, `buttons.css`, `chips.css`, `surfaces.css`, `usage-progress.css`, then `popup-theme.css`
  - verifies shared surface selectors no longer live in `material-theme.css`
  - starts Vite, opens compact dashboard, compact Settings, and compact popup, captures all three states, and verifies surface grid layout, rounded shape, elevation, status-card header flex layout, and horizontal overflow

## Commands

- `npm run phase252:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
