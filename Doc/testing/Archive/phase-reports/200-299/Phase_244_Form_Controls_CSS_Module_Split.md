# Phase 244 - Form Controls CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 244 sidepanel form-control CSS ownership split and regression checks

## Scope

Phase 244 moved shared sidepanel form-control styling from the oversized shared theme file into:

- `src/sidepanel/theme/form-controls.css`

The side-panel entry imports that file after `detail-surfaces.css` and before Settings/source-card/operator modules that use these controls. The popup entry intentionally does not load this sidepanel-only form-control CSS module.

## Review Coverage

- `npm run phase244:review`
  - verifies `phase244:review` package script wiring
  - verifies sidepanel import order is `material-theme.css`, `detail-surfaces.css`, `form-controls.css`, `settings-source-cards.css`, `interaction-audit.css`, `settings-appearance.css`, `theme-recovery.css`, `usage-progress.css`, then `provider-card.css`
  - verifies the popup entry does not import `form-controls.css`
  - verifies base form-control selectors no longer live in `material-theme.css`
  - starts Vite, opens Settings, opens an editable number combobox menu and a Material select menu, captures compact and wide states, and verifies control borders, menu elevation, icon columns, ellipsis treatment, switch-row shape, and horizontal overflow
- `npm run phase243:review`
  - reuses the Settings source-card CSS split gate after the new sidepanel import was inserted before `settings-source-cards.css`

## Commands

- `npm run phase244:review`
- `npm run phase243:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
