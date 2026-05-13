# Phase 251 - Chips CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 251 shared chip CSS ownership split and regression checks

## Scope

Phase 251 moved shared token, status, and meta chip styling from the oversized shared theme file into:

- `src/sidepanel/theme/chips.css`

Both the side-panel and popup entries import that file after `buttons.css`.

## Review Coverage

- `npm run phase251:review`
  - verifies `phase251:review` package script wiring
  - verifies sidepanel import order is `material-theme.css`, `app-shell.css`, `buttons.css`, `chips.css`, `access-feedback.css`, `top-app-bar.css`, `detail-surfaces.css`, `form-controls.css`, `settings-navigation.css`, `settings-source-cards.css`, `interaction-audit.css`, `settings-appearance.css`, `theme-recovery.css`, `usage-progress.css`, then `provider-card.css`
  - verifies popup import order is `material-theme.css`, `app-shell.css`, `buttons.css`, `chips.css`, `usage-progress.css`, then `popup-theme.css`
  - verifies chip selectors no longer live in `material-theme.css`
  - starts Vite, opens compact dashboard and compact popup, captures both states, and verifies token/status/meta chip layout, rounded shape, expected min-height, and horizontal overflow

## Commands

- `npm run phase251:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
