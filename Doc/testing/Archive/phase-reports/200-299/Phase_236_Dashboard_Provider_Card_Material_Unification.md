# Phase 236 - Dashboard Provider Card Material Unification

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 236 provider-card Material review scope and verification commands

## Scope

Phase 236 updated dashboard provider cards so they match the Material card, supporting-surface, progress, chip, and action hierarchy already used by Settings and the toolbar popup.

The phase intentionally preserved provider data, sync behavior, source-selection order, Codex/Cursor truth labels, and source-page recovery behavior.

## Review Coverage

- component rendering test for the new provider-card hierarchy
- static marker review for `ProviderCard`, theme CSS, tests, docs, and package script wiring
- Playwright dashboard visual review at:
  - `360px` side-panel width
  - `420px` side-panel width
  - `1366px` full-page width
- light and dark theme checks
- seeded Codex structured usage-window review so the visual pass proves multi-window quota progress still remains visible
- overflow, footer action-density, Material surface shape/elevation, supporting-surface border, and state-toned card checks

## Commands

- `npm run phase236:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Artifact Path

The repeatable review writes screenshots and JSON output under:

- `tmp/phase236-dashboard-provider-card-material-review/`
