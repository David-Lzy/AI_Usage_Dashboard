# Phase 245 - Popup Theme CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 245 popup-only CSS ownership split and regression checks

## Scope

Phase 245 moved popup-only styling from the oversized shared theme file into:

- `src/popup/popup-theme.css`

The popup entry imports that file after `material-theme.css` and `usage-progress.css`, preserving popup-specific card and progress overrides as the final popup layer. The sidepanel entry intentionally does not load this popup-only CSS module.

## Review Coverage

- `npm run phase245:review`
  - verifies `phase245:review` package script wiring
  - verifies popup import order is `material-theme.css`, `usage-progress.css`, then `popup-theme.css`
  - verifies the sidepanel entry does not import `popup-theme.css`
  - verifies popup-only selectors no longer live in `material-theme.css`
  - starts Vite, opens the popup preview at balanced and narrow widths, captures both states, and verifies shell sizing, card radius, provider-card elevation, provider-header flex layout, progress grid layout, actions flex layout, and horizontal overflow
- `npm run phase244:review`
  - reuses the sidepanel form-control CSS split gate after popup-only CSS was removed from the shared theme

## Commands

- `npm run phase245:review`
- `npm run phase244:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
