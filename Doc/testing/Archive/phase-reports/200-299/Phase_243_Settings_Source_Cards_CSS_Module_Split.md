# Phase 243 - Settings Source Cards CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 243 Settings source-card CSS ownership split and regression checks

## Scope

Phase 243 moved Settings source-card styling from the oversized shared theme file into:

- `src/sidepanel/theme/settings-source-cards.css`

The side-panel entry imports that file after `detail-surfaces.css` and before later sidepanel-only modules. The popup entry intentionally does not load this sidepanel-only Settings source-card CSS module.

## Review Coverage

- `npm run phase243:review`
  - verifies `phase243:review` package script wiring
  - verifies sidepanel import order is `material-theme.css`, `detail-surfaces.css`, `settings-source-cards.css`, `interaction-audit.css`, `settings-appearance.css`, `theme-recovery.css`, `usage-progress.css`, then `provider-card.css`
  - verifies the popup entry does not import `settings-source-cards.css`
  - verifies base source-card selectors no longer live in `material-theme.css`
  - starts Vite, opens Settings, expands one Source Connections diagnostic disclosure, captures compact and wide states, and verifies card borders, elevation, nested surfaces, disclosure shape, diagnostic row layout, value wrapping, and horizontal overflow
- `npm run phase242:review`
  - reuses the detail-surface CSS split gate after the new sidepanel import was inserted after `detail-surfaces.css`

## Commands

- `npm run phase243:review`
- `npm run phase242:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
