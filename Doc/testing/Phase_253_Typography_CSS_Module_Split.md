# Phase 253 - Typography CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 253 shared typography CSS ownership split and regression checks

## Scope

Phase 253 moved shared text hierarchy and copy primitive styling from the oversized shared theme file into:

- `src/sidepanel/theme/typography.css`

Both the side-panel and popup entries import that file after `chips.css` and before `surfaces.css`, so toned status-card and provider-card overrides still win after the shared typography defaults load.

## Review Coverage

- `npm run phase253:review`
  - verifies `phase253:review` package script wiring
  - verifies sidepanel import order is `material-theme.css`, `app-shell.css`, `buttons.css`, `chips.css`, `typography.css`, `surfaces.css`, `access-feedback.css`, `top-app-bar.css`, `detail-surfaces.css`, `form-controls.css`, `settings-navigation.css`, `settings-source-cards.css`, `interaction-audit.css`, `settings-appearance.css`, `theme-recovery.css`, `usage-progress.css`, then `provider-card.css`
  - verifies popup import order is `material-theme.css`, `app-shell.css`, `buttons.css`, `chips.css`, `typography.css`, `surfaces.css`, `usage-progress.css`, then `popup-theme.css`
  - verifies shared typography selectors no longer live in `material-theme.css`
  - starts Vite, opens compact dashboard, compact Settings, and compact popup, captures all three states, and verifies text primitive margins, token typography, overflow protection, and horizontal overflow

## Commands

- `npm run phase253:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
