# Phase 209 - Popup Circular Usage Progress

Date: 2026-04-26

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-26

## Goal

Switch the toolbar popup's structured usage-window presentation from compact quota text into circular usage progress indicators.

## Completed Work

- Added popup-specific circular usage progress data for structured provider usage windows.
- Rendered each structured popup usage window as an accessible remaining-percent circle.
- Kept summary-only provider usage context on the existing compact text fallback.
- Preserved the `Phase 208` dashboard and provider-detail bars unchanged.
- Added focused view-model assertions and `phase209:review`.

## Preserved Boundaries

- No provider parser, source-selection, sync, extension permission, release-package, or archive behavior changed.
- Circular usage progress is only rendered from already-normalized structured usage windows.
- Flex credit balances remain supplemental context rather than primary circular progress.
- dashboard and provider-detail bars remain unchanged.

## Verification

- `npm run test -- --run src/popup/view-models.test.ts`
- `npm run phase209:review`
- `npm run docs:check`
- `git diff --check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Run a compact popup visual pass after the next real authenticated provider capture if more than two or three structured usage windows appear in the same popup card.
