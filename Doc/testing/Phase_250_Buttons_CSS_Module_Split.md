# Phase 250 - Buttons CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 250 shared button CSS ownership split and regression checks

## Scope

Phase 250 moved shared icon-button and text-button styling from the oversized shared theme file into:

- `src/sidepanel/theme/buttons.css`

Both the side-panel and popup entries import that file after `app-shell.css`.

## Review Coverage

- `npm run phase250:review`
  - verifies `phase250:review` package script wiring
  - verifies sidepanel import order is `material-theme.css`, `app-shell.css`, `buttons.css`, `access-feedback.css`, `top-app-bar.css`, `detail-surfaces.css`, `form-controls.css`, `settings-navigation.css`, `settings-source-cards.css`, `interaction-audit.css`, `settings-appearance.css`, `theme-recovery.css`, `usage-progress.css`, then `provider-card.css`
  - verifies popup import order is `material-theme.css`, `app-shell.css`, `buttons.css`, `usage-progress.css`, then `popup-theme.css`
  - verifies button selectors no longer live in `material-theme.css`
  - starts Vite, opens compact Settings and compact popup, captures both states, and verifies icon/text button layout, rounded shape, minimum icon target width, focus-visible treatment, and horizontal overflow

## Commands

- `npm run phase250:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
