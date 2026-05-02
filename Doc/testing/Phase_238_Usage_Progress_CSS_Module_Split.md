# Phase 238 - Usage Progress CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 238 shared progress CSS ownership split and regression checks

## Scope

Phase 238 moved shared quota progress styling from the oversized shared theme file into:

- `src/sidepanel/theme/usage-progress.css`

The side-panel entry imports that file after `material-theme.css` and before `provider-card.css`, preserving the provider-card override order established in Phase 237. The popup entry imports the same progress module after the shared Material theme so circular usage progress keeps the same base styles.

## Review Coverage

- `npm run phase238:review`
  - verifies `phase238:review` package script wiring
  - verifies sidepanel import order is `material-theme.css`, then `usage-progress.css`, then `provider-card.css`
  - verifies popup import order is `material-theme.css`, then `usage-progress.css`
  - verifies shared progress selectors and keyframes no longer live in `material-theme.css`
  - verifies closeout docs and the phase index reference the completed split
- `npm run phase236:review`
  - reuses the Phase 236 Playwright dashboard visual review after the CSS split
  - checks light/dark, `360px`, `420px`, and full-page dashboard provider cards
  - verifies Codex structured usage-window progress, footer action density, and no horizontal overflow

## Commands

- `npm run phase238:review`
- `npm run phase236:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
