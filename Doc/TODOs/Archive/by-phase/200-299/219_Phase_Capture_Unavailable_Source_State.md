# Phase 219 - Capture Unavailable Source State

Date: 2026-04-29

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-29

## Goal

Make unreadable open provider pages visible as a first-class `capture_unavailable` source state.

## Completed Work

- Added `capture_unavailable` to the provider source-state type and localized display-copy contract.
- Mapped typed `page_session.capture_unavailable` diagnostics to a dedicated error source state.
- Preserved the raw warning reason as source-state detail so operator evidence remains inspectable.
- Updated popup status/detail copy so the current page session is described as open but unreadable.
- Added dashboard card and theme-recovery review handling for the new state.
- Updated diagnostic presentation copy in English and zh-CN to identify the extension-read boundary.

## Preserved Boundaries

- No provider parser, host permission request, credential storage, source-selection order, or page-binding persistence behavior changed.
- No cookies, auth headers, or page credentials are stored.
- Existing `logged_out`, `open_page_required`, and generic `sync_error` states remain intact.

## Verification

- `npm run test -- --run src/shared/provider-sources.test.ts src/shared/i18n.test.ts src/popup/view-models.test.ts src/sidepanel/view-models.test.ts`
- `npm run typecheck`
- `npm run phase219:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Use the next real Chrome pass to verify a blocked or unreadable Codex or Cursor usage tab presents `Page capture unavailable` in the visible provider surface.
