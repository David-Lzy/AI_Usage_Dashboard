# Phase 211 - Popup Appearance Preferences

Date: 2026-04-26

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-26

## Goal

Add controlled popup size, corner, and shadow preferences while preserving the existing quota-first toolbar popup.

## Completed Work

- Added persisted popup size, corner, and shadow preferences.
- Added Settings controls for popup appearance.
- Added storage normalization and legacy defaults for missing or invalid popup appearance values.
- Applied popup appearance through root `data-popup-*` attributes.
- Added popup-only CSS width, radius, and shadow presets.
- Updated the static popup bootstrap width style so configurable width is not blocked by the first-paint contract.
- Added `phase211:review` for static marker verification.

## Preserved Boundaries

- No provider coverage, parser, source-selection, sync, permission, release-package, sidebar, or full-page behavior changed.
- The default popup still matches the current balanced width, rounded cards, and soft shadow.
- Settings remains the full configuration surface.
- Provider coverage gaps still exist and remain truthful.

## Verification

- `npm run test -- --run src/shared/storage.test.ts`
- `npm run phase211:review`
- `npm run docs:check`
- `git diff --check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Capture the real native toolbar popup after extension reload and check `compact`, `balanced`, and `wide` presets against the current circular quota card density.
