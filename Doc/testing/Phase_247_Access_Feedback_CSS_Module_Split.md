# Phase 247 - Access Feedback CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 247 access-feedback CSS ownership split and regression checks

## Scope

Phase 247 moved sidepanel-only permission, credential, and toast feedback styling from the oversized shared theme file into:

- `src/sidepanel/theme/access-feedback.css`

The side-panel entry imports that file after `material-theme.css`. The popup entry intentionally does not load this sidepanel-only access-feedback CSS module.

## Review Coverage

- `npm run phase247:review`
  - verifies `phase247:review` package script wiring
  - verifies sidepanel import order is `material-theme.css`, `access-feedback.css`, `detail-surfaces.css`, `form-controls.css`, `settings-navigation.css`, `settings-source-cards.css`, `interaction-audit.css`, `settings-appearance.css`, `theme-recovery.css`, `usage-progress.css`, then `provider-card.css`
  - verifies the popup entry does not import `access-feedback.css`
  - verifies permission, credential, and toast selectors no longer live in `material-theme.css`
  - starts Vite, opens Settings at compact and wide widths, triggers the save toast, captures both states, and verifies credential chip shape, credential action wrapping, toast layout/animation, and horizontal overflow

## Commands

- `npm run phase247:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
