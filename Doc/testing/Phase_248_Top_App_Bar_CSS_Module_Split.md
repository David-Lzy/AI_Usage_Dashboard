# Phase 248 - Top App Bar CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 248 Top App Bar CSS ownership split and regression checks

## Scope

Phase 248 moved sidepanel-only Top App Bar styling from the oversized shared theme file into:

- `src/sidepanel/theme/top-app-bar.css`

The side-panel entry imports that file after `access-feedback.css`. The popup entry intentionally does not load this sidepanel-only Top App Bar CSS module.

## Review Coverage

- `npm run phase248:review`
  - verifies `phase248:review` package script wiring
  - verifies sidepanel import order is `material-theme.css`, `access-feedback.css`, `top-app-bar.css`, `detail-surfaces.css`, `form-controls.css`, `settings-navigation.css`, `settings-source-cards.css`, `interaction-audit.css`, `settings-appearance.css`, `theme-recovery.css`, `usage-progress.css`, then `provider-card.css`
  - verifies the popup entry does not import `top-app-bar.css`
  - verifies Top App Bar selectors no longer live in `material-theme.css`
  - starts Vite, opens Settings at compact and wide widths, captures both states, and verifies sticky position, grid shell, flex action row, headline wrapping, focused action treatment, and horizontal overflow
- `npm run phase235:review`
  - reuses the original Settings sticky-nav structural gate after the Top App Bar CSS ownership move

## Commands

- `npm run phase248:review`
- `npm run phase235:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
