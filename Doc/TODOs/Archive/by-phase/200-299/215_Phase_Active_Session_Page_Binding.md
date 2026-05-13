# Phase 215 - Active Session Page Binding

Date: 2026-04-29

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-29

## Goal

Let an operator bind the currently active matching Codex or Cursor usage page from Settings without relying only on tab discovery or opening a new provider page.

## Completed Work

- Added shared session-page route-hint URL matching for active-tab validation.
- Added the Settings `Use current page` action for shipped session-page tracks.
- Saved a validated active tab as a bound page with URL, title, tab id, and timestamp.
- Triggered an immediate provider refresh after a successful active-page attach.
- Localized the new action label in English and Simplified Chinese.

## Preserved Boundaries

- No raw cookies, auth headers, or page credentials are stored.
- Deferred session-page tracks stay blocked from this action.
- Non-matching active tabs are rejected instead of being saved as ambiguous bindings.
- Existing `Find or open page` behavior remains unchanged.

## Verification

- `npm run test -- --run src/shared/provider-sources.test.ts`
- `npm run typecheck`
- `npm run phase215:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

The next real-provider pass can now use Settings `Use current page` after opening a real Codex or Cursor usage page in the active Chrome tab.
