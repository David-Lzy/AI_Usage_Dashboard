# Phase 240 - Theme Recovery CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 240 theme-recovery CSS ownership split and regression checks

## Scope

Phase 240 moved theme-recovery workspace styling from the oversized shared theme file into:

- `src/sidepanel/theme/theme-recovery.css`

The side-panel entry imports that file after `interaction-audit.css`, preserving the shared action-row base class used by the theme-recovery copy actions. The popup entry intentionally does not load this sidepanel-only operator workspace CSS.

## Review Coverage

- `npm run phase240:review`
  - verifies `phase240:review` package script wiring
  - verifies sidepanel import order is `material-theme.css`, `interaction-audit.css`, `theme-recovery.css`, `usage-progress.css`, then `provider-card.css`
  - verifies the popup entry does not import `theme-recovery.css`
  - verifies theme-recovery selectors no longer live in `material-theme.css`
  - starts Vite, opens `#debug-theme-recovery-review`, captures the workspace, and verifies export panels, grid display, copy-action wrapping, and horizontal overflow
- `npm run phase239:review`
  - reuses the interaction-audit CSS split gate after the new sidepanel import was inserted before `usage-progress.css`

## Commands

- `npm run phase240:review`
- `npm run phase239:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
