# Phase 246 - Settings Navigation CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 246 Settings navigation CSS ownership split and regression checks

## Scope

Phase 246 moved Settings layout and navigation styling from the oversized shared theme file into:

- `src/sidepanel/theme/settings-navigation.css`

The side-panel entry imports that file after `form-controls.css` and before Settings source-card modules. The popup entry intentionally does not load this sidepanel-only Settings navigation CSS module.

## Review Coverage

- `npm run phase246:review`
  - verifies `phase246:review` package script wiring
  - verifies sidepanel import order is `material-theme.css`, `detail-surfaces.css`, `form-controls.css`, `settings-navigation.css`, `settings-source-cards.css`, `interaction-audit.css`, `settings-appearance.css`, `theme-recovery.css`, `usage-progress.css`, then `provider-card.css`
  - verifies the popup entry does not import `settings-navigation.css`
  - verifies Settings navigation selectors no longer live in `material-theme.css`
  - starts Vite, opens Settings at compact and wide widths, captures both states, and verifies sticky top-bar position, wrapping nav chips, active/focused chip treatment, fixed back-to-top action, responsive label handling, Settings grid layout, and horizontal overflow
- `npm run phase235:review`
  - reuses the original Settings sticky-nav structural gate after the CSS ownership move

## Commands

- `npm run phase246:review`
- `npm run phase235:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
