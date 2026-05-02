# Phase 241 - Settings Appearance CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 241 Settings appearance CSS ownership split and regression checks

## Scope

Phase 241 moved Settings theme-customization and popup-appearance preview styling from the oversized shared theme file into:

- `src/sidepanel/theme/settings-appearance.css`

The side-panel entry imports that file after `interaction-audit.css` and before `theme-recovery.css`. The popup entry intentionally does not load this Settings-only CSS module.

## Review Coverage

- `npm run phase241:review`
  - verifies `phase241:review` package script wiring
  - verifies sidepanel import order is `material-theme.css`, `interaction-audit.css`, `settings-appearance.css`, `theme-recovery.css`, `usage-progress.css`, then `provider-card.css`
  - verifies the popup entry does not import `settings-appearance.css`
  - verifies Settings appearance selectors no longer live in `material-theme.css`
  - starts Vite, opens `#settings`, captures the Settings page, and verifies popup preview layout, theme swatches, and horizontal overflow
- `npm run phase212:review`
  - reuses the original popup appearance preview static gate after the CSS ownership move

## Commands

- `npm run phase241:review`
- `npm run phase212:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
