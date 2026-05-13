# Phase 254 - Layout Primitives CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 254 shared layout primitive CSS ownership split and regression checks

## Scope

Phase 254 moved shared summary and dashboard layout primitives from the base shared theme file into:

- `src/sidepanel/theme/layout-primitives.css`

Both the side-panel and popup entries import that file after `surfaces.css`. Popup-specific summary overrides and provider-card-specific responsive overrides still load later.

## Review Coverage

- `npm run phase254:review`
  - verifies `phase254:review` package script wiring
  - verifies sidepanel import order is `material-theme.css`, `app-shell.css`, `buttons.css`, `chips.css`, `typography.css`, `surfaces.css`, `layout-primitives.css`, `access-feedback.css`, `top-app-bar.css`, `detail-surfaces.css`, `form-controls.css`, `settings-navigation.css`, `settings-source-cards.css`, `interaction-audit.css`, `settings-appearance.css`, `theme-recovery.css`, `usage-progress.css`, then `provider-card.css`
  - verifies popup import order is `material-theme.css`, `app-shell.css`, `buttons.css`, `chips.css`, `typography.css`, `surfaces.css`, `layout-primitives.css`, `usage-progress.css`, then `popup-theme.css`
  - verifies shared layout primitive selectors no longer live in `material-theme.css`
  - starts Vite, opens compact dashboard, compact Settings, and a seeded no-visible-provider popup state, captures all three states, and verifies summary-strip grid layout, summary-pill surfaces, dashboard-section layout, provider-card override order, popup summary override order, and horizontal overflow

## Commands

- `npm run phase254:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
