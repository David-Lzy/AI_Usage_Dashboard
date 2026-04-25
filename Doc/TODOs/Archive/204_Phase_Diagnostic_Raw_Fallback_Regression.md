# Phase 204 - Diagnostic Raw Fallback Regression

Date: 2026-04-25

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-25

## Goal

Prove diagnostic typing remains additive by locking raw fallback behavior for unknown typed diagnostics, absent typed diagnostics, and raw evidence surfaces.

## Completed Work

- Expanded localized diagnostic presentation tests for unknown source-selection, source-fallback, and adapter-error diagnostic codes.
- Added source-state regression coverage for absent typed diagnostics falling back to raw warning pattern matching.
- Added Settings source-card regression coverage for raw selection, fallback, and readiness evidence when typed diagnostic presentation is absent.
- Added Provider Detail input regression coverage for raw warning and fallback evidence when typed diagnostics are unknown.
- Added `phase204:review` to verify test, surface, and closeout-document markers for this compatibility boundary.

## Preserved Boundaries

- Raw diagnostic strings remain the evidence source of truth.
- Typed diagnostics remain optional and backward-compatible.
- Unknown typed diagnostics do not produce localized diagnostic presentation.
- No provider coverage, source-selection behavior, fallback order, archive schema, or screenshot evidence schema changed.

## Verification

- `npm run test -- --run src/shared/i18n.test.ts src/shared/provider-sources.test.ts src/sidepanel/settings-view-models.test.ts src/sidepanel/view-models.test.ts`
- `npm run phase204:review`
- `npm run docs:check`
- `git diff --check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Keep the next phase functionality-first if live authenticated evidence is available. If not, prefer narrow verification or release-readiness work over another broad planning pass.
