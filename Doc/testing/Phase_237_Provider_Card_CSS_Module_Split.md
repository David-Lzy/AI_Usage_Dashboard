# Phase 237 - Provider Card CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 237 CSS ownership split and regression checks

## Scope

Phase 237 moved dashboard provider-card styling from the oversized shared theme file into:

- `src/sidepanel/theme/provider-card.css`

The side-panel entry imports that file after `material-theme.css` so provider-card primary action styling keeps the cascade order established in Phase 236.

## Review Coverage

- `npm run phase237:review`
  - verifies `phase237:review` package script wiring
  - verifies `provider-card.css` is imported after `material-theme.css`
  - verifies provider-card summary and primary-action styles no longer live in `material-theme.css`
  - verifies closeout docs and the phase index reference the completed split
- `npm run phase236:review`
  - reuses the Phase 236 Playwright dashboard visual review after the CSS split
  - checks light/dark, `360px`, `420px`, and full-page dashboard provider cards
  - verifies Codex structured usage-window progress, footer action density, and no horizontal overflow

## Commands

- `npm run phase237:review`
- `npm run phase236:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
