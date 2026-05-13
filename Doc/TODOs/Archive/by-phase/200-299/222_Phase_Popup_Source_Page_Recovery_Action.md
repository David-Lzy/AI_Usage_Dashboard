# Phase 222 - Popup Source Page Recovery Action

Date: 2026-04-29

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-29

## Goal

Add popup source-page recovery for shipped session-page provider states.

## Completed Work

- Added `source-page` as a popup guidance action kind.
- Updated popup featured-provider action selection so Codex/Cursor-style source-page recovery states use `Open source page` instead of generic detail review.
- Localized the new popup action label in `en` and `zh-CN`.
- Added popup runtime handling that focuses a matching provider tab or opens the concrete provider source page and saves the page binding.
- Added regression coverage for Codex `capture_unavailable` popup action selection and localization.

## Preserved Boundaries

- No provider parser, source-selection order, host-permission, or credential behavior changed.
- Deferred session-page tracks still do not expose direct popup source-page recovery.
- The popup action still avoids raw cookie or auth-header storage and uses the existing page-binding message.

## Verification

- `npm run test -- --run src/popup/view-models.test.ts`
- `npm run typecheck`
- `npm run phase222:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Validate the native toolbar popup in RDP Chrome with a real Codex or Cursor source-page failure state, then click the popup action to confirm tab focus/open plus binding persistence.
