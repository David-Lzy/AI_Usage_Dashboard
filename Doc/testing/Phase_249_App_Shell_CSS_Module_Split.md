# Phase 249 - App Shell CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 249 shared app-shell CSS ownership split and regression checks

## Scope

Phase 249 moved shared sidepanel/popup app-shell layout and shell-entry keyframes from the oversized shared theme file into:

- `src/sidepanel/theme/app-shell.css`

Both the side-panel and popup entries import that file after `material-theme.css`.

## Review Coverage

- `npm run phase249:review`
  - verifies `phase249:review` package script wiring
  - verifies sidepanel import order is `material-theme.css`, `app-shell.css`, `access-feedback.css`, `top-app-bar.css`, `detail-surfaces.css`, `form-controls.css`, `settings-navigation.css`, `settings-source-cards.css`, `interaction-audit.css`, `settings-appearance.css`, `theme-recovery.css`, `usage-progress.css`, then `provider-card.css`
  - verifies popup import order is `material-theme.css`, `app-shell.css`, `usage-progress.css`, then `popup-theme.css`
  - verifies app-shell selectors and keyframes no longer live in `material-theme.css`
  - starts Vite, opens compact sidepanel dashboard, wide full-page dashboard, and compact popup, captures all three states, and verifies app-shell grid layout, child min-width protection, and horizontal overflow

## Commands

- `npm run phase249:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
